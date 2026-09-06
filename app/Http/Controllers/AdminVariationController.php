<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminVariationController extends Controller
{
    /**
     * Auto-generate all combination variations for a product's assigned options.
     * Existing variations with matching option sets are preserved.
     */
    public function generate(Request $request, string $productId)
    {
        $product = Product::findOrFail($productId);

        if ($request->has('selected_attribute_options') && is_array($request->selected_attribute_options)) {
            // sync options directly from request payload so admin doesn't need to save first
            DB::table('product_attribute_options')->where('product_id', $product->id)->delete();
            $rows = [];
            $now = now();
            foreach ($request->selected_attribute_options as $attrSelection) {
                $attributeId = $attrSelection['attribute_id'] ?? null;
                $optionIds = $attrSelection['option_ids'] ?? [];
                if (! $attributeId || empty($optionIds)) {
                    continue;
                }
                foreach ($optionIds as $optionId) {
                    $rows[] = [
                        'product_id' => $product->id,
                        'attribute_id' => $attributeId,
                        'option_id' => $optionId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
            if (! empty($rows)) {
                DB::table('product_attribute_options')->insert($rows);
            }
            $product->unsetRelation('attributeOptions');
        }

        $count = $this->generateProductVariations($product);

        if ($count === 0 && $product->variations()->count() === 0) {
            return back()->withErrors(['variations' => 'প্রথমে অ্যাট্রিবিউট ও অপশন নির্বাচন করুন।']);
        }

        return back()->with('success', 'ভ্যারিয়েশন তৈরি/আপডেট করা হয়েছে।');
    }

    /**
     * Helper to generate variations from currently assigned attribute options.
     */
    public function generateProductVariations(Product $product): int
    {
        $product->loadMissing(['attributeOptions.attribute']);

        // Group options by attribute_id
        $grouped = [];
        foreach ($product->attributeOptions as $option) {
            if (! $option->attribute) {
                continue;
            }
            $attrId = $option->attribute->id;
            $grouped[$attrId][] = $option;
        }

        if (empty($grouped)) {
            return 0;
        }

        // Cartesian product of all option groups
        $combinations = $this->cartesian(array_values($grouped));
        $createdCount = 0;

        DB::transaction(function () use ($product, $combinations, &$createdCount) {
            foreach ($combinations as $combo) {
                $optionIds = collect($combo)->pluck('id')->sort()->values()->toArray();

                // Check if this exact combination already exists
                $existingVariation = ProductVariation::where('product_id', $product->id)
                    ->whereHas('options', function ($q) use ($optionIds) {
                        $q->whereIn('attribute_values.id', $optionIds);
                    }, '=', count($optionIds))
                    ->whereDoesntHave('options', function ($q) use ($optionIds) {
                        $q->whereNotIn('attribute_values.id', $optionIds);
                    })
                    ->first();

                if (! $existingVariation) {
                    $label = collect($combo)->pluck('value')->implode('-');
                    $sku = strtoupper(Str::slug($product->name)).'-'.strtoupper(Str::slug($label)).'-'.rand(100, 999);

                    $variation = ProductVariation::create([
                        'product_id' => $product->id,
                        'sku' => $sku,
                        'stock_quantity' => $product->stock_quantity,
                        'stock_status' => 'in_stock',
                        'status' => 'active',
                    ]);

                    $variation->options()->attach($optionIds);
                    $createdCount++;
                }
            }
        });

        return $createdCount;
    }

    /**
     * Update a single variation's price/stock/SKU/status.
     */
    public function update(Request $request, string $productId, string $variationId)
    {
        $variation = ProductVariation::where('product_id', $productId)->findOrFail($variationId);

        $request->validate([
            'sku' => 'nullable|string|max:100|unique:product_variations,sku,'.$variation->id,
            'price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'stock_status' => 'required|in:in_stock,out_of_stock,backorder',
            'status' => 'required|in:active,inactive',
        ]);

        $variation->update($request->only([
            'sku', 'price', 'sale_price', 'stock_quantity', 'stock_status', 'status',
        ]));

        return back()->with('success', 'ভ্যারিয়েশন আপডেট করা হয়েছে।');
    }

    /**
     * Delete a single variation.
     */
    public function destroy(string $productId, string $variationId)
    {
        $variation = ProductVariation::where('product_id', $productId)->findOrFail($variationId);
        $variation->options()->detach();
        $variation->delete();

        return back()->with('success', 'ভ্যারিয়েশন মুছে ফেলা হয়েছে।');
    }

    /**
     * Bulk update all variations for a product (from the grid table).
     */
    public function bulkUpdate(Request $request, string $productId)
    {
        $request->validate([
            'variations' => 'required|array',
            'variations.*.id' => 'required|exists:product_variations,id',
            'variations.*.sku' => 'nullable|string|max:100',
            'variations.*.price' => 'nullable|numeric|min:0',
            'variations.*.sale_price' => 'nullable|numeric|min:0',
            'variations.*.stock_quantity' => 'required|integer|min:0',
            'variations.*.stock_status' => 'required|in:in_stock,out_of_stock,backorder',
            'variations.*.status' => 'required|in:active,inactive',
        ]);

        DB::transaction(function () use ($request, $productId) {
            foreach ($request->variations as $varData) {
                ProductVariation::where('product_id', $productId)
                    ->where('id', $varData['id'])
                    ->update([
                        'sku' => $varData['sku'] ?? null,
                        'price' => $varData['price'] ?? null,
                        'sale_price' => $varData['sale_price'] ?? null,
                        'stock_quantity' => $varData['stock_quantity'],
                        'stock_status' => $varData['stock_status'],
                        'status' => $varData['status'],
                    ]);
            }
        });

        return back()->with('success', 'সকল ভ্যারিয়েশন আপডেট করা হয়েছে।');
    }

    /**
     * Compute Cartesian product of grouped arrays.
     *
     * @param  array<array<mixed>>  $arrays
     * @return array<array<mixed>>
     */
    private function cartesian(array $arrays): array
    {
        $result = [[]];

        foreach ($arrays as $array) {
            $tmp = [];
            foreach ($result as $existing) {
                foreach ($array as $item) {
                    $tmp[] = array_merge($existing, [$item]);
                }
            }
            $result = $tmp;
        }

        return $result;
    }
}
