<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDashboardController extends Controller
{
    /**
     * Display the customer dashboard.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $userId = $user->id;
        $phone = $user->phone;
        $email = $user->email;

        $cleanPhone = preg_replace('/[^0-9]/', '', (string) $phone);
        $shortPhone = strlen($cleanPhone) >= 10 ? substr($cleanPhone, -10) : $cleanPhone;

        // Match orders by user_id, phone, customer, or email
        $ordersQuery = Order::query()
            ->where(function ($q) use ($userId, $phone, $shortPhone, $email) {
                $hasCondition = false;

                if ($userId) {
                    $q->where('user_id', $userId);
                    $hasCondition = true;
                }

                if ($phone) {
                    $method = $hasCondition ? 'orWhere' : 'where';
                    $q->$method('mobile', $phone);
                    $hasCondition = true;
                }

                if ($shortPhone) {
                    $method = $hasCondition ? 'orWhere' : 'where';
                    $q->$method('mobile', 'like', "%{$shortPhone}%");
                    $q->orWhereHas('customer', function ($cq) use ($shortPhone) {
                        $cq->where('mobile', 'like', "%{$shortPhone}%");
                    });
                    $hasCondition = true;
                }

                if ($email) {
                    $method = $hasCondition ? 'orWhere' : 'where';
                    $q->$method('special_notes', 'like', "%{$email}%");
                    $q->orWhereHas('customer', function ($cq) use ($email) {
                        $cq->where('email', $email);
                    });
                    $hasCondition = true;
                }

                if (! $hasCondition) {
                    $q->whereRaw('1 = 0');
                }
            });

        $runningStatuses = ['pending', 'confirmed', 'processing', 'shipped'];

        $totalOrders = (clone $ordersQuery)->count();
        $runningOrders = (clone $ordersQuery)->whereIn('status', $runningStatuses)->count();
        $amountSpent = (clone $ordersQuery)->whereIn('status', ['delivered'])->sum('total');

        $recentOrders = (clone $ordersQuery)
            ->with(['items.product'])
            ->latest()
            ->take(20)
            ->get([
                'id',
                'order_number',
                'customer_name',
                'mobile',
                'district',
                'thana',
                'address',
                'subtotal',
                'delivery_charge',
                'coupon_discount',
                'courier_name',
                'total',
                'status',
                'payment_method',
                'payment_status',
                'created_at',
                'courier_tracking_code',
                'consignment_id',
            ])
            ->map(fn ($order) => array_merge($order->toArray(), [
                'tracking_url' => $order->tracking_url,
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                    'variant_info' => $item->variant_info,
                ]),
            ]));

        return Inertia::render('Customer/Dashboard', [
            'stats' => [
                'total_orders' => $totalOrders,
                'running_orders' => $runningOrders,
                'amount_spent' => $amountSpent,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
