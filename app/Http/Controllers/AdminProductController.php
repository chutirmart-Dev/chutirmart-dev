<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->filled('q')) {
            $search = $request->input('q');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('product_code', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('featured')) {
            if ($request->input('featured') === 'best_selling') {
                $query->where('is_best_selling', true);
            } elseif ($request->input('featured') === 'new_arrival') {
                $query->where('is_new_arrival', true);
            }
        }

        $products = $query->with(['brand', 'categories', 'images' => fn ($q) => $q->where('is_main', true)])
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['q', 'status', 'featured']),
        ]);
    }

    public function create()
    {
        $brands = Brand::where('status', 'active')->get(['id', 'name']);
        $categories = Category::where('status', 'active')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Create', [
            'brands' => $brands,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'discount_type' => 'required|string|in:none,percentage,fixed,seasonal',
            'discount_value' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'description' => 'required|string',
            'status' => 'required|string|in:active,draft,archived',
            'brand_id' => 'nullable|exists:brands,id',
            'categories' => 'required|array|min:1',
            'is_best_selling' => 'nullable|boolean',
            'is_new_arrival' => 'nullable|boolean',
            'main_image' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'youtube_url' => 'nullable|url',
        ]);

        return DB::transaction(function () use ($request) {
            $productCode = 'PRD-'.strtoupper(Str::random(6));

            $isBestSelling = $request->boolean('is_best_selling');
            $isNewArrival = $request->boolean('is_new_arrival');
            if ($isBestSelling && $isNewArrival) {
                $isNewArrival = false;
            }

            $status = $request->status;
            if (($isBestSelling || $isNewArrival) && $status === 'draft') {
                $status = 'active';
            }

            $product = Product::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name).'-'.rand(100, 999),
                'product_code' => $productCode,
                'price' => $request->price,
                'compare_at_price' => $request->compare_at_price,
                'discount_type' => $request->discount_type,
                'discount_value' => $request->discount_value,
                'stock_quantity' => $request->stock_quantity,
                'description' => $request->description,
                'status' => $status,
                'is_best_selling' => $isBestSelling,
                'is_new_arrival' => $isNewArrival,
                'brand_id' => $request->brand_id,
                'youtube_url' => $request->youtube_url,
            ]);

            // Attach categories
            $product->categories()->attach($request->categories);

            $sortOrder = 0;

            // 1. Save Main Image
            if ($request->filled('main_image')) {
                $path = MediaService::storeImage($request->main_image, 'products', 1200);
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'sort_order' => $sortOrder++,
                    'is_main' => true,
                ]);
            }

            // 2. Save Gallery Images
            if ($request->has('gallery_images') && is_array($request->gallery_images)) {
                foreach ($request->gallery_images as $imgData) {
                    if (empty($imgData)) {
                        continue;
                    }
                    $path = MediaService::storeImage($imgData, 'products', 1200);
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'sort_order' => $sortOrder++,
                        'is_main' => ! $request->filled('main_image') && $sortOrder === 1,
                    ]);
                }
            }

            // 3. Fallback for legacy 'images' array
            if (! $request->filled('main_image') && ! $request->has('gallery_images') && $request->has('images') && is_array($request->images)) {
                foreach ($request->images as $index => $imgData) {
                    $path = MediaService::storeImage($imgData, 'products', 1200);
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'sort_order' => $sortOrder++,
                        'is_main' => $index === 0,
                    ]);
                }
            }

            // Ensure at least one image is marked as main
            if ($product->images()->count() > 0 && ! $product->images()->where('is_main', true)->exists()) {
                $product->images()->orderBy('sort_order', 'asc')->first()->update(['is_main' => true]);
            }

            return redirect()->route('admin.products.index')->with('success', 'পণ্যটি সফলভাবে যোগ করা হয়েছে।');
        });
    }

    public function edit(string $id)
    {
        $product = Product::with(['images', 'categories', 'brand'])->findOrFail($id);
        $brands = Brand::where('status', 'active')->get(['id', 'name']);
        $categories = Category::where('status', 'active')->get(['id', 'name']);

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'brands' => $brands,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'discount_type' => 'required|string|in:none,percentage,fixed,seasonal',
            'discount_value' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'description' => 'required|string',
            'status' => 'required|string|in:active,draft,archived',
            'brand_id' => 'nullable|exists:brands,id',
            'categories' => 'required|array|min:1',
            'is_best_selling' => 'nullable|boolean',
            'is_new_arrival' => 'nullable|boolean',
            'youtube_url' => 'nullable|url',
            'main_image_id' => 'nullable|integer',
            'new_main_image' => 'nullable|string',
            'new_gallery_images' => 'nullable|array',
            'new_gallery_images.*' => 'string',
            'deleted_image_ids' => 'nullable|array',
            'deleted_image_ids.*' => 'integer',
        ]);

        return DB::transaction(function () use ($request, $product) {
            $isBestSelling = $request->boolean('is_best_selling');
            $isNewArrival = $request->boolean('is_new_arrival');
            if ($isBestSelling && $isNewArrival) {
                $isNewArrival = false;
            }

            $status = $request->status;
            if (($isBestSelling || $isNewArrival) && $status === 'draft') {
                $status = 'active';
            }

            $product->update([
                'name' => $request->name,
                'price' => $request->price,
                'compare_at_price' => $request->compare_at_price,
                'discount_type' => $request->discount_type,
                'discount_value' => $request->discount_value,
                'stock_quantity' => $request->stock_quantity,
                'description' => $request->description,
                'status' => $status,
                'is_best_selling' => $isBestSelling,
                'is_new_arrival' => $isNewArrival,
                'brand_id' => $request->brand_id,
                'youtube_url' => $request->youtube_url,
            ]);

            // Sync categories
            $product->categories()->sync($request->categories);

            // 1. Delete removed images safely
            if ($request->has('deleted_image_ids') && is_array($request->deleted_image_ids)) {
                $imagesToDelete = ProductImage::where('product_id', $product->id)
                    ->whereIn('id', $request->deleted_image_ids)
                    ->get();
                foreach ($imagesToDelete as $delImg) {
                    $delImg->delete();
                }
            }

            // 2. Set new or existing main image
            if ($request->filled('new_main_image')) {
                // Clear existing main flags
                $product->images()->update(['is_main' => false]);

                $path = MediaService::storeImage($request->new_main_image, 'products', 1200);
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'sort_order' => 0,
                    'is_main' => true,
                ]);
            } elseif ($request->filled('main_image_id')) {
                $product->images()->update(['is_main' => false]);
                ProductImage::where('id', $request->main_image_id)
                    ->where('product_id', $product->id)
                    ->update(['is_main' => true, 'sort_order' => 0]);
            }

            // 3. Upload new gallery images
            if ($request->has('new_gallery_images') && is_array($request->new_gallery_images)) {
                $currentMaxSort = $product->images()->max('sort_order') ?? 0;
                foreach ($request->new_gallery_images as $index => $imgData) {
                    if (empty($imgData)) {
                        continue;
                    }
                    $path = MediaService::storeImage($imgData, 'products', 1200);
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'sort_order' => $currentMaxSort + $index + 1,
                        'is_main' => false,
                    ]);
                }
            }

            // 4. Legacy new_images fallback
            if ($request->has('new_images') && is_array($request->new_images)) {
                $currentCount = $product->images()->count();
                foreach ($request->new_images as $index => $imgData) {
                    $path = MediaService::storeImage($imgData, 'products', 1200);
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'sort_order' => $currentCount + $index,
                        'is_main' => $currentCount === 0 && $index === 0,
                    ]);
                }
            }

            // Ensure at least one main image is marked
            if ($product->images()->count() > 0 && ! $product->images()->where('is_main', true)->exists()) {
                $product->images()->orderBy('sort_order', 'asc')->first()->update(['is_main' => true]);
            }

            return redirect()->route('admin.products.index')->with('success', 'পণ্যটি সফলভাবে আপডেট করা হয়েছে।');
        });
    }

    public function destroy(string $id)
    {
        $product = Product::with('images')->findOrFail($id);

        DB::transaction(function () use ($product) {
            // Delete product images and physical files via model booted delete hook
            foreach ($product->images as $image) {
                $image->delete();
            }

            $product->categories()->detach();
            $product->delete();
        });

        return redirect()->route('admin.products.index')->with('success', 'পণ্যটি মুছে ফেলা হয়েছে।');
    }

    // Reviews Management inside product section
    public function reviews()
    {
        $reviews = Review::with('product')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Products/Reviews', [
            'reviews' => $reviews,
        ]);
    }

    public function updateReviewStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,approved,rejected',
            'verified' => 'boolean',
        ]);

        $review = Review::findOrFail($id);
        $review->update([
            'status' => $request->status,
            'verified' => $request->filled('verified') ? $request->verified : $review->verified,
        ]);

        return back()->with('success', 'রিভিউ স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।');
    }

    public function toggleFeatured(Request $request, string $id)
    {
        $request->validate([
            'feature' => 'required|string|in:is_best_selling,is_new_arrival',
        ]);

        $product = Product::findOrFail($id);
        $feature = $request->input('feature');
        $otherFeature = $feature === 'is_best_selling' ? 'is_new_arrival' : 'is_best_selling';
        $product->$feature = ! $product->$feature;

        // If enabled, strictly deactivate the other showcase feature so products never appear in two sections
        if ($product->$feature) {
            $product->$otherFeature = false;
        }

        // Auto-activate if showcased from draft
        if ($product->$feature && $product->status === 'draft') {
            $product->status = 'active';
        }

        $product->save();

        $label = $feature === 'is_best_selling' ? '🔥 সর্বাধিক বিক্রিত পণ্য' : '✨ নতুন পণ্য সমূহ';
        $state = $product->$feature ? 'যুক্ত করা হয়েছে' : 'সরিয়ে ফেলা হয়েছে';

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'product' => $product,
                'message' => "{$product->name} কে {$label} সেকশনে {$state}।",
            ]);
        }

        return back()->with('success', "{$product->name} কে {$label} সেকশনে {$state}।");
    }

    public function toggleStatus(string $id)
    {
        $product = Product::findOrFail($id);
        $product->status = $product->status === 'active' ? 'draft' : 'active';
        $product->save();

        $statusLabel = $product->status === 'active' ? 'Active (লাইভ)' : 'Draft (ড্রাফট)';

        return back()->with('success', "{$product->name} এর স্ট্যাটাস {$statusLabel} করা হয়েছে।");
    }
}
