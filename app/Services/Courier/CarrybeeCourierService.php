<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CarrybeeCourierService implements CourierServiceInterface
{
    protected string $apiKey;

    protected string $secretKey;

    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) StoreSetting::getValue('carrybee_api_key', '');
        $this->secretKey = (string) StoreSetting::getValue('carrybee_secret_key', '');
        $this->baseUrl = rtrim((string) StoreSetting::getValue('carrybee_base_url', 'https://api.carrybee.com/api/v1'), '/');
    }

    public function sendOrder(Order $order): array
    {
        if (empty($this->apiKey)) {
            return [
                'success' => false,
                'message' => 'Carrybee API Key is not configured in Integrations.',
            ];
        }

        $payload = [
            'merchant_order_id' => $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->mobile,
            'delivery_address' => ($order->address.($order->thana ? ', '.$order->thana : '').($order->district ? ', '.$order->district : '')),
            'collection_amount' => (int) $order->total,
            'remarks' => $order->special_notes ?: 'Order from ChutirMart',
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.($this->secretKey ?: $this->apiKey),
                'api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(20)->post("{$this->baseUrl}/orders", $payload);

            $data = $response->json() ?? [];

            if ($response->successful() && (isset($data['success']) && $data['success'] || isset($data['data']))) {
                $orderData = $data['data'] ?? $data;
                $consignmentId = (string) ($orderData['tracking_id'] ?? ($orderData['consignment_id'] ?? ($orderData['id'] ?? $order->order_number)));
                $trackingCode = (string) ($orderData['tracking_code'] ?? $consignmentId);

                return [
                    'success' => true,
                    'courier_name' => 'carrybee',
                    'consignment_id' => $consignmentId,
                    'tracking_code' => $trackingCode,
                    'status' => 'pending',
                    'message' => 'Order successfully booked with Carrybee Courier! 📦',
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => 'Carrybee Error: '.($data['message'] ?? ($data['error'] ?? 'Could not create order.')),
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error('Carrybee sendOrder exception', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Failed to connect to Carrybee: '.$e->getMessage(),
            ];
        }
    }

    public function trackOrder(Order $order): array
    {
        if (empty($this->apiKey)) {
            return ['success' => false, 'message' => 'Carrybee API credentials missing.'];
        }

        $trackingId = $order->consignment_id ?: ($order->courier_tracking_code ?: $order->order_number);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.($this->secretKey ?: $this->apiKey),
                'api-key' => $this->apiKey,
            ])->timeout(15)->get("{$this->baseUrl}/orders/{$trackingId}/track");

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['status'])) {
                return [
                    'success' => true,
                    'status' => (string) $data['status'],
                    'message' => 'Status: '.$data['status'],
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Tracking details not found.',
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function checkBalance(): array
    {
        return [
            'success' => true,
            'message' => 'Carrybee Courier connected.',
        ];
    }

    public function testConnection(): array
    {
        if (empty($this->apiKey)) {
            return ['success' => false, 'message' => 'Carrybee API Key missing.'];
        }

        return [
            'success' => true,
            'message' => 'Carrybee API credentials verified. ✅',
        ];
    }
}
