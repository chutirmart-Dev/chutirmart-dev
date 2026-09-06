<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
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
                'reviews' => fn ($q) => $q->where('status', 'approved')->orderBy('created_at', 'desc'),
            ])
            ->firstOrFail();

        // Load attribute groups: only active attributes that have at least one active option
        // assigned to this product, structured for the frontend selector
        $attributeGroups = DB::table('product_attribute_options as pao')
            ->join('attribute_values as av', 'pao.option_id', '=', 'av.id')
            ->join('attributes as a', 'pao.attribute_id', '=', 'a.id')
            ->where('pao.product_id', $product->id)
            ->where('av.status', 'active')
            ->where('a.status', 'active')
            ->select(
                'a.id as attribute_id',
                'a.name as attribute_name',
                'a.type as attribute_type',
                'a.sort_order as attribute_sort_order',
                'av.id as option_id',
                'av.value as option_value',
                'av.slug as option_slug',
                'av.color_hex',
                'av.image_path as option_image',
                'av.sort_order as option_sort_order',
            )
            ->orderBy('a.sort_order')
            ->orderBy('av.sort_order')
            ->get()
            ->groupBy('attribute_id')
            ->map(function ($options, $attrId) {
                $first = $options->first();

                return [
                    'id' => $first->attribute_id,
                    'name' => $first->attribute_name,
                    'type' => $first->attribute_type,
                    'sort_order' => $first->attribute_sort_order,
                    'options' => $options->map(fn ($o) => [
                        'id' => $o->option_id,
                        'value' => $o->option_value,
                        'slug' => $o->option_slug,
                        'color_hex' => $o->color_hex,
                        'image_path' => $o->option_image,
                        'sort_order' => $o->option_sort_order,
                    ])->values()->toArray(),
                ];
            })
            ->values();

        // Load active variations with their option signatures
        $variations = $product->variations()
            ->active()
            ->with(['options:id,value', 'product'])
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'sku' => $v->sku,
                'price' => $v->price,
                'sale_price' => $v->sale_price,
                'effective_price' => $v->effective_price,
                'stock_quantity' => $v->stock_quantity,
                'stock_status' => $v->stock_status,
                'image_path' => $v->image_path,
                'status' => $v->status,
                'option_ids' => $v->options->pluck('id')->sort()->values(),
            ]);

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
            'attributeGroups' => $attributeGroups,
            'variations' => $variations,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
