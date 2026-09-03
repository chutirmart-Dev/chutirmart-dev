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
        @endphp
        @if($favicon)
            <link rel="icon" href="{{ $favicon }}" type="image/x-icon">
            <link rel="shortcut icon" href="{{ $favicon }}" type="image/x-icon">
        @endif

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
        @inertia
    </body>
</html>
