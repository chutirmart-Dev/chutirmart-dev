<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:25|unique:'.User::class.',phone|required_without:email',
            'email' => 'nullable|string|lowercase|email|max:255|unique:'.User::class.',email|required_without:phone',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'phone.required_without' => 'Please provide a mobile number or an email address.',
            'email.required_without' => 'Please provide an email address or a mobile number.',
            'phone.unique' => 'This mobile number is already registered.',
            'email.unique' => 'This email address is already registered.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'phone' => $request->filled('phone') ? trim((string) $request->phone) : null,
            'email' => $request->filled('email') ? trim((string) $request->email) : null,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
