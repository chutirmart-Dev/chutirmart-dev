<?php

namespace App\Services;

use App\Models\Order;

interface ConversionTrackingService
{
    /**
     * Track a purchase order via Meta Conversions API.
     */
    public function trackPurchase(Order $order): void;
}
