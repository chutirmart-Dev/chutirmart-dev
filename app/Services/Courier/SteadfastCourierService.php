<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SteadfastCourierService implements CourierServiceInterface
{
    protected string $apiKey;

    protected string $secretKey;

    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) StoreSetting::getValue('steadfast_api_key', '');
        $this->secretKey = (string) StoreSetting::getValue('steadfast_client_id', '');
        // Official Steadfast base URL as per latest API docs
        $this->baseUrl = rtrim((string) StoreSetting::getValue('steadfast_base_url', 'https://portal.packzy.com/api/v1'), '/');
    }

    public function sendOrder(Order $order): array
    {
        if (empty($this->apiKey) || empty($this->secretKey)) {
            return [
                'success' => false,
                'message' => 'Steadfast API Key বা Secret Key সেট করা নেই। Integrations পেজে গিয়ে সেট করুন।',
            ];
        }

        // Build full address string
        $addressParts = array_filter([$order->address, $order->thana, $order->district]);
        $fullAddress = implode(', ', $addressParts);

        // Build item description from ordered items
        $itemDesc = $order->items?->map(fn ($i) => $i->product_name.' x'.$i->quantity)->join(', ')
            ?: 'ChutirMart Order #'.$order->order_number;

        $payload = [
            'invoice' => (string) $order->order_number,
            'recipient_name' => (string) $order->customer_name,
            'recipient_phone' => (string) $order->mobile,
            'recipient_address' => $fullAddress ?: 'N/A',
            'cod_amount' => (int) $order->total,
            'note' => $order->special_notes ?: '',
            'item_description' => mb_substr($itemDesc, 0, 250),
            'delivery_type' => 0, // 0 = Home Delivery (default)
        ];

        try {
            $response = Http::withHeaders([
                'Api-Key' => $this->apiKey,
                'Secret-Key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])->timeout(20)->post("{$this->baseUrl}/create_order", $payload);

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['status']) && $data['status'] === 200 && isset($data['consignment'])) {
                $consignment = $data['consignment'];
                $consignmentId = (string) ($consignment['consignment_id'] ?? '');
                $trackingCode = (string) ($consignment['tracking_code'] ?? $consignmentId);
                $status = (string) ($consignment['status'] ?? 'in_review');

                return [
                    'success' => true,
                    'courier_name' => 'steadfast',
                    'consignment_id' => $consignmentId,
                    'tracking_code' => $trackingCode,
                    'status' => $status,
                    'message' => 'Order successfully submitted to Steadfast Courier! 📦',
                    'raw' => $data,
                ];
            }

            $errorMsg = $data['message'] ?? ($data['errors'] ?? 'Steadfast API returned an error.');
            if (is_array($errorMsg)) {
                $errorMsg = implode(' ', array_map(fn ($v) => is_array($v) ? implode(' ', $v) : $v, $errorMsg));
            }

            return [
                'success' => false,
                'message' => 'Steadfast Error: '.$errorMsg,
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error('Steadfast sendOrder exception', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Failed to connect to Steadfast Courier: '.$e->getMessage(),
            ];
        }
    }

    public function trackOrder(Order $order): array
    {
        if (empty($this->apiKey) || empty($this->secretKey)) {
            return ['success' => false, 'message' => 'Steadfast API credentials missing.'];
        }

        $consignmentId = $order->consignment_id;
        $trackingCode = $order->courier_tracking_code;
        $invoice = $order->order_number;

        try {
            $url = $consignmentId
                ? "{$this->baseUrl}/status_by_cid/{$consignmentId}"
                : ($trackingCode ? "{$this->baseUrl}/status_by_trackingcode/{$trackingCode}" : "{$this->baseUrl}/status_by_invoice/{$invoice}");

            $response = Http::withHeaders([
                'Api-Key' => $this->apiKey,
                'Secret-Key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)->get($url);

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['delivery_status'])) {
                return [
                    'success' => true,
                    'status' => $data['delivery_status'],
                    'message' => 'Live status: '.ucfirst(str_replace('_', ' ', $data['delivery_status'])),
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Could not retrieve tracking details.',
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function checkBalance(): array
    {
        if (empty($this->apiKey) || empty($this->secretKey)) {
            return ['success' => false, 'message' => 'Steadfast API credentials missing.'];
        }

        try {
            $response = Http::withHeaders([
                'Api-Key' => $this->apiKey,
                'Secret-Key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])->timeout(15)->get("{$this->baseUrl}/get_balance");

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['current_balance'])) {
                return [
                    'success' => true,
                    'balance' => (float) $data['current_balance'],
                    'message' => 'Current Balance: ৳'.number_format((float) $data['current_balance'], 2),
                    'raw' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => $data['message'] ?? 'Unable to fetch Steadfast balance.',
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function testConnection(): array
    {
        return $this->checkBalance();
    }

    /**
     * Live Steadfast Customer Fraud & Parcel History Check
     * Endpoint: GET /fraud_check/{phone}
     */
    public function checkCustomerFraud(string $phone): array
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($cleaned, '880')) {
            $cleaned = substr($cleaned, 2);
        }

        if (strlen($cleaned) < 10) {
            return [
                'success' => false,
                'message' => 'Invalid phone number for courier lookup.',
            ];
        }

        $cacheKey = "steadfast_fraud_{$cleaned}";

        // 1. Return from cache if present (conserves Steadfast API rate limits)
        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            if (is_array($cached) && ! empty($cached['success'])) {
                return $cached;
            }
        }

        if (empty($this->apiKey) || empty($this->secretKey)) {
            return [
                'success' => false,
                'message' => 'Steadfast API Key or Secret Key missing.',
            ];
        }

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Api-Key' => $this->apiKey,
                'Secret-Key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])->timeout(12)->get("{$this->baseUrl}/fraud_check/{$cleaned}");

            $data = $response->json() ?? [];

            if ($response->successful() && isset($data['total_parcels'])) {
                $total = (int) ($data['total_parcels'] ?? 0);
                $delivered = (int) ($data['total_delivered'] ?? 0);
                $cancelled = (int) ($data['total_cancelled'] ?? 0);
                $fraudReports = $data['total_fraud_reports'] ?? [];
                $rate = $total > 0 ? round(($delivered / $total) * 100) : 0;

                $result = [
                    'success' => true,
                    'total_parcels' => $total,
                    'total_delivered' => $delivered,
                    'total_cancelled' => $cancelled,
                    'total_fraud_reports' => $fraudReports,
                    'fraud_count' => is_array($fraudReports) ? count($fraudReports) : (int) $fraudReports,
                    'success_rate' => $rate,
                    'has_fraud' => ! empty($fraudReports),
                    'source' => 'steadfast_live',
                ];

                // Cache for 7 days to preserve Steadfast quota
                Cache::put($cacheKey, $result, now()->addDays(7));

                return $result;
            }

            $isRateLimited = ($response->status() === 429) || (isset($data['error']) && str_contains(strtolower($data['error']), 'rate limit'));

            return [
                'success' => false,
                'rate_limited' => $isRateLimited,
                'message' => $data['error'] ?? $data['message'] ?? 'Unable to fetch Steadfast fraud stats.',
            ];
        } catch (\Throwable $e) {
            Log::error('Steadfast fraud_check error: '.$e->getMessage());

            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
