<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Http;

class RedXCourierService implements CourierServiceInterface
{
    protected string $apiToken;

    protected string $baseUrl;

    public function __construct()
    {
        $this->apiToken = (string) StoreSetting::getValue('redx_api_token', '');
        $this->baseUrl = rtrim((string) StoreSetting::getValue('redx_base_url', 'https://openapi.redx.com.bd/v1.0.0-beta'), '/');
    }

    public function sendOrder(Order $order): array
    {
        if (empty($this->apiToken)) {
            return [
                'success' => false,
                'message' => 'RedX API Token is not configured in Integrations.',
            ];
        }

        $payload = [
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->mobile,
            'delivery_area' => $order->district ?: 'Dhaka',
            'delivery_area_id' => 1,
            'customer_address' => ($order->address.($order->thana ? ', '.$order->thana : '')),
            'merchant_invoice_id' => $order->order_number,
            'cash_collection_amount' => (int) $order->total,
            'parcel_weight' => 500,
            'instruction' => $order->special_notes ?: '',
        ];

        try {
            $response = Http::withHeaders([
                'API-ACCESS-TOKEN' => "Bearer {$this->apiToken}",
                'Content-Type' => 'application/json',
            ])->timeout(20)->post("{$this->baseUrl}/parcels", $payload);

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['tracking_id'])) {
                $trackingId = (string) $data['tracking_id'];

                return [
                    'success' => true,
                    'courier_name' => 'redx',
                    'consignment_id' => $trackingId,
                    'tracking_code' => $trackingId,
                    'status' => 'pending',
                    'message' => 'Order successfully booked with RedX Courier! 📦',
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => 'RedX Error: '.($data['message'] ?? 'Failed to create RedX parcel.'),
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to connect to RedX: '.$e->getMessage(),
            ];
        }
    }

    public function trackOrder(Order $order): array
    {
        if (empty($this->apiToken) || empty($order->consignment_id)) {
            return ['success' => false, 'message' => 'RedX tracking requires token and tracking ID.'];
        }

        try {
            $response = Http::withHeaders([
                'API-ACCESS-TOKEN' => "Bearer {$this->apiToken}",
            ])->timeout(15)->get("{$this->baseUrl}/parcels/track/{$order->consignment_id}");

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['tracking']['status'])) {
                return [
                    'success' => true,
                    'status' => (string) $data['tracking']['status'],
                    'message' => 'Status: '.$data['tracking']['status'],
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Tracking not found on RedX.',
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function checkBalance(): array
    {
        return [
            'success' => true,
            'message' => 'RedX account linked.',
        ];
    }

    public function testConnection(): array
    {
        if (empty($this->apiToken)) {
            return ['success' => false, 'message' => 'RedX API Token is missing.'];
        }

        return [
            'success' => true,
            'message' => 'RedX API Token configured. ✅',
        ];
    }
}
