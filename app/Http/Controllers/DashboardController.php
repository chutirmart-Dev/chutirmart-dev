<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Stat Cards Metrics
        $totalSales = Order::where('status', 'complete')->count();
        $totalRevenue = (float) Order::where('status', 'complete')->sum('total');
        $totalOrders = Order::count();
        $totalOrdersAmount = (float) Order::sum('total');
        $totalDeliveryCharge = (float) Order::sum('delivery_charge');
        $totalCustomers = Customer::count();

        // Incomplete / Abandoned rate
        $incompleteOrdersCount = Order::whereIn('status', ['incomplete', 'cancelled'])->count();
        $incompleteRate = $totalOrders > 0 ? round(($incompleteOrdersCount / $totalOrders) * 100, 1) : 0.0;

        // 2. Orders Summary Widget counts
        $processingCount = Order::where('status', 'processing')->count();
        $onHoldCount = Order::where('status', 'on_hold')->count();
        $completeCount = Order::where('status', 'complete')->count();
        $cancelledCount = Order::where('status', 'cancelled')->count();

        // 3. Inventory Alerts
        $lowStockProducts = Product::where('status', 'active')
            ->where('stock_quantity', '<=', 10)
            ->with(['images' => fn ($q) => $q->where('is_main', true)])
            ->get();

        // 4. Chart data: last 6 months revenue
        $chartData = Order::select(
            DB::raw('MONTH(created_at) as month_num'),
            DB::raw('MONTHNAME(created_at) as month'),
            DB::raw('SUM(CASE WHEN status="complete" THEN total ELSE 0 END) as sales'),
            DB::raw('SUM(CASE WHEN status="complete" THEN subtotal * 0.7 ELSE 0 END) as purchases')
        )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy(DB::raw('MONTH(created_at)'), DB::raw('MONTHNAME(created_at)'))
            ->orderBy('month_num', 'asc')
            ->get();

        if ($chartData->isEmpty() || $chartData->sum('sales') == 0) {
            $monthLabels = ['June', 'July', 'August', 'September', 'October', '03:30 PM'];
            $salesFigures = [2850, 5600, 3400, 6800, 8792, 7650];
            $mockData = [];
            foreach ($monthLabels as $idx => $mLabel) {
                $mockData[] = [
                    'month_num' => $idx + 1,
                    'month' => $mLabel,
                    'sales' => $salesFigures[$idx],
                    'purchases' => round($salesFigures[$idx] * 0.65),
                ];
            }
            $chartData = $mockData;
        }

        // 5. Smart AI/Rule Suggestions
        $suggestions = [];
        foreach ($lowStockProducts->take(3) as $prod) {
            $suggestions[] = [
                'type' => 'stock',
                'message' => "আলার্ট: {$prod->name} স্টকে আর মাত্র {$prod->stock_quantity} টি আছে! এখনই রিস্টক করুন।",
            ];
        }

        $noSalesProducts = Product::where('status', 'active')
            ->where('total_sold', 0)
            ->where('created_at', '<=', now()->subDays(30))
            ->take(2)
            ->get();

        foreach ($noSalesProducts as $prod) {
            $suggestions[] = [
                'type' => 'discount',
                'message' => "পরামর্শ: {$prod->name} এ গত ৩০ দিনে কোনো বিক্রি হয়নি। কুপন বা ডিসকাউন্ট দেওয়ার কথা বিবেচনা করুন।",
            ];
        }

        // 6. Top Performing Products
        $topProducts = Product::orderBy('total_sold', 'desc')
            ->take(5)
            ->with(['images' => fn ($q) => $q->where('is_main', true)])
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'sales' => $totalSales,
                'revenue' => $totalRevenue,
                'purchases' => $totalRevenue,
                'orders' => $totalOrders,
                'orders_amount' => $totalOrdersAmount,
                'delivery_charge' => $totalDeliveryCharge,
                'incomplete_rate' => $incompleteRate,
                'customers' => $totalCustomers,
            ],
            'summary' => [
                'processing' => $processingCount,
                'on_hold' => $onHoldCount,
                'complete' => $completeCount,
                'cancelled' => $cancelledCount,
            ],
            'lowStock' => $lowStockProducts,
            'chartData' => $chartData,
            'suggestions' => $suggestions,
            'topProducts' => $topProducts,
        ]);
    }
}
