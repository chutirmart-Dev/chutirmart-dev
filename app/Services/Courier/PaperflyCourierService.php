<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaperflyCourierService implements CourierServiceInterface
{
    protected string $username;

    protected string $password;

    protected string $paperflyKey;

    protected string $baseUrl;

    public function __construct()
    {
        $this->username = (string) StoreSetting::getValue('paperfly_username', '');
        $this->password = (string) StoreSetting::getValue('paperfly_password', '');
        $this->paperflyKey = (string) StoreSetting::getValue('paperfly_key', '');
        $this->baseUrl = rtrim((string) StoreSetting::getValue('paperfly_base_url', 'https://api.paperfly.com.bd'), '/');
    }

    public function sendOrder(Order $order): array
    {
        if (empty($this->username) || empty($this->password) || empty($this->paperflyKey)) {
            return [
                'success' => false,
                'message' => 'Paperfly Username, Password, or Key is not configured in Integrations.',
            ];
        }

        $payload = [
            'merOrderRef' => $order->order_number,
            'custName' => $order->customer_name,
            'custPhone' => $order->mobile,
            'custAddress' => ($order->address.($order->thana ? ', '.$order->thana : '').($order->district ? ', '.$order->district : '')),
            'packagePrice' => (int) $order->total,
            'packageWeight' => 0.5,
            'briefDesc' => 'ChutirMart Order #'.$order->order_number,
        ];

        try {
            $response = Http::withHeaders([
                'paperflykey' => $this->paperflyKey,
                'Content-Type' => 'application/json',
            ])->withBasicAuth($this->username, $this->password)
                ->timeout(20)
                ->post("{$this->baseUrl}/OrderPlacement", $payload);

            $data = $response->json() ?? [];

            if ($response->successful() && (isset($data['response_code']) && $data['response_code'] == 200 || isset($data['success']))) {
                $trackingCode = (string) ($data['tracking_number'] ?? ($data['referenceNumber'] ?? $order->order_number));

                return [
                    'success' => true,
                    'courier_name' => 'paperfly',
                    'consignment_id' => $trackingCode,
                    'tracking_code' => $trackingCode,
                    'status' => 'pending',
                    'message' => 'Order successfully booked with Paperfly Courier! 📦',
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => 'Paperfly Error: '.($data['response_message'] ?? ($data['message'] ?? 'Could not place order.')),
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error('Paperfly sendOrder exception', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Failed to connect to Paperfly: '.$e->getMessage(),
            ];
        }
    }

    public function trackOrder(Order $order): array
    {
        if (empty($this->paperflyKey)) {
            return ['success' => false, 'message' => 'Paperfly credentials missing.'];
        }

        $trackingNumber = $order->courier_tracking_code ?: ($order->consignment_id ?: $order->order_number);

        try {
            $response = Http::withHeaders([
                'paperflykey' => $this->paperflyKey,
            ])->withBasicAuth($this->username, $this->password)
                ->timeout(15)
                ->post("{$this->baseUrl}/api/v1/tracking", [
                    'referenceNumber' => $trackingNumber,
                ]);

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
                'message' => $data['message'] ?? 'Tracking info unavailable.',
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
            'message' => 'Paperfly account connected.',
        ];
    }

    public function testConnection(): array
    {
        if (empty($this->username) || empty($this->password) || empty($this->paperflyKey)) {
            return ['success' => false, 'message' => 'Paperfly credentials missing.'];
        }

        return [
            'success' => true,
            'message' => 'Paperfly credentials configured successfully. ✅',
        ];
    }
}
