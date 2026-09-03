<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Services\Courier\SteadfastCourierService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Attach live order stats per customer (by mobile number)
        $customers->getCollection()->transform(function ($customer) {
            $orders = Order::where('mobile', $customer->mobile);
            $customer->orders_count = $orders->count();
            $customer->complete_orders = (clone $orders)->where('status', 'complete')->count();
            $customer->cancelled_orders = (clone $orders)->whereIn('status', ['cancelled', 'cancel', 'trash'])->count();
            $customer->total_spent = (clone $orders)->whereIn('status', ['complete', 'processing', 'on_hold'])
                ->sum('total');

            return $customer;
        });

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['q']),
        ]);
    }

    public function purchaseHistory(string $id)
    {
        $customer = Customer::findOrFail($id);
        $orders = Order::where('mobile', $customer->mobile)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'customer' => $customer,
            'orders' => $orders,
        ]);
    }

    /**
     * Courier success-rate stats for a customer — looked up by mobile number.
     * Queries Live Steadfast Courier API first, fallback to local DB.
     */
    public function courierStats(Request $request, ?string $mobile = null)
    {
        $rawMobile = (string) ($mobile ?: $request->input('mobile') ?: $request->query('mobile'));

        if (empty($rawMobile)) {
            return response()->json(['error' => 'Mobile required'], 422);
        }

        $mobile = $rawMobile;

        // Normalize phone number (strip +88, spaces, dashes)
        $cleanMobile = preg_replace('/[^0-9]/', '', $rawMobile);
        if (str_starts_with($cleanMobile, '880')) {
            $cleanMobile = substr($cleanMobile, 2);
        }

        $orders = Order::where(function ($q) use ($rawMobile, $cleanMobile) {
            $q->where('mobile', $rawMobile)
                ->orWhere('mobile', $cleanMobile)
                ->orWhere('mobile', '+88'.$cleanMobile)
                ->orWhere('mobile', '88'.$cleanMobile);
        })->get();

        $localTotal = $orders->count();
        $localDelivered = $orders->where('status', 'complete')->count();
        $localCancelled = $orders->whereIn('status', ['cancelled', 'cancel', 'trash'])->count();
        $processing = $orders->whereIn('status', ['processing', 'on_hold'])->count();
        $totalSpent = $orders->whereIn('status', ['complete', 'processing', 'on_hold'])->sum('total');

        // Resolve customer name
        $customer = Customer::where('mobile', $rawMobile)
            ->orWhere('mobile', $cleanMobile)
            ->orWhere('mobile', '+88'.$cleanMobile)
            ->first();

        // Query Live SteadFast Courier Fraud & History API
        $steadfastService = app(SteadfastCourierService::class);
        $liveStats = $steadfastService->checkCustomerFraud($cleanMobile);

        if (! empty($liveStats['success'])) {
            $totalOrders = (int) $liveStats['total_parcels'];
            $delivered = (int) $liveStats['total_delivered'];
            $cancelled = (int) $liveStats['total_cancelled'];
            $successRate = (int) $liveStats['success_rate'];
            $hasFraud = ! empty($liveStats['has_fraud']);
            $fraudReports = $liveStats['total_fraud_reports'] ?? [];
            $source = 'steadfast_live';
        } else {
            // Fallback to local store data
            $totalOrders = $localTotal;
            $delivered = $localDelivered;
            $cancelled = $localCancelled;
            $successRate = $localTotal > 0 ? round(($localDelivered / $localTotal) * 100) : 0;
            $hasFraud = false;
            $fraudReports = [];
            $source = 'local';
        }

        return response()->json([
            'customer_name' => $customer?->name ?? 'Customer',
            'mobile' => $mobile,
            'total_orders' => $totalOrders,
            'delivered' => $delivered,
            'cancelled' => $cancelled,
            'processing' => $processing,
            'total_spent' => $totalSpent,
            'success_rate' => $successRate,
            'has_fraud' => $hasFraud,
            'fraud_reports' => $fraudReports,
            'source' => $source,
            'local_orders' => $localTotal,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'mobile' => 'required|string|unique:customers,mobile',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'district' => 'nullable|string',
            'status' => 'required|string|in:new,returning,vip',
        ]);

        Customer::create($request->only(['name', 'mobile', 'email', 'address', 'district', 'status']));

        return redirect()->route('admin.customers.index')->with('success', 'গ্রাহক যোগ করা হয়েছে।');
    }
}
