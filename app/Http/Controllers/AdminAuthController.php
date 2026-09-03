<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminAuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'ইমেইল পূরণ করুন',
            'email.email' => 'সঠিক ইমেইল দিন',
            'password.required' => 'পাসওয়ার্ড পূরণ করুন',
        ]);

        if (Auth::guard('admin')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Record login time
            $admin = Auth::guard('admin')->user();
            $admin->update(['last_login_at' => now()]);

            return redirect()->intended(route('admin.dashboard'));
        }

        return back()->withErrors([
            'email' => 'প্রদত্ত ইমেইল বা পাসওয়ার্ড সঠিক নয়।',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
