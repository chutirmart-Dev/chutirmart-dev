<?php

namespace App\Providers;

use App\Services\ConversionTrackingService;
use App\Services\MetaConversionsApiService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            ConversionTrackingService::class,
            MetaConversionsApiService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->cleanupStaleViteHotFile();
    }

    /**
     * Delete the public/hot file if the Vite dev server is not actually running.
     * This prevents a blank page when `npm run dev` was killed without cleanup.
     */
    protected function cleanupStaleViteHotFile(): void
    {
        $hotFile = public_path('hot');

        if (! file_exists($hotFile)) {
            return;
        }

        $devServerUrl = trim(file_get_contents($hotFile));

        $isReachable = @fsockopen(
            parse_url($devServerUrl, PHP_URL_HOST) ?? 'localhost',
            parse_url($devServerUrl, PHP_URL_PORT) ?? 5173,
            timeout: 1
        );

        if (! $isReachable) {
            @unlink($hotFile);
        } else {
            fclose($isReachable);
        }
    }
}
