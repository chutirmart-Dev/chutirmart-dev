<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Models\StoreSetting;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $banners = Banner::where('status', 'active')
            ->orderBy('sort_order')
            ->get(['id', 'title', 'image_path', 'link_url', 'position']);

        $sliderBanners = $banners->where('position', '!=', 'side')->values();
        $sideBanner = $banners->firstWhere('position', 'side');

        // Fallback: if no dedicated side banner exists but there are 2+ banners, use 2nd as side
        if (! $sideBanner && $banners->count() > 1) {
            $sideBanner = $banners->get(1);
        }

        $categories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'icon']);

        // 1. Best Selling Products (🔥 সর্বাধিক বিক্রিত পণ্য)
        $hasCustomBestSelling = Product::where('status', 'active')->where('is_best_selling', true)->exists();

        if ($hasCustomBestSelling) {
            $topSelling = Product::where('status', 'active')
                ->where('is_best_selling', true)
                ->latest('id')
                ->take(12)
                ->with(['images' => fn ($q) => $q->where('is_main', true)])
                ->get();
        } else {
            $topSelling = Product::where('status', 'active')
                ->orderBy('total_sold', 'desc')
                ->latest('id')
                ->take(12)
                ->with(['images' => fn ($q) => $q->where('is_main', true)])
                ->get();
        }

        // 2. New Arrival Products (✨ নতুন পণ্য সমূহ)
        $hasCustomNewArrivals = Product::where('status', 'active')->where('is_new_arrival', true)->exists();

        if ($hasCustomNewArrivals) {
            $allProducts = Product::where('status', 'active')
                ->where('is_new_arrival', true)
                ->latest('id')
                ->take(12)
                ->with(['images' => fn ($q) => $q->where('is_main', true)])
                ->get();
        } else {
            $topSellingIds = $topSelling->pluck('id')->toArray();
            $allProducts = Product::where('status', 'active')
                ->when(! empty($topSellingIds), fn ($q) => $q->whereNotIn('id', $topSellingIds))
                ->latest('id')
                ->take(12)
                ->with(['images' => fn ($q) => $q->where('is_main', true)])
                ->get();
        }

        // 3. Just For You Multi-Row Grid Products (⚡ আপনার জন্য নির্বাচিত পণ্য)
        $hasCustomJustForYou = Product::where('status', 'active')->where('is_featured', true)->exists();

        if ($hasCustomJustForYou) {
            $justForYou = Product::where('status', 'active')
                ->where('is_featured', true)
                ->latest('id')
                ->take(15)
                ->with(['images' => fn ($q) => $q->where('is_main', true)])
                ->get();

            // If admin selected fewer than 15, fill remaining slots with latest active products
            if ($justForYou->count() < 15) {
                $featuredIds = $justForYou->pluck('id')->toArray();
                $extraProducts = Product::where('status', 'active')
                    ->whereNotIn('id', $featuredIds)
                    ->latest('id')
                    ->take(15 - $justForYou->count())
                    ->with(['images' => fn ($q) => $q->where('is_main', true)])
                    ->get();
                $justForYou = $justForYou->concat($extraProducts);
            }
        } else {
            $justForYou = Product::where('status', 'active')
                ->latest('id')
                ->take(15)
                ->with(['images' => fn ($q) => $q->where('is_main', true)])
                ->get();
        }

        $reviews = Review::where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get(['id', 'customer_name', 'rating', 'review_text', 'verified']);

        // Urgent CTA banner info
        $urgencyProductId = StoreSetting::getValue('urgency_banner_product_id');
        $urgencyProduct = null;
        if ($urgencyProductId) {
            $urgencyProduct = Product::find($urgencyProductId);
        }

        return Inertia::render('Storefront/Home', [
            'banners' => $banners,
            'sliderBanners' => $sliderBanners,
            'sideBanner' => $sideBanner,
            'categories' => $categories,
            'topSelling' => $topSelling,
            'allProducts' => $allProducts,
            'justForYou' => $justForYou,
            'reviews' => $reviews,
            'urgencyBanner' => [
                'text' => StoreSetting::getValue('urgency_banner_text', 'সীমিত স্টক! এখনই অর্ডার করুন!'),
                'product' => $urgencyProduct,
            ],
            'whatsappNumber' => StoreSetting::getValue('whatsapp_number', '8801700000000'),
            'phone' => StoreSetting::getValue('contact_phone', '01700-000000'),
        ]);
    }
}
