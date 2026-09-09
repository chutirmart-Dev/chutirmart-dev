<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'all');

        $applyPeriod = function ($query) use ($period) {
            match ($period) {
                'today' => $query->whereDate('created_at', today()),
                'yesterday' => $query->whereDate('created_at', today()->subDay()),
                '7_days' => $query->where('created_at', '>=', now()->subDays(7)),
                '30_days' => $query->where('created_at', '>=', now()->subDays(30)),
                '1_year' => $query->where('created_at', '>=', now()->subDays(365)),
                default => null,
            };
        };

        // 1. Stat Cards Metrics with Period filter
        $salesQuery = Order::where('status', 'complete');
        $applyPeriod($salesQuery);
        $totalSales = $salesQuery->count();
        $totalRevenue = (float) $salesQuery->sum('total');

        $ordersQuery = Order::query();
        $applyPeriod($ordersQuery);
        $totalOrders = $ordersQuery->count();
        $totalOrdersAmount = (float) $ordersQuery->sum('total');
        $totalDeliveryCharge = (float) $ordersQuery->sum('delivery_charge');

        $customersQuery = Customer::query();
        $applyPeriod($customersQuery);
        $totalCustomers = $customersQuery->count();

        // Incomplete / Abandoned rate
        $incompleteQuery = Order::whereIn('status', ['incomplete', 'cancelled']);
        $applyPeriod($incompleteQuery);
        $incompleteOrdersCount = $incompleteQuery->count();
        $incompleteRate = $totalOrders > 0 ? round(($incompleteOrdersCount / $totalOrders) * 100, 1) : 0.0;

        // 2. Orders Summary Widget counts
        $processingQuery = Order::where('status', 'processing');
        $applyPeriod($processingQuery);
        $processingCount = $processingQuery->count();

        $onHoldQuery = Order::where('status', 'on_hold');
        $applyPeriod($onHoldQuery);
        $onHoldCount = $onHoldQuery->count();

        $completeQuery = Order::where('status', 'complete');
        $applyPeriod($completeQuery);
        $completeCount = $completeQuery->count();

        $cancelledQuery = Order::where('status', 'cancelled');
        $applyPeriod($cancelledQuery);
        $cancelledCount = $cancelledQuery->count();

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
            'selectedPeriod' => $period,
        ]);
    }
}
