<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\Courier\CourierManager;
use Illuminate\Http\Request;

class AdminCourierController extends Controller
{
    /**
     * Send order to courier.
     */
    public function sendOrder(Request $request, string $id)
    {
        $order = Order::with('items')->findOrFail($id);
        $courierName = $request->input('courier_name');

        $result = CourierManager::sendOrder($order, $courierName);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    /**
     * Fetch live tracking status from courier for an order.
     */
    public function trackOrder(string $id)
    {
        $order = Order::findOrFail($id);

        $result = CourierManager::trackOrder($order);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    /**
     * Bulk dispatch multiple orders to a courier partner.
     */
    public function bulkSend(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id',
            'courier_name' => 'nullable|string',
        ]);

        $courierName = $request->input('courier_name');
        $successCount = 0;
        $failedCount = 0;
        $messages = [];

        foreach ($request->order_ids as $orderId) {
            $order = Order::find($orderId);
            if (! $order) {
                continue;
            }

            $result = CourierManager::sendOrder($order, $courierName);
            if ($result['success']) {
                $successCount++;
            } else {
                $failedCount++;
                $messages[] = "#{$order->order_number}: {$result['message']}";
            }
        }

        if ($failedCount === 0) {
            return back()->with('success', "{$successCount} orders successfully dispatched to Courier! 📦");
        }

        return back()->with('warning', "{$successCount} orders sent, {$failedCount} failed. ".implode(' | ', array_slice($messages, 0, 3)));
    }

    /**
     * Check balance / connectivity for a courier.
     */
    public function checkBalance(Request $request)
    {
        $courierName = $request->input('courier', 'steadfast');
        $courier = CourierManager::resolve($courierName);
        $result = $courier->checkBalance();

        return response()->json($result);
    }

    /**
     * Test API connection with a courier.
     */
    public function testConnection(Request $request)
    {
        $courierName = $request->input('courier', 'steadfast');
        $courier = CourierManager::resolve($courierName);
        $result = $courier->testConnection();

        return response()->json($result);
    }
}
