<?php

use App\Http\Middleware\AdminAuth;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Encryption\MissingAppKeyException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin.auth' => AdminAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (MissingAppKeyException $e, Request $request) {
            Log::error('Application key missing or invalid: '.$e->getMessage());

            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'সার্ভারে সাময়িক সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
            }

            return response()->view('errors.500', [], 500);
        });
    })->create();
