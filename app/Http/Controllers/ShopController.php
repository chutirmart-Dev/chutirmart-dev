<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::where('status', 'active');

        // Search filter (handles multi-word and tokenized search)
        if ($request->filled('q')) {
            $search = trim($request->input('q'));
            $words = array_values(array_filter(
                preg_split('/[\s\-_,.]+/', mb_strtolower($search)),
                fn ($w) => mb_strlen($w) >= 2
            ));

            $query->where(function ($q) use ($search, $words) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('product_code', 'like', "%{$search}%");

                foreach ($words as $word) {
                    $q->orWhere('name', 'like', "%{$word}%")
                        ->orWhere('short_description', 'like', "%{$word}%");
                }
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $catSlug = $request->input('category');
            $query->whereHas('categories', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        // Brand filter
        if ($request->filled('brand')) {
            $brandSlug = $request->input('brand');
            $query->whereHas('brand', function ($q) use ($brandSlug) {
                $q->where('slug', $brandSlug);
            });
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->input('max_price'));
        }

        // Sorting
        $sortBy = $request->input('sort', 'default');
        switch ($sortBy) {
            case 'price_low_high':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high_low':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'best_selling':
                $query->orderBy('total_sold', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $products = $query->with(['images' => fn ($q) => $q->where('is_main', true)])
            ->paginate(12)
            ->withQueryString();

        // Get filters data for sidebar
        $categories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->withCount(['products' => fn ($q) => $q->where('status', 'active')])
            ->get(['id', 'name', 'slug']);

        $brands = Brand::where('status', 'active')
            ->withCount(['products' => fn ($q) => $q->where('status', 'active')])
            ->get(['id', 'name', 'slug']);

        return Inertia::render('Storefront/Shop', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => $request->only(['q', 'category', 'brand', 'min_price', 'max_price', 'sort']),
        ]);
    }
}
