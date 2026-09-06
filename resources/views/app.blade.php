<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'ChutirMart') }}</title>

        <!-- Dynamic Favicon -->
        @php
            $favicon = \App\Models\StoreSetting::getValue('favicon');
            $gtmContainerId = config('services.gtm.container_id') ?: \App\Models\StoreSetting::getValue('gtm_container_id');
        @endphp
        @if($favicon)
            <link rel="icon" href="{{ $favicon }}" type="image/x-icon">
            <link rel="shortcut icon" href="{{ $favicon }}" type="image/x-icon">
        @endif

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
