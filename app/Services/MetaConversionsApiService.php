<?php

namespace App\Services;

use App\Models\Order;
use App\Models\StoreSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MetaConversionsApiService implements ConversionTrackingService
{
    /**
     * Track a purchase order via Meta Conversions API.
     */
    public function trackPurchase(Order $order): void
    {
        // 1. Guard against duplicate conversion events
        if ($order->meta_purchase_sent) {
            return;
        }

        // 2. Generate or reuse deterministic event_id
        $eventId = $order->meta_purchase_event_id;
        if (! $eventId) {
            $eventId = (string) Str::uuid();
            $order->meta_purchase_event_id = $eventId;
            $order->saveQuietly();
        }

        // 3. Resolve credentials from config or StoreSetting fallback
        $pixelId = config('services.meta.pixel_id') ?: StoreSetting::getValue('facebook_pixel_id');
        $accessToken = config('services.meta.access_token') ?: StoreSetting::getValue('facebook_access_token');
        $apiVersion = config('services.meta.api_version', 'v21.0');
        $testEventCode = config('services.meta.test_event_code') ?: StoreSetting::getValue('facebook_test_event_code');
        $verifySsl = (bool) config('services.meta.verify_ssl', ! app()->isLocal());

        if (empty($pixelId) || empty($accessToken)) {
            Log::info("Meta CAPI: Skipped Purchase event for Order #{$order->order_number} - Pixel ID or Access Token is not configured.");

            return;
        }

        // 4. Normalize & Hash User Data
        $userData = $this->buildUserData($order);

        // 5. Build Custom eCommerce Data
        $customData = $this->buildCustomData($order);

        // 6. Build Meta Event Payload
        $eventData = [
            'event_name' => 'Purchase',
            'event_time' => Carbon::now()->timestamp,
            'event_id' => $eventId,
            'action_source' => 'website',
            'event_source_url' => url("/order/confirmation/{$order->order_number}"),
            'user_data' => $userData,
            'custom_data' => $customData,
        ];

        $payload = [
            'data' => [$eventData],
        ];

        // Append test_event_code at root payload level (as required by Meta) and inside event data
        if (! empty($testEventCode)) {
            $payload['test_event_code'] = $testEventCode;
            $eventData['test_event_code'] = $testEventCode;
            $payload['data'] = [$eventData];
        }

        $endpoint = "https://graph.facebook.com/{$apiVersion}/{$pixelId}/events";

        try {
            $response = Http::timeout(10)
                ->withOptions(['verify' => $verifySsl])
                ->post($endpoint, $payload + ['access_token' => $accessToken]);

            if ($response->successful()) {
                $order->meta_purchase_sent = true;
                $order->meta_purchase_sent_at = now();
                $order->saveQuietly();

                Log::info("Meta CAPI: Purchase event recorded successfully for Order #{$order->order_number}", [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'event_id' => $eventId,
                    'events_received' => $response->json('events_received', 1),
                ]);
            } else {
                Log::error("Meta CAPI: Failed to send Purchase event for Order #{$order->order_number}", [
                    'status' => $response->status(),
                    'error' => $response->json('error') ?: $response->body(),
                    'order_id' => $order->id,
                    'event_id' => $eventId,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error("Meta CAPI: Network or client exception for Order #{$order->order_number}: {$e->getMessage()}", [
                'order_id' => $order->id,
                'event_id' => $eventId,
            ]);
        }
    }

    /**
     * Normalize and hash user identification data according to Meta requirements.
     */
    protected function buildUserData(Order $order): array
    {
        $userData = [];

        // Phone normalization (E.164 format: digits only, ensuring 88 country code prefix)
        $rawPhone = $order->mobile ?: $order->customer?->mobile;
        if (! empty($rawPhone)) {
            $cleanedPhone = preg_replace('/\D+/', '', (string) $rawPhone);
            if (str_starts_with($cleanedPhone, '01') && strlen($cleanedPhone) === 11) {
                $cleanedPhone = '88'.$cleanedPhone;
            } elseif (str_starts_with($cleanedPhone, '1') && strlen($cleanedPhone) === 10) {
                $cleanedPhone = '880'.$cleanedPhone;
            }
            $userData['ph'] = [hash('sha256', $cleanedPhone)];
        }

        // Email normalization
        $rawEmail = $order->customer?->email ?: $order->user?->email;
        if (! empty($rawEmail)) {
            $normalizedEmail = strtolower(trim((string) $rawEmail));
            $userData['em'] = [hash('sha256', $normalizedEmail)];
        }

        // Name normalization (first & last name)
        $rawName = trim((string) ($order->customer_name ?: $order->customer?->name));
        if (! empty($rawName)) {
            $nameParts = preg_split('/\s+/', $rawName, 2);
            $fn = strtolower($nameParts[0]);
            $userData['fn'] = [hash('sha256', $fn)];

            if (! empty($nameParts[1])) {
                $ln = strtolower($nameParts[1]);
                $userData['ln'] = [hash('sha256', $ln)];
            }
        }

        // District as City
        if (! empty($order->district)) {
            $city = strtolower(trim((string) $order->district));
            $userData['ct'] = [hash('sha256', $city)];
        }

        // Country: Bangladesh ('bd')
        $userData['country'] = [hash('sha256', 'bd')];

        // External ID
        $customerId = $order->customer_id ?: $order->customer?->id;
        if (! empty($customerId)) {
            $userData['external_id'] = [hash('sha256', (string) $customerId)];
        }

        // Technical tracking: IP address & User Agent (stored on order or fallback to request)
        $clientIp = $order->ip_address ?: (request() ? request()->ip() : null);
        if (! empty($clientIp)) {
            $userData['client_ip_address'] = $clientIp;
        }

        $clientUa = $order->user_agent ?: (request() ? request()->userAgent() : null);
        if (! empty($clientUa)) {
            $userData['client_user_agent'] = $clientUa;
        }

        // Meta Browser Cookies (_fbp, _fbc)
        $fbp = $order->fbp ?: Cookie::get('_fbp') ?: (request() ? request()->cookie('_fbp') : null);
        if (! empty($fbp)) {
            $userData['fbp'] = (string) $fbp;
        }

        $fbc = $order->fbc ?: Cookie::get('_fbc') ?: (request() ? request()->cookie('_fbc') : null);
        if (! empty($fbc)) {
            $userData['fbc'] = (string) $fbc;
        }

        return $userData;
    }

    /**
     * Build eCommerce custom data payload.
     */
    protected function buildCustomData(Order $order): array
    {
        $order->loadMissing('items.product');

        $contents = [];
        $contentIds = [];
        $numItems = 0;

        foreach ($order->items as $item) {
            $productId = (string) ($item->product?->product_code ?: $item->product_id);
            $qty = (int) $item->quantity;
            $unitPrice = (float) $item->unit_price;

            $contents[] = [
                'id' => $productId,
                'quantity' => $qty,
                'item_price' => $unitPrice,
            ];

            $contentIds[] = $productId;
            $numItems += $qty;
        }

        return [
            'value' => (float) $order->total,
            'currency' => 'BDT',
            'order_id' => $order->order_number,
            'content_type' => 'product',
            'content_ids' => array_values(array_unique($contentIds)),
            'contents' => $contents,
            'num_items' => $numItems,
        ];
    }

    /**
     * Test Meta Conversions API connection with given or configured credentials.
     */
    public function testConnection(?string $pixelId = null, ?string $accessToken = null, ?string $testEventCode = null): array
    {
        $pixelId = $pixelId ?: config('services.meta.pixel_id') ?: StoreSetting::getValue('facebook_pixel_id');
        $accessToken = $accessToken ?: config('services.meta.access_token') ?: StoreSetting::getValue('facebook_access_token');
        $apiVersion = config('services.meta.api_version', 'v21.0');
        $testEventCode = $testEventCode ?: config('services.meta.test_event_code') ?: StoreSetting::getValue('facebook_test_event_code');
        $verifySsl = (bool) config('services.meta.verify_ssl', ! app()->isLocal());

        if (empty($pixelId) || empty($accessToken)) {
            return [
                'success' => false,
                'message' => 'Facebook Pixel ID অথবা Conversions API Access Token সেট করা নেই।',
            ];
        }

        $testEventId = 'test-conn-'.Str::uuid();
        $eventData = [
            'event_name' => 'PageView',
            'event_time' => Carbon::now()->timestamp,
            'event_id' => $testEventId,
            'action_source' => 'website',
            'event_source_url' => app()->isLocal() ? 'https://chutirmart.com/' : url('/'),
            'user_data' => [
                'client_ip_address' => (request() && request()->ip() !== '127.0.0.1') ? request()->ip() : '103.100.50.25',
                'client_user_agent' => (request() && request()->userAgent()) ? request()->userAgent() : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'country' => [hash('sha256', 'bd')],
            ],
            'custom_data' => [
                'status' => 'test_connection_successful',
            ],
        ];

        $postData = [
            'data' => [$eventData],
            'access_token' => $accessToken,
        ];

        if (! empty($testEventCode)) {
            $eventData['test_event_code'] = $testEventCode;
            $postData['test_event_code'] = $testEventCode;
            $postData['data'] = [$eventData];
        }

        $endpoint = "https://graph.facebook.com/{$apiVersion}/{$pixelId}/events";

        try {
            $response = Http::timeout(10)
                ->withOptions(['verify' => $verifySsl])
                ->post($endpoint, $postData);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Meta CAPI কানেকশন সফল হয়েছে!',
                    'events_received' => $response->json('events_received', 1),
                    'fbtrace_id' => $response->json('fbtrace_id'),
                ];
            }

            $error = $response->json('error');
            $errorMsg = is_array($error) ? ($error['message'] ?? json_encode($error)) : $response->body();

            return [
                'success' => false,
                'message' => 'Meta API এরর: '.$errorMsg,
                'status' => $response->status(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'কানেকশন ব্যর্থ হয়েছে: '.$e->getMessage(),
            ];
        }
    }
}
