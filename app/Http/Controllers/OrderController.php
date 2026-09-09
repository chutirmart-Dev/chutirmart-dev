<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function confirmation(string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['items.product.images' => fn ($q) => $q->where('is_main', true)])
            ->firstOrFail();

        if (! $order->meta_purchase_event_id) {
            $order->meta_purchase_event_id = (string) Str::uuid();
            $order->saveQuietly();
        }

        return Inertia::render('Storefront/OrderConfirmation', [
            'order' => $order,
        ]);
    }

    public function track(Request $request)
    {
        $request->validate([
            'order_number' => 'required|string',
            'mobile' => 'required|string',
        ]);

        $order = Order::where('order_number', $request->order_number)
            ->where('mobile', $request->mobile)
            ->with(['items.product.images' => fn ($q) => $q->where('is_main', true)])
            ->first();

        if (! $order) {
            return back()->withErrors(['track' => 'সঠিক অর্ডার নম্বর বা মোবাইল নম্বর দিন।']);
        }

        return Inertia::render('Storefront/OrderTracking', [
            'order' => $order,
        ]);
    }
}
