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

        $topSelling = Product::where('status', 'active')
            ->orderBy('total_sold', 'desc')
            ->take(8)
            ->with(['images' => fn ($q) => $q->where('is_main', true)])
            ->get();

        $allProducts = Product::where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->with(['images' => fn ($q) => $q->where('is_main', true)])
            ->get();

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
