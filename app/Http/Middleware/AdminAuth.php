<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('admin')->check() && ! Auth::check()) {
            if ($request->expectsJson() || $request->ajax() || $request->is('*/courier-stats*')) {
                return response()->json(['error' => 'Unauthenticated Admin.'], 401);
            }

            return redirect()->route('admin.login');
        }

        return $next($request);
    }
}
