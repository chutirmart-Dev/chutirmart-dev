<?php

namespace App\Services\Courier;

use App\Models\Order;

interface CourierServiceInterface
{
    /**
     * Send order / book parcel with courier.
     */
    public function sendOrder(Order $order): array;

    /**
     * Fetch real-time tracking status from courier.
     */
    public function trackOrder(Order $order): array;

    /**
     * Check merchant current balance if supported.
     */
    public function checkBalance(): array;

    /**
     * Test API connection with courier.
     */
    public function testConnection(): array;
}
