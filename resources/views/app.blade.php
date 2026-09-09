<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'ChutirMart') }}</title>

        <!-- Dynamic Favicon & Analytics -->
        @php
            $favicon = \App\Models\StoreSetting::getValue('favicon');
            $gtmContainerId = config('services.gtm.container_id') ?: \App\Models\StoreSetting::getValue('gtm_container_id');
            $facebookPixelId = config('services.meta.pixel_id') ?: \App\Models\StoreSetting::getValue('facebook_pixel_id');
        @endphp
        @if($favicon)
            <link rel="icon" href="{{ $favicon }}" type="image/x-icon">
            <link rel="shortcut icon" href="{{ $favicon }}" type="image/x-icon">
        @endif

        <!-- Meta Facebook Pixel Code -->
        @if($facebookPixelId)
        <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        @php
            $authUserData = [];
            if (auth()->check()) {
                $authUser = auth()->user();
                if (!empty($authUser->email)) {
                    $authUserData['em'] = hash('sha256', strtolower(trim($authUser->email)));
                }
                $phone = $authUser->mobile ?? $authUser->phone ?? null;
                if (!empty($phone)) {
                    $cleanedPhone = preg_replace('/\D+/', '', $phone);
                    if (str_starts_with($cleanedPhone, '01') && strlen($cleanedPhone) === 11) {
                        $cleanedPhone = '88'.$cleanedPhone;
                    } elseif (str_starts_with($cleanedPhone, '1') && strlen($cleanedPhone) === 10) {
                        $cleanedPhone = '880'.$cleanedPhone;
                    }
                    $authUserData['ph'] = hash('sha256', $cleanedPhone);
                }
                if (!empty($authUser->name)) {
                    $nameParts = preg_split('/\s+/', trim($authUser->name), 2);
                    $authUserData['fn'] = hash('sha256', strtolower($nameParts[0]));
                    if (!empty($nameParts[1])) {
                        $authUserData['ln'] = hash('sha256', strtolower($nameParts[1]));
                    }
                }
            }
        @endphp
        @if(!empty($authUserData))
        fbq('init', '{{ $facebookPixelId }}', {!! json_encode($authUserData) !!});
        @else
        fbq('init', '{{ $facebookPixelId }}');
        @endif

        @php
            $facebookTestCode = config('services.meta.test_event_code') ?: \App\Models\StoreSetting::getValue('facebook_test_event_code');
        @endphp
        @if(!empty($facebookTestCode))
        window.fbTestEventCode = '{{ $facebookTestCode }}';
        fbq('track', 'PageView', {}, { test_event_code: '{{ $facebookTestCode }}' });
        @else
        fbq('track', 'PageView');
        @endif
        </script>
        <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id={{ $facebookPixelId }}&ev=PageView&noscript=1"
        /></noscript>
        @endif
        <!-- End Meta Facebook Pixel Code -->

        <!-- Google Tag Manager -->
        @if($gtmContainerId)
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{{ $gtmContainerId }}');</script>
        @endif
        <!-- End Google Tag Manager -->

        <!-- Preconnect & Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800,900&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-[#F5F3EE] text-gray-900">
        <!-- Google Tag Manager (noscript) -->
        @if($gtmContainerId)
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtmContainerId }}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        @endif
        <!-- End Google Tag Manager (noscript) -->

        @inertia
    </body>
</html>
