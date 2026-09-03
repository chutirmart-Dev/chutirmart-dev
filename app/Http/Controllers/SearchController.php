<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class SearchController extends Controller
{
    /**
     * Handle live autocomplete search suggestions with exact matches,
     * typo-tolerant fuzzy search, and related product recommendations.
     */
    public function suggest(Request $request): JsonResponse
    {
        $rawQuery = (string) $request->input('q', '');
        $query = trim($rawQuery);

        if (mb_strlen($query) === 0) {
            // Return popular/trending items if query is empty
            $popularProducts = Cache::remember('search_suggest_popular_v4', 300, function () {
                return Product::where('status', 'active')
                    ->with(['mainImage', 'categories:id,name,slug'])
                    ->select([
                        'id', 'name', 'slug', 'price', 'discount_type',
                        'discount_value', 'stock_quantity', 'total_sold',
                    ])
                    ->orderByDesc('total_sold')
                    ->orderByDesc('created_at')
                    ->limit(6)
                    ->get()
                    ->map(function (Product $product) {
                        return $this->formatProduct($product);
                    })
                    ->values()
                    ->all();
            });

            return response()->json([
                'products' => array_values(is_array($popularProducts) ? $popularProducts : (is_iterable($popularProducts) ? iterator_to_array($popularProducts) : [])),
                'related_products' => [],
                'categories' => [],
                'query' => '',
                'is_popular' => true,
            ]);
        }

        // Cache suggestions per normalized query
        $cacheKey = 'search_suggest_v3_'.md5(mb_strtolower($query));

        $data = Cache::remember($cacheKey, 30, function () use ($query) {
            return $this->performIntelligentSearch($query);
        });

        return response()->json($data);
    }

    /**
     * Perform smart tokenized, typo-tolerant search and fetch related products.
     *
     * @return array<string, mixed>
     */
    private function performIntelligentSearch(string $query): array
    {
        $allActive = Product::where('status', 'active')
            ->with(['mainImage', 'categories:id,name,slug'])
            ->select([
                'id', 'name', 'slug', 'product_code', 'short_description',
                'price', 'discount_type', 'discount_value', 'stock_quantity', 'total_sold',
            ])
            ->get();

        $queryLower = mb_strtolower($query);
        $queryWords = array_values(array_filter(
            preg_split('/[\s\-_,.]+/', $queryLower),
            fn ($w) => mb_strlen($w) >= 2
        ));

        $scored = [];

        foreach ($allActive as $product) {
            $score = $this->calculateProductScore($product, $queryLower, $queryWords);
            if ($score > 0) {
                $scored[] = [
                    'product' => $product,
                    'score' => $score,
                ];
            }
        }

        // Sort by highest relevance score
        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        /** @var Collection<int, Product> $matchedProducts */
        $matchedProducts = collect($scored)
            ->filter(fn ($item) => $item['score'] >= 25)
            ->take(6)
            ->map(fn ($item) => $item['product']);

        // Collect category IDs from matched products
        $categoryIds = $matchedProducts->flatMap(function (Product $p) {
            return $p->categories->pluck('id');
        })->unique()->filter()->values()->all();

        // If no products scored >= 25, take top scoring items if any exist
        if ($matchedProducts->isEmpty() && ! empty($scored)) {
            $matchedProducts = collect($scored)->take(3)->map(fn ($item) => $item['product']);
            $categoryIds = $matchedProducts->flatMap(function (Product $p) {
                return $p->categories->pluck('id');
            })->unique()->filter()->values()->all();
        }

        // Fetch Related Products (same category or popular)
        $matchedIds = $matchedProducts->pluck('id')->all();

        $relatedProducts = $allActive
            ->filter(function (Product $p) use ($matchedIds, $categoryIds) {
                if (in_array($p->id, $matchedIds, true)) {
                    return false;
                }
                if (! empty($categoryIds)) {
                    return $p->categories->pluck('id')->intersect($categoryIds)->isNotEmpty();
                }

                return true;
            })
            ->sortByDesc('total_sold')
            ->take(4)
            ->values();

        // If related products still empty and we need recommendations
        if ($relatedProducts->isEmpty()) {
            $relatedProducts = $allActive
                ->filter(fn (Product $p) => ! in_array($p->id, $matchedIds, true))
                ->sortByDesc('total_sold')
                ->take(4)
                ->values();
        }

        // Matching categories
        $categories = Category::where('status', 'active')
            ->where(function ($q) use ($query, $queryWords) {
                $q->where('name', 'like', "%{$query}%");
                foreach ($queryWords as $word) {
                    $q->orWhere('name', 'like', "%{$word}%");
                }
            })
            ->select(['id', 'name', 'slug'])
            ->withCount(['products' => fn ($q) => $q->where('status', 'active')])
            ->limit(3)
            ->get()
            ->map(function (Category $category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'count' => $category->products_count,
                    'url' => route('shop', ['category' => $category->slug]),
                ];
            });

        return [
            'products' => $matchedProducts->map(fn ($p) => $this->formatProduct($p))->values()->all(),
            'related_products' => $relatedProducts->map(fn ($p) => $this->formatProduct($p))->values()->all(),
            'categories' => $categories->all(),
            'query' => $query,
            'is_popular' => false,
        ];
    }

    /**
     * Compute a relevance match score for a product against a search query.
     *
     * @param  array<int, string>  $queryWords
     */
    private function calculateProductScore(Product $product, string $queryLower, array $queryWords): int
    {
        $productName = mb_strtolower($product->name);
        $score = 0;

        // 1. Exact full match
        if ($productName === $queryLower) {
            return 1000;
        }

        // 2. Exact substring match
        if (str_contains($productName, $queryLower)) {
            $score += 500;
        }

        // 3. Product code match
        if ($product->product_code && str_contains(mb_strtolower($product->product_code), $queryLower)) {
            $score += 300;
        }

        // 4. Tokenized & fuzzy word matching
        $productWords = array_values(array_filter(
            preg_split('/[\s\-_,.]+/', $productName),
            fn ($w) => mb_strlen($w) >= 2
        ));

        foreach ($queryWords as $qWord) {
            foreach ($productWords as $pWord) {
                // Exact word match
                if ($qWord === $pWord) {
                    $score += 100;
                    break;
                }
                // Prefix match (e.g. "reach" in "rechargeable")
                if (str_starts_with($pWord, $qWord) || str_starts_with($qWord, $pWord)) {
                    $score += 70;
                    break;
                }
                // Substring inside word
                if (str_contains($pWord, $qWord) || str_contains($qWord, $pWord)) {
                    $score += 50;
                    break;
                }
                // Fuzzy typo match (Levenshtein distance <= 2 for words >= 4 chars)
                $maxLen = max(mb_strlen($qWord), mb_strlen($pWord));
                if ($maxLen >= 4 && levenshtein($qWord, $pWord) <= 2) {
                    $score += 40;
                    break;
                }
                // Phonetic sound match
                if (mb_strlen($qWord) >= 3 && mb_strlen($pWord) >= 3 && metaphone($qWord) === metaphone($pWord)) {
                    $score += 35;
                    break;
                }
            }
        }

        // 5. Category matches
        foreach ($product->categories as $cat) {
            $catLower = mb_strtolower($cat->name);
            if (str_contains($catLower, $queryLower)) {
                $score += 60;
            }
            foreach ($queryWords as $qWord) {
                if (str_contains($catLower, $qWord)) {
                    $score += 40;
                }
            }
        }

        // 6. Short description match
        if ($product->short_description && str_contains(mb_strtolower($product->short_description), $queryLower)) {
            $score += 30;
        }

        return $score;
    }

    /**
     * Format a product instance into an optimized API array.
     *
     * @return array<string, mixed>
     */
    private function formatProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => (float) $product->price,
            'discounted_price' => (float) $product->discounted_price,
            'discount_percentage' => (int) $product->discount_percentage,
            'in_stock' => $product->stock_quantity > 0,
            'category' => $product->categories->first()?->name,
            'image' => $product->mainImage?->image_path ?? '/storage/defaults/default-product.png',
            'url' => route('product.show', ['slug' => $product->slug]),
        ];
    }
}
