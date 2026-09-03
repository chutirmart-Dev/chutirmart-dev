<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PathaoCourierService implements CourierServiceInterface
{
    protected string $clientId;

    protected string $clientSecret;

    protected string $username;

    protected string $password;

    protected string $storeId;

    protected string $baseUrl;

    public function __construct()
    {
        $this->clientId = (string) StoreSetting::getValue('pathao_client_id', '');
        $this->clientSecret = (string) StoreSetting::getValue('pathao_client_secret', '');
        $this->username = (string) StoreSetting::getValue('pathao_username', '');
        $this->password = (string) StoreSetting::getValue('pathao_password', '');
        $this->storeId = (string) StoreSetting::getValue('pathao_store_id', '');
        $this->baseUrl = rtrim((string) StoreSetting::getValue('pathao_base_url', 'https://api-hermes.pathao.com'), '/');
    }

    protected function getAccessToken(): ?string
    {
        if (empty($this->clientId) || empty($this->clientSecret) || empty($this->username) || empty($this->password)) {
            return null;
        }

        return Cache::remember('pathao_access_token', 3600 * 24, function () {
            try {
                $response = Http::post("{$this->baseUrl}/aladdin/api/v1/issue-token", [
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                    'username' => $this->username,
                    'password' => $this->password,
                    'grant_type' => 'password',
                ]);

                if ($response->successful()) {
                    return $response->json('access_token');
                }
            } catch (\Throwable $e) {
                Log::error('Pathao token issue error', ['error' => $e->getMessage()]);
            }

            return null;
        });
    }

    public function sendOrder(Order $order): array
    {
        $token = $this->getAccessToken();
        if (! $token) {
            return [
                'success' => false,
                'message' => 'Pathao API credentials invalid or token issue failed. Please check Pathao credentials in Integrations.',
            ];
        }

        $payload = [
            'store_id' => (int) ($this->storeId ?: 1),
            'merchant_order_id' => $order->order_number,
            'recipient_name' => $order->customer_name,
            'recipient_phone' => $order->mobile,
            'recipient_address' => ($order->address.($order->thana ? ', '.$order->thana : '').($order->district ? ', '.$order->district : '')),
            'recipient_city' => 1,
            'recipient_zone' => 1,
            'amount_to_collect' => (int) $order->total,
            'item_type' => 1,
            'item_quantity' => 1,
            'item_weight' => 0.5,
            'item_description' => 'ChutirMart Order #'.$order->order_number,
            'special_instruction' => $order->special_notes ?: '',
        ];

        try {
            $response = Http::withToken($token)
                ->timeout(20)
                ->post("{$this->baseUrl}/aladdin/api/v1/orders", $payload);

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['data']['consignment_id'])) {
                $consignmentId = (string) $data['data']['consignment_id'];

                return [
                    'success' => true,
                    'courier_name' => 'pathao',
                    'consignment_id' => $consignmentId,
                    'tracking_code' => $consignmentId,
                    'status' => 'pending',
                    'message' => 'Order successfully dispatched to Pathao Courier! 📦',
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => 'Pathao Error: '.($data['message'] ?? 'Could not create Pathao order.'),
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Failed to connect to Pathao: '.$e->getMessage(),
            ];
        }
    }

    public function trackOrder(Order $order): array
    {
        $token = $this->getAccessToken();
        if (! $token || empty($order->consignment_id)) {
            return ['success' => false, 'message' => 'Pathao tracking requires token and consignment ID.'];
        }

        try {
            $response = Http::withToken($token)
                ->timeout(15)
                ->get("{$this->baseUrl}/aladdin/api/v1/orders/{$order->consignment_id}/info");

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['data']['order_status'])) {
                return [
                    'success' => true,
                    'status' => (string) $data['data']['order_status'],
                    'message' => 'Status: '.$data['data']['order_status'],
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Unable to fetch Pathao status.',
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function checkBalance(): array
    {
        return [
            'success' => true,
            'message' => 'Pathao Courier account linked.',
        ];
    }

    public function testConnection(): array
    {
        $token = $this->getAccessToken();
        if ($token) {
            return [
                'success' => true,
                'message' => 'Pathao token successfully verified! ✅',
            ];
        }

        return [
            'success' => false,
            'message' => 'Failed to issue Pathao access token. Check credentials.',
        ];
    }
}
