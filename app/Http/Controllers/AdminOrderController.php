<?php

namespace App\Http\Controllers;

use App\Jobs\SendMetaPurchaseEvent;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\ConversionTrackingService;
use App\Services\Courier\CourierManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->route('status');
        $period = $request->input('period', 'all');

        $query = Order::query();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $applyPeriod = function ($q) use ($period) {
            match ($period) {
                'today' => $q->whereDate('created_at', today()),
                'yesterday' => $q->whereDate('created_at', today()->subDay()),
                '7_days' => $q->where('created_at', '>=', now()->subDays(7)),
                '30_days' => $q->where('created_at', '>=', now()->subDays(30)),
                '1_year' => $q->where('created_at', '>=', now()->subDays(365)),
                default => null,
            };
        };

        if ($period && $period !== 'all') {
            $applyPeriod($query);
        }

        if ($request->filled('q')) {
            $rawSearch = trim((string) $request->input('q'));
            $cleanSearch = ltrim($rawSearch, '#');

            $query->where(function ($q) use ($rawSearch, $cleanSearch) {
                $q->where('order_number', 'like', "%{$cleanSearch}%")
                    ->orWhere('customer_name', 'like', "%{$rawSearch}%")
                    ->orWhere('mobile', 'like', "%{$cleanSearch}%")
                    ->orWhere('courier_tracking_code', 'like', "%{$cleanSearch}%")
                    ->orWhere('consignment_id', 'like', "%{$cleanSearch}%");
            });
        }

        $orders = $query->with('items')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate count stats with period filter
        $statQuery = function (?string $st = null) use ($applyPeriod, $period) {
            $q = Order::query();
            if ($st) {
                $q->where('status', $st);
            }
            if ($period && $period !== 'all') {
                $applyPeriod($q);
            }

            return $q->count();
        };

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'status' => $status ?? 'all',
            'filters' => $request->only(['q', 'period']),
            'selectedPeriod' => $period,
            'couriers' => CourierManager::getSupportedCouriers(),
            'stats' => [
                'all' => $statQuery(),
                'processing' => $statQuery('processing'),
                'on_hold' => $statQuery('on_hold'),
                'complete' => $statQuery('complete'),
                'cancelled' => $statQuery('cancelled'),
                'trash' => $statQuery('trash'),
                'incomplete' => $statQuery('incomplete'),
            ],
        ]);
    }

    public function show(string $id)
    {
        $order = Order::with(['items.product.images' => fn ($q) => $q->where('is_main', true)])->findOrFail($id);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'couriers' => CourierManager::getSupportedCouriers(),
        ]);
    }

    public function create()
    {
        $products = Product::where('status', 'active')
            ->with(['images' => fn ($q) => $q->where('is_main', true)])
            ->get();

        return Inertia::render('Admin/Orders/Create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        // Support both address / shipping_address and delivery_charge / shipping_charge
        if ($request->filled('shipping_address') && ! $request->filled('address')) {
            $request->merge(['address' => $request->shipping_address]);
        }
        if ($request->filled('shipping_charge') && ! $request->filled('delivery_charge')) {
            $request->merge(['delivery_charge' => $request->shipping_charge]);
        }

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'mobile' => 'required|string|max:20',
            'district' => 'nullable|string',
            'address' => 'required|string',
            'delivery_charge' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $subtotal = 0;
        foreach ($request->items as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }
        $deliveryCharge = (float) $request->delivery_charge;
        $total = $subtotal + $deliveryCharge;

        $orderNumber = $this->generateOrderNumber();

        $order = DB::transaction(function () use ($request, $subtotal, $deliveryCharge, $total, $orderNumber) {
            // Find or create customer
            $customer = Customer::firstOrNew(['mobile' => $request->mobile]);
            $customer->name = $request->customer_name;
            $customer->address = $request->address;
            $customer->district = $request->district ?? 'Dhaka';
            $customer->total_orders = ($customer->total_orders ?? 0) + 1;
            $customer->total_spent = ($customer->total_spent ?? 0) + $total;
            $customer->save();

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customer->id,
                'customer_name' => $request->customer_name,
                'mobile' => $request->mobile,
                'district' => $request->district ?? 'Dhaka',
                'address' => $request->address,
                'subtotal' => $subtotal,
                'delivery_charge' => $deliveryCharge,
                'total' => $total,
                'status' => 'processing',
                'payment_status' => 'pending',
                'payment_method' => 'cod',
            ]);

            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'product_name' => $product ? $product->name : 'Product',
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $item['price'] * $item['quantity'],
                ]);

                // Deduct stock
                if ($product) {
                    $product->decrement('stock_quantity', $item['quantity']);
                    $product->increment('total_sold', $item['quantity']);
                }
            }

            return $order;
        });

        return redirect()->route('admin.orders.index', ['status' => 'all'])->with('success', 'নতুন অর্ডারটি সফলভাবে তৈরি করা হয়েছে! (#'.$orderNumber.') 🎉');
    }

    private function generateOrderNumber(): string
    {
        return Order::generateOrderNumber();
    }

    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|string|in:processing,on_hold,complete,cancelled,trash,incomplete',
            'payment_status' => 'required|string|in:pending,paid,incomplete',
            'internal_notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        $order->update($request->only(['status', 'payment_status', 'internal_notes']));

        // Stock recovery on cancellation
        if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock_quantity', $item->quantity);
                    $item->product->decrement('total_sold', $item->quantity);
                }
            }
        }

        // Deduct stock again if restored from cancelled to processing/complete
        if ($oldStatus === 'cancelled' && $request->status !== 'cancelled') {
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->decrement('stock_quantity', $item->quantity);
                    $item->product->increment('total_sold', $item->quantity);
                }
            }
        }

        // Trigger Meta Conversions API (CAPI) Purchase event asynchronously if transitioned to 'complete'
        if ($oldStatus !== 'complete' && $request->status === 'complete' && ! $order->meta_purchase_sent) {
            $queueConnection = (config('queue.default') === 'database' && app()->isLocal()) ? 'sync' : null;
            $job = SendMetaPurchaseEvent::dispatch($order->fresh());
            if ($queueConnection) {
                $job->onConnection($queueConnection);
            }
        }

        return back()->with('success', 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।');
    }

    public function sendMetaPurchase(string $id, ConversionTrackingService $service)
    {
        $order = Order::findOrFail($id);

        try {
            // Force reset flag to allow admin manual resend/dispatch
            $order->meta_purchase_sent = false;
            $service->trackPurchase($order);
            $order->refresh();

            if ($order->meta_purchase_sent) {
                return back()->with('success', "Meta CAPI: Order #{$order->order_number} এর Purchase ইভেন্ট সফলভাবে ফেসবুকে পাঠানো হয়েছে! 🎉 (Event ID: {$order->meta_purchase_event_id})");
            }

            return back()->with('error', 'মেটা CAPI-তে পাঠানো যায়নি। অনুগ্রহ করে Integration সেটিংস থেকে Pixel ID ও Access Token চেক করুন।');
        } catch (\Throwable $e) {
            return back()->with('error', 'মেটা ইভেন্ট পাঠানোর সময় ত্রুটি: '.$e->getMessage());
        }
    }
}
