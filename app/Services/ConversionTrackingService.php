<?php

namespace App\Services;

use App\Models\Order;

interface ConversionTrackingService
{
    /**
     * Track a purchase order via Meta Conversions API.
     */
    public function trackPurchase(Order $order): void;

    /**
     * Test Meta Conversions API connection.
     */
    public function testConnection(?string $pixelId = null, ?string $accessToken = null, ?string $testEventCode = null): array;
}
