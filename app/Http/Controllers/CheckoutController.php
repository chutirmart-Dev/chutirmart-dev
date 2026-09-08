<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Customer;
use App\Models\District;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\StoreSetting;
use App\Models\Thana;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $districts = District::orderBy('name')->get(['id', 'name', 'delivery_charge']);
        $thanasByDistrict = Thana::orderBy('name')->get(['id', 'district_id', 'name'])->groupBy('district_id');

        return Inertia::render('Storefront/Checkout', [
            'districts' => $districts,
            'thanasByDistrict' => $thanasByDistrict,
            'defaultInsideDhaka' => (float) StoreSetting::getValue('delivery_inside_dhaka', 80),
            'defaultOutsideDhaka' => (float) StoreSetting::getValue('delivery_outside_dhaka', 130),
        ]);
    }

    public function getThanas(Request $request)
    {
        $query = Thana::query();

        if ($request->filled('district_id')) {
            $query->where('district_id', $request->district_id);
        } elseif ($request->filled('district_name')) {
            $district = District::where('name', $request->district_name)->first();
            if ($district) {
                $query->where('district_id', $district->id);
            } else {
                return response()->json([]);
            }
        } else {
            return response()->json([]);
        }

        $thanas = $query->orderBy('name')->get(['id', 'name']);

        return response()->json($thanas);
    }

    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', $request->code)
            ->where('status', 'active')
            ->first();

        if (! $coupon) {
            return response()->json(['valid' => false, 'message' => 'কুপনটি সঠিক নয়!'], 422);
        }

        if (! $coupon->isValidForAmount($request->subtotal)) {
            return response()->json(['valid' => false, 'message' => 'কুপনটি এই অর্ডারের জন্য প্রযোজ্য নয়!'], 422);
        }

        $discount = $coupon->calculateDiscount($request->subtotal);

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'discount' => $discount,
            'message' => 'কুপনটি সফলভাবে প্রয়োগ করা হয়েছে! 🎉',
        ]);
    }

    public function placeOrder(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|min:3|max:100',
            'mobile' => 'required|string|regex:/^(?:\+?88)?01[3-9]\d{8}$/',
            'email' => 'nullable|email',
            'district' => 'required|string',
            'thana' => 'nullable|string',
            'address' => 'required|string|min:5',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.variant_info' => 'nullable|array',
            'coupon_code' => 'nullable|string',
            'special_notes' => 'nullable|string',
        ], [
            'customer_name.required' => 'Your Full Name is required',
            'mobile.required' => 'Your Mobile Number is required',
            'mobile.regex' => 'Please enter a valid mobile number (e.g. 017XXXXXXXX)',
            'district.required' => 'Please select a district',
            'address.required' => 'Please enter your address',
            'items.required' => 'Your cart is empty',
        ]);

        // Calculate Subtotal & Verify Stock
        $subtotal = 0.0;
        $orderItemsData = [];

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);
            if (! $product) {
                return back()->withErrors([
                    'items' => 'নির্বাচিত পণ্য খুঁজে পাওয়া যায়নি!',
                ]);
            }

            $variation = null;
            if (! empty($item['variant_info']['id'])) {
                $variation = ProductVariation::where('product_id', $product->id)
                    ->where('id', $item['variant_info']['id'])
                    ->first();
            }

            // Check stock: if variation exists check variation stock, else check product stock
            if ($variation) {
                if ($variation->stock_quantity < $item['quantity'] || $variation->stock_status === 'out_of_stock') {
                    $vLabel = $item['variant_info']['label'] ?? 'ভ্যারিয়েন্ট';

                    return back()->withErrors([
                        'items' => "{$product->name} ({$vLabel}) পর্যাপ্ত স্টকে নেই! সর্বোচ্চ উপলব্ধ স্টক: {$variation->stock_quantity}",
                    ]);
                }
                $price = (float) $variation->effective_price;
            } else {
                if ($product->stock_quantity < $item['quantity']) {
                    return back()->withErrors([
                        'items' => "{$product->name} পর্যাপ্ত স্টকে নেই! সর্বোচ্চ উপলব্ধ স্টক: {$product->stock_quantity}",
                    ]);
                }
                $price = (float) $product->discounted_price;
            }

            $itemTotal = $price * $item['quantity'];
            $subtotal += $itemTotal;

            $orderItemsData[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'variant_info' => $item['variant_info'] ?? null,
                'quantity' => $item['quantity'],
                'unit_price' => $price,
                'total_price' => $itemTotal,
                'product_ref' => $product,
                'variation_ref' => $variation,
            ];
        }

        // Calculate Delivery Charge
        $deliveryCharge = $this->calculateDelivery($request->district);

        // Validate Coupon
        $discount = 0.0;
        $couponId = null;
        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', $request->coupon_code)
                ->where('status', 'active')
                ->first();
            if ($coupon && $coupon->isValidForAmount($subtotal)) {
                $discount = (float) $coupon->calculateDiscount($subtotal);
                $couponId = $coupon->id;
                $coupon->increment('used_count');
            }
        }

        $total = max(0, ($subtotal + $deliveryCharge) - $discount);
        $orderNumber = $this->generateOrderNumber();

        try {
            DB::transaction(function () use ($request, $subtotal, $deliveryCharge, $discount, $total, $orderNumber, $couponId, $orderItemsData) {
                // Find or create customer
                $customer = Customer::firstOrNew(['mobile' => $request->mobile]);
                $customer->name = $request->customer_name;
                if ($request->filled('email')) {
                    $customer->email = $request->email;
                }
                $customer->address = $request->address;
                $customer->district = $request->district;
                $customer->total_orders = ($customer->total_orders ?? 0) + 1;
                $customer->total_spent = ($customer->total_spent ?? 0) + $total;

                if ($customer->total_orders >= 5 || $customer->total_spent >= 10000) {
                    $customer->status = 'vip';
                } elseif ($customer->total_orders > 1) {
                    $customer->status = 'returning';
                } else {
                    $customer->status = 'new';
                }
                $customer->save();

                // Save Order
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $customer->id,
                    'user_id' => Auth::id(),
                    'customer_name' => $request->customer_name,
                    'mobile' => $request->mobile,
                    'district' => $request->district,
                    'thana' => $request->thana,
                    'address' => $request->address,
                    'subtotal' => $subtotal,
                    'delivery_charge' => $deliveryCharge,
                    'coupon_discount' => $discount,
                    'total' => $total,
                    'coupon_code' => $request->coupon_code,
                    'coupon_id' => $couponId,
                    'payment_method' => 'cod',
                    'payment_status' => 'pending',
                    'status' => 'processing',
                    'special_notes' => trim(($request->email ? "[Email: {$request->email}] " : '').$request->special_notes),
                    'ip_address' => $request->ip(),
                ]);

                // Save Order Items and Deduct Stock
                foreach ($orderItemsData as $itemData) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $itemData['product_id'],
                        'product_name' => $itemData['product_name'],
                        'variant_info' => $itemData['variant_info'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total_price' => $itemData['total_price'],
                    ]);

                    // Atomically deduct stock and update total sold
                    $product = $itemData['product_ref'];
                    $product->decrement('stock_quantity', $itemData['quantity']);
                    $product->increment('total_sold', $itemData['quantity']);

                    // If variation exists, also deduct variation stock
                    if (! empty($itemData['variation_ref'])) {
                        $variation = $itemData['variation_ref'];
                        $variation->decrement('stock_quantity', $itemData['quantity']);
                        if ($variation->fresh()->stock_quantity <= 0) {
                            $variation->update(['stock_status' => 'out_of_stock']);
                        }
                    }
                }
            });

            return redirect()->route('order.confirmation', ['orderNumber' => $orderNumber]);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'অর্ডারটি সম্পন্ন করার সময় ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।']);
        }
    }

    private function calculateDelivery(string $districtName): float
    {
        $district = District::where('name', $districtName)->first();
        if ($district && $district->delivery_charge !== null) {
            return (float) $district->delivery_charge;
        }

        $insideDhaka = ['Dhaka', 'Narayanganj', 'Gazipur'];
        if (in_array($districtName, $insideDhaka)) {
            return (float) StoreSetting::getValue('delivery_inside_dhaka', 80);
        }

        return (float) StoreSetting::getValue('delivery_outside_dhaka', 130);
    }

    private function generateOrderNumber(): string
    {
        return Order::generateOrderNumber();
    }
}
