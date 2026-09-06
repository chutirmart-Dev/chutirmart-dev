<?php

namespace App\Http\Middleware;

use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = StoreSetting::getAllCached();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user('admin') ?: $request->user(),
            ],
            'store_settings' => [
                'site_name' => $settings['site_name'] ?? 'ChutirMart',
                'site_tagline' => $settings['site_tagline'] ?? null,
                'site_logo' => $settings['site_logo'] ?? null,
                'favicon' => $settings['favicon'] ?? null,
                'contact_phone' => $settings['contact_phone'] ?? '01700-000000',
                'contact_address' => $settings['contact_address'] ?? 'ঢাকা, বাংলাদেশ',
                'contact_email' => $settings['contact_email'] ?? 'info@chutirmart.com',
                'whatsapp_number' => $settings['whatsapp_number'] ?? '8801700000000',
                'social_facebook' => $settings['social_facebook'] ?? 'https://facebook.com/chutirmart',
                'social_instagram' => $settings['social_instagram'] ?? null,
                'social_youtube' => $settings['social_youtube'] ?? null,
                'footer_about' => $settings['footer_about'] ?? null,
                'footer_link_group_1' => $settings['footer_link_group_1'] ?? null,
                'footer_link_group_2' => $settings['footer_link_group_2'] ?? null,
                'site_logo_mobile' => $settings['site_logo_mobile'] ?? null,
                'copyright_text' => $settings['copyright_text'] ?? '© 2026 ChutirMart. সর্বস্বত্ব সংরক্ষিত।',
                'payment_cod_enabled' => $settings['payment_cod_enabled'] ?? 'true',
                'terms_conditions' => $settings['terms_conditions'] ?? null,
                'refund_policy' => $settings['refund_policy'] ?? null,
                'gtm_container_id' => config('services.gtm.container_id') ?: ($settings['gtm_container_id'] ?? null),
                'facebook_pixel_id' => config('services.meta.pixel_id') ?: ($settings['facebook_pixel_id'] ?? null),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
