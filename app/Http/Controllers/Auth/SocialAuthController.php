<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(Request $request): RedirectResponse
    {
        $clientId = config('services.google.client_id');
        $redirectUri = config('services.google.redirect');

        if (empty($clientId) || empty(config('services.google.client_secret'))) {
            return redirect()->route('login')->with('status', 'Google Sign-In is not configured yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.');
        }

        $state = Str::random(40);
        $request->session()->put('google_oauth_state', $state);

        $params = [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'state' => $state,
            'access_type' => 'offline',
            'prompt' => 'select_account',
        ];

        return redirect('https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query($params));
    }

    /**
     * Handle the callback from Google.
     */
    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        if ($request->has('error') || ! $request->has('code')) {
            return redirect()->route('login')->with('status', 'Google sign in was cancelled.');
        }

        $state = $request->session()->pull('google_oauth_state');
        if ($state && $request->input('state') !== $state) {
            return redirect()->route('login')->with('status', 'Invalid authentication session state.');
        }

        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect');

        try {
            $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'code' => $request->input('code'),
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'grant_type' => 'authorization_code',
            ]);

            if ($tokenResponse->failed()) {
                Log::error('Google OAuth token exchange failed', ['response' => $tokenResponse->body()]);

                return redirect()->route('login')->with('status', 'Failed to authenticate with Google. Please try again.');
            }

            $accessToken = $tokenResponse->json('access_token');

            $userResponse = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo');

            if ($userResponse->failed()) {
                Log::error('Google OAuth user profile fetch failed', ['response' => $userResponse->body()]);

                return redirect()->route('login')->with('status', 'Failed to retrieve Google profile.');
            }

            $googleUser = $userResponse->json();
            $googleId = $googleUser['sub'] ?? null;
            $email = $googleUser['email'] ?? null;
            $name = $googleUser['name'] ?? ($googleUser['given_name'] ?? 'Google User');
            $picture = $googleUser['picture'] ?? null;

            if (! $googleId) {
                return redirect()->route('login')->with('status', 'Google authentication failed: missing ID.');
            }

            // Find existing user by google_id or email
            $user = User::where('google_id', $googleId)->first();

            if (! $user && $email) {
                $user = User::where('email', $email)->first();
            }

            if ($user) {
                $updates = [];
                if (! $user->google_id) {
                    $updates['google_id'] = $googleId;
                }
                if (! $user->avatar && $picture) {
                    $updates['avatar'] = $picture;
                }
                if (! empty($updates)) {
                    $user->update($updates);
                }
            } else {
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $picture,
                    'email_verified_at' => now(),
                ]);

                event(new Registered($user));
            }

            Auth::login($user, true);

            $request->session()->regenerate();

            return redirect()->intended(route('dashboard', absolute: false));
        } catch (\Throwable $e) {
            Log::error('Google OAuth error', ['exception' => $e->getMessage()]);

            return redirect()->route('login')->with('status', 'An error occurred during Google Sign-In.');
        }
    }
}
