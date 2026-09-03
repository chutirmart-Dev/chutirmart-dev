<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\Courier\CourierManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->route('status');

        $query = Order::query();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        $orders = $query->with('items')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Calculate some count stats
        $totalOrders = Order::count();
        $processingCount = Order::where('status', 'processing')->count();
        $onHoldCount = Order::where('status', 'on_hold')->count();
        $completeCount = Order::where('status', 'complete')->count();
        $cancelledCount = Order::where('status', 'cancelled')->count();
        $trashCount = Order::where('status', 'trash')->count();
        $incompleteCount = Order::where('status', 'incomplete')->count();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'status' => $status ?? 'all',
            'filters' => $request->only(['q']),
            'couriers' => CourierManager::getSupportedCouriers(),
            'stats' => [
                'all' => $totalOrders,
                'processing' => $processingCount,
                'on_hold' => $onHoldCount,
                'complete' => $completeCount,
                'cancelled' => $cancelledCount,
                'trash' => $trashCount,
                'incomplete' => $incompleteCount,
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
        do {
            $number = 'CHU-'.date('ymd').'-'.str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
        } while (Order::where('order_number', $number)->exists());

        return $number;
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

        return back()->with('success', 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।');
    }
}
