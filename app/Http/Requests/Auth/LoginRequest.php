<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $loginInput = trim((string) $this->input('email'));
        $isEmail = filter_var($loginInput, FILTER_VALIDATE_EMAIL);
        $field = $isEmail ? 'email' : 'phone';

        $credentials = [
            $field => $loginInput,
            'password' => $this->input('password'),
        ];

        $authenticated = Auth::attempt($credentials, $this->boolean('remember'));

        // If not authenticated and field is a phone number, test common phone variations (+880, 880, 01)
        if (! $authenticated && ! $isEmail) {
            $altCandidates = [];
            if (str_starts_with($loginInput, '+880')) {
                $altCandidates[] = '0'.substr($loginInput, 4);
                $altCandidates[] = substr($loginInput, 3);
            } elseif (str_starts_with($loginInput, '880')) {
                $altCandidates[] = '0'.substr($loginInput, 3);
                $altCandidates[] = '+'.$loginInput;
            } elseif (str_starts_with($loginInput, '01')) {
                $altCandidates[] = '+88'.$loginInput;
                $altCandidates[] = '88'.$loginInput;
            }

            foreach ($altCandidates as $altPhone) {
                if (Auth::attempt(['phone' => $altPhone, 'password' => $this->input('password')], $this->boolean('remember'))) {
                    $authenticated = true;
                    break;
                }
            }
        }

        if (! $authenticated) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower(trim((string) $this->input('email'))).'|'.$this->ip());
    }
}
