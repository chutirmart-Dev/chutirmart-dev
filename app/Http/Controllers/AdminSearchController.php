<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->input('q', ''));

        if (mb_strlen($q) < 1) {
            return response()->json([
                'orders' => [],
                'products' => [],
                'customers' => [],
                'pages' => $this->getQuickPages(),
            ]);
        }

        // 1. Matched Admin Pages / Navigation
        $pages = $this->searchPages($q);

        // 2. Orders Search (Super-fast with indexed fields, limit 6)
        $cleanQ = ltrim($q, '#');
        $orders = Order::query()
            ->where(function ($query) use ($q, $cleanQ) {
                $query->where('order_number', 'like', "%{$cleanQ}%")
                    ->orWhere('customer_name', 'like', "%{$q}%")
                    ->orWhere('mobile', 'like', "%{$cleanQ}%")
                    ->orWhere('courier_tracking_code', 'like', "%{$cleanQ}%")
                    ->orWhere('consignment_id', 'like', "%{$cleanQ}%");
            })
            ->select([
                'id',
                'order_number',
                'customer_name',
                'mobile',
                'total',
                'status',
                'payment_status',
                'created_at',
            ])
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'mobile' => $order->mobile,
                    'total' => $order->total,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'date' => $order->created_at ? $order->created_at->format('M d, Y') : '',
                    'url' => route('admin.orders.show', $order->id),
                ];
            });

        // 3. Products Search (limit 6)
        $products = Product::query()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('product_code', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            })
            ->with(['mainImage', 'images' => fn ($img) => $img->limit(1)])
            ->select([
                'id',
                'name',
                'product_code',
                'price',
                'stock_quantity',
                'status',
            ])
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(function ($product) {
                $img = $product->mainImage?->image_path
                    ?? $product->images->first()?->image_path;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'product_code' => $product->product_code,
                    'price' => $product->price,
                    'stock' => $product->stock_quantity,
                    'status' => $product->status,
                    'image' => $img ? (str_starts_with($img, 'http') ? $img : '/storage/'.ltrim($img, '/')) : null,
                    'url' => route('admin.products.edit', $product->id),
                ];
            });

        // 4. Customers Search (limit 6)
        $customers = Customer::query()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('mobile', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            })
            ->select([
                'id',
                'name',
                'mobile',
                'email',
                'district',
                'total_orders',
            ])
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'mobile' => $customer->mobile,
                    'email' => $customer->email,
                    'district' => $customer->district,
                    'orders_count' => $customer->total_orders ?? Order::where('mobile', $customer->mobile)->count(),
                    'url' => route('admin.customers.index', ['q' => $customer->mobile ?: $customer->name]),
                ];
            });

        // If customers table had fewer results, check distinct customers from orders table
        if ($customers->count() < 4) {
            $existingMobiles = $customers->pluck('mobile')->filter()->toArray();

            $orderCustomers = Order::query()
                ->where(function ($query) use ($q) {
                    $query->where('customer_name', 'like', "%{$q}%")
                        ->orWhere('mobile', 'like', "%{$q}%");
                })
                ->when(! empty($existingMobiles), fn ($query) => $query->whereNotIn('mobile', $existingMobiles))
                ->select(['customer_name', 'mobile', 'district'])
                ->distinct()
                ->limit(4 - $customers->count())
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => null,
                        'name' => $order->customer_name,
                        'mobile' => $order->mobile,
                        'email' => null,
                        'district' => $order->district,
                        'orders_count' => Order::where('mobile', $order->mobile)->count(),
                        'url' => route('admin.orders.index', ['q' => $order->mobile ?: $order->customer_name]),
                    ];
                });

            $customers = $customers->concat($orderCustomers);
        }

        return response()->json([
            'orders' => $orders->values(),
            'products' => $products->values(),
            'customers' => $customers->values(),
            'pages' => array_values($pages),
        ]);
    }

    private function getQuickPages(): array
    {
        return [
            ['title' => 'All Orders', 'route' => route('admin.orders.index'), 'icon' => 'ShoppingCart', 'badge' => 'Orders'],
            ['title' => 'All Products', 'route' => route('admin.products.index'), 'icon' => 'Package', 'badge' => 'Catalog'],
            ['title' => 'Add New Product', 'route' => route('admin.products.create'), 'icon' => 'Plus', 'badge' => 'Quick Action'],
            ['title' => 'Customers List', 'route' => route('admin.customers.index'), 'icon' => 'Users', 'badge' => 'Users'],
            ['title' => 'Courier & Shipping', 'route' => route('admin.integrations.index'), 'icon' => 'Truck', 'badge' => 'Logistics'],
            ['title' => 'Store Settings', 'route' => route('admin.settings.index'), 'icon' => 'Settings', 'badge' => 'Config'],
        ];
    }

    private function searchPages(string $q): array
    {
        $adminPages = [
            ['title' => 'Dashboard Overview', 'keywords' => 'dashboard home analytics stats summary', 'route' => route('admin.dashboard'), 'icon' => 'LayoutDashboard', 'category' => 'Main'],
            ['title' => 'All Products', 'keywords' => 'products items catalog inventory stock', 'route' => route('admin.products.index'), 'icon' => 'Package', 'category' => 'Products'],
            ['title' => 'Add New Product', 'keywords' => 'add product create product new item upload', 'route' => route('admin.products.create'), 'icon' => 'Plus', 'category' => 'Products'],
            ['title' => 'Product Categories', 'keywords' => 'categories category taxonomy collections', 'route' => route('admin.categories.index'), 'icon' => 'FolderTree', 'category' => 'Products'],
            ['title' => 'Product Brands', 'keywords' => 'brands brand manufacturer', 'route' => route('admin.brands.index'), 'icon' => 'Tag', 'category' => 'Products'],
            ['title' => 'Product Tags', 'keywords' => 'tags tag labels taxonomy', 'route' => route('admin.tags.index'), 'icon' => 'Hash', 'category' => 'Products'],
            ['title' => 'Product Attributes', 'keywords' => 'attributes variations sizes colors', 'route' => route('admin.attributes.index'), 'icon' => 'SlidersHorizontal', 'category' => 'Products'],
            ['title' => 'Product Reviews', 'keywords' => 'reviews ratings customer feedback testimonials', 'route' => route('admin.reviews.index'), 'icon' => 'Star', 'category' => 'Products'],
            ['title' => 'All Orders', 'keywords' => 'orders order list sales management parcels', 'route' => route('admin.orders.index'), 'icon' => 'ShoppingCart', 'category' => 'Orders'],
            ['title' => 'Create New Order', 'keywords' => 'create order manual order place order add order', 'route' => route('admin.orders.create'), 'icon' => 'PlusCircle', 'category' => 'Orders'],
            ['title' => 'Customer List', 'keywords' => 'customers buyers users clients phone list', 'route' => route('admin.customers.index'), 'icon' => 'Users', 'category' => 'Customers'],
            ['title' => 'Home Banners & Sliders', 'keywords' => 'banners sliders promos promo slider image hero', 'route' => route('admin.banners.index'), 'icon' => 'Image', 'category' => 'Store'],
            ['title' => 'Landing Pages Builder', 'keywords' => 'landing pages funnels promo campaign one page', 'route' => route('admin.landing-pages.index'), 'icon' => 'Layers', 'category' => 'Store'],
            ['title' => 'Courier & API Integrations', 'keywords' => 'couriers steadfast carrybee pathao redx paperfly shipping api', 'route' => route('admin.integrations.index'), 'icon' => 'Truck', 'category' => 'Settings'],
            ['title' => 'Store Settings', 'keywords' => 'settings store general contact pixel domain logo site configuration', 'route' => route('admin.settings.index'), 'icon' => 'Settings', 'category' => 'Settings'],
            ['title' => 'Customer Messages', 'keywords' => 'messages contact inquiries chats support inbox', 'route' => route('admin.messages.index'), 'icon' => 'MessageSquare', 'category' => 'Communication'],
            ['title' => 'Help & Documentation', 'keywords' => 'help support guides tutorials docs faq', 'route' => route('admin.help.index'), 'icon' => 'HelpCircle', 'category' => 'Help'],
        ];

        $matched = [];
        $lowQ = mb_strtolower($q);

        foreach ($adminPages as $page) {
            if (
                str_contains(mb_strtolower($page['title']), $lowQ) ||
                str_contains(mb_strtolower($page['keywords']), $lowQ) ||
                str_contains(mb_strtolower($page['category']), $lowQ)
            ) {
                $matched[] = $page;
                if (count($matched) >= 4) {
                    break;
                }
            }
        }

        return $matched;
    }
}
