<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\StoreSetting;

class CourierManager
{
    /**
     * Resolve courier service instance by name or default.
     */
    public static function resolve(?string $courierName = null): CourierServiceInterface
    {
        $name = strtolower($courierName ?: (string) StoreSetting::getValue('default_courier', 'steadfast'));

        return match ($name) {
            'steadfast' => new SteadfastCourierService,
            'paperfly' => new PaperflyCourierService,
            'carrybee' => new CarrybeeCourierService,
            'pathao' => new PathaoCourierService,
            'redx' => new RedXCourierService,
            'custom' => new CustomCourierService,
            default => new SteadfastCourierService,
        };
    }

    /**
     * Send order to courier partner.
     */
    public static function sendOrder(Order $order, ?string $courierName = null): array
    {
        $courier = self::resolve($courierName);
        $result = $courier->sendOrder($order);

        if ($result['success']) {
            $order->update([
                'courier_name' => $result['courier_name'] ?? ($courierName ?: 'steadfast'),
                'consignment_id' => $result['consignment_id'] ?? null,
                'courier_tracking_code' => $result['tracking_code'] ?? null,
                'courier_status' => $result['status'] ?? 'pending',
                'courier_response' => $result['raw'] ?? null,
                'courier_sent_at' => now(),
                'status' => 'processing', // Move to processing
            ]);
        }

        return $result;
    }

    /**
     * Fetch real-time tracking status from courier and update order.
     */
    public static function trackOrder(Order $order): array
    {
        if (empty($order->courier_name)) {
            return [
                'success' => false,
                'message' => 'This order has not been dispatched to any courier partner yet.',
            ];
        }

        $courier = self::resolve($order->courier_name);
        $result = $courier->trackOrder($order);

        if ($result['success'] && ! empty($result['status'])) {
            $order->update([
                'courier_status' => $result['status'],
                'courier_response' => $result['raw'] ?? $order->courier_response,
            ]);
        }

        return $result;
    }

    /**
     * Get list of all supported couriers with their configuration status.
     */
    public static function getSupportedCouriers(): array
    {
        return [
            [
                'id' => 'steadfast',
                'name' => 'Steadfast Courier',
                'logo' => 'https://steadfast.com.bd/images/logo.png',
                'description' => 'Fastest Cash on Delivery coverage across 64 districts in Bangladesh.',
                'is_enabled' => (bool) StoreSetting::getValue('steadfast_enabled', 'true'),
                'is_default' => StoreSetting::getValue('default_courier', 'steadfast') === 'steadfast',
            ],
            [
                'id' => 'paperfly',
                'name' => 'Paperfly Courier',
                'logo' => 'https://paperfly.com.bd/images/logo.png',
                'description' => 'Nationwide door-to-door delivery with Wings API integration.',
                'is_enabled' => (bool) StoreSetting::getValue('paperfly_enabled', 'false'),
                'is_default' => StoreSetting::getValue('default_courier', 'steadfast') === 'paperfly',
            ],
            [
                'id' => 'carrybee',
                'name' => 'Carrybee Courier',
                'logo' => 'https://carrybee.com/logo.png',
                'description' => 'Reliable modern delivery partner with instant API dispatch.',
                'is_enabled' => (bool) StoreSetting::getValue('carrybee_enabled', 'false'),
                'is_default' => StoreSetting::getValue('default_courier', 'steadfast') === 'carrybee',
            ],
            [
                'id' => 'pathao',
                'name' => 'Pathao Courier',
                'logo' => 'https://pathao.com/images/pathao-logo.png',
                'description' => 'Leading on-demand delivery network with automated tracking.',
                'is_enabled' => (bool) StoreSetting::getValue('pathao_enabled', 'false'),
                'is_default' => StoreSetting::getValue('default_courier', 'steadfast') === 'pathao',
            ],
            [
                'id' => 'redx',
                'name' => 'RedX Courier',
                'logo' => 'https://redx.com.bd/images/redx-logo.svg',
                'description' => 'Comprehensive nationwide logistics and doorstep parcel pickup.',
                'is_enabled' => (bool) StoreSetting::getValue('redx_enabled', 'false'),
                'is_default' => StoreSetting::getValue('default_courier', 'steadfast') === 'redx',
            ],
            [
                'id' => 'custom',
                'name' => 'Custom / Manual Courier',
                'logo' => '',
                'description' => 'Manual dispatch via SA Paribahan, Sundarban, eCourier, or in-house riders.',
                'is_enabled' => (bool) StoreSetting::getValue('custom_courier_enabled', 'true'),
                'is_default' => StoreSetting::getValue('default_courier', 'steadfast') === 'custom',
            ],
        ];
    }
}
