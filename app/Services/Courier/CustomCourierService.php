<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Support\Str;

class CustomCourierService implements CourierServiceInterface
{
    protected string $courierName;

    protected string $trackingUrlTemplate;

    public function __construct()
    {
        $this->courierName = (string) StoreSetting::getValue('custom_courier_name', 'Custom Courier');
        $this->trackingUrlTemplate = (string) StoreSetting::getValue('custom_courier_tracking_url', '');
    }

    public function sendOrder(Order $order): array
    {
        $consignmentId = 'MAN-'.strtoupper(Str::random(6)).'-'.rand(100, 999);

        return [
            'success' => true,
            'courier_name' => 'custom',
            'consignment_id' => $consignmentId,
            'tracking_code' => $consignmentId,
            'status' => 'pending',
            'message' => "Order assigned to {$this->courierName}! Consignment: {$consignmentId}",
            'raw' => [
                'type' => 'manual',
                'courier_name' => $this->courierName,
                'assigned_at' => now()->toIso8601String(),
            ],
        ];
    }

    public function trackOrder(Order $order): array
    {
        return [
            'success' => true,
            'status' => $order->courier_status ?: 'in_transit',
            'message' => 'Manual dispatch tracking.',
            'raw' => [],
        ];
    }

    public function checkBalance(): array
    {
        return [
            'success' => true,
            'message' => 'Custom courier service ready.',
        ];
    }

    public function testConnection(): array
    {
        return [
            'success' => true,
            'message' => 'Custom courier channel ready.',
        ];
    }
}
