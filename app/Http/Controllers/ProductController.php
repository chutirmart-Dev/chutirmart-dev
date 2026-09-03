<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->where('status', 'active')
            ->with([
                'images',
                'brand',
                'categories',
                'variants.attributeValue.attribute',
                'reviews' => fn ($q) => $q->where('status', 'approved')->orderBy('created_at', 'desc'),
            ])
            ->firstOrFail();

        // Find primary category to get related products
        $primaryCategoryId = $product->categories->first()?->id;

        $relatedProducts = [];
        if ($primaryCategoryId) {
            $relatedProducts = Product::where('status', 'active')
                ->where('id', '!=', $product->id)
                ->whereHas('categories', function ($q) use ($primaryCategoryId) {
                    $q->where('categories.id', $primaryCategoryId);
                })
                ->with(['images' => fn ($q) => $q->where('is_main', true)])
                ->take(4)
                ->get();
        }

        return Inertia::render('Storefront/ProductSingle', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
