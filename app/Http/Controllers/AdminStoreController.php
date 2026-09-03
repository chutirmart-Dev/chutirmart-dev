<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\LandingPage;
use App\Models\Product;
use App\Models\StoreSetting;
use App\Services\Courier\CourierManager;
use App\Services\MediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminStoreController extends Controller
{
    // Settings
    public function settings()
    {
        $settings = StoreSetting::all()->pluck('value', 'key')->toArray();

        $previewUrls = [
            'site_logo' => MediaService::resolveUrl($settings['site_logo'] ?? null, 'logo'),
            'site_logo_mobile' => MediaService::resolveUrl($settings['site_logo_mobile'] ?? null, 'logo'),
            'favicon' => MediaService::resolveUrl($settings['favicon'] ?? null, 'logo'),
        ];

        return Inertia::render('Admin/Store/Settings', [
            'settings' => $settings,
            'preview_urls' => $previewUrls,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'site_name' => 'required|string',
            'contact_phone' => 'required|string',
            'contact_email' => 'nullable|email',
            'contact_address' => 'nullable|string',
            'whatsapp_number' => 'required|string',
            'social_facebook' => 'nullable|string',
            'delivery_inside_dhaka' => 'required|numeric',
            'delivery_outside_dhaka' => 'required|numeric',
            'footer_about' => 'required|string',
            'terms_conditions' => 'nullable|string',
            'refund_policy' => 'nullable|string',
            'payment_cod_enabled' => 'nullable|string',
            'site_logo' => 'nullable|string',
            'favicon' => 'nullable|string',
            'site_logo_mobile' => 'nullable|string',
            'copyright_text' => 'nullable|string',
            // Integrations & Pixels
            'facebook_pixel_id' => 'nullable|string',
            'facebook_access_token' => 'nullable|string',
            'sms_api_key' => 'nullable|string',
            'sms_sender_id' => 'nullable|string',

            // Courier Partners
            'default_courier' => 'nullable|string',
            'steadfast_api_key' => 'nullable|string',
            'steadfast_client_id' => 'nullable|string',
            'steadfast_base_url' => 'nullable|string',
            'steadfast_enabled' => 'nullable|string',

            'paperfly_username' => 'nullable|string',
            'paperfly_password' => 'nullable|string',
            'paperfly_key' => 'nullable|string',
            'paperfly_base_url' => 'nullable|string',
            'paperfly_enabled' => 'nullable|string',

            'carrybee_api_key' => 'nullable|string',
            'carrybee_secret_key' => 'nullable|string',
            'carrybee_base_url' => 'nullable|string',
            'carrybee_enabled' => 'nullable|string',

            'pathao_client_id' => 'nullable|string',
            'pathao_client_secret' => 'nullable|string',
            'pathao_username' => 'nullable|string',
            'pathao_password' => 'nullable|string',
            'pathao_store_id' => 'nullable|string',
            'pathao_base_url' => 'nullable|string',
            'pathao_enabled' => 'nullable|string',

            'redx_api_token' => 'nullable|string',
            'redx_base_url' => 'nullable|string',
            'redx_enabled' => 'nullable|string',

            'custom_courier_name' => 'nullable|string',
            'custom_courier_tracking_url' => 'nullable|string',
            'custom_courier_enabled' => 'nullable|string',
        ]);

        if ($request->filled('site_logo') && str_starts_with($request->site_logo, 'data:image')) {
            MediaService::deleteImage(StoreSetting::where('key', 'site_logo')->value('value'));
            $data['site_logo'] = MediaService::storeImage($request->site_logo, 'logos', 800);
        }
        if ($request->filled('site_logo_mobile') && str_starts_with($request->site_logo_mobile, 'data:image')) {
            MediaService::deleteImage(StoreSetting::where('key', 'site_logo_mobile')->value('value'));
            $data['site_logo_mobile'] = MediaService::storeImage($request->site_logo_mobile, 'logos', 800);
        }
        if ($request->filled('favicon') && (str_starts_with($request->favicon, 'data:image') || str_starts_with($request->favicon, 'data:application') || str_starts_with($request->favicon, 'data:x-icon'))) {
            MediaService::deleteImage(StoreSetting::where('key', 'favicon')->value('value'));
            $data['favicon'] = MediaService::storeImage($request->favicon, 'logos', 256);
        }

        foreach ($data as $key => $value) {
            StoreSetting::setValue($key, $value ?? '');
        }

        return back()->with('success', 'Store settings updated successfully! 🎉');
    }

    // Banners
    public function banners()
    {
        $banners = Banner::orderBy('sort_order')->get();

        return Inertia::render('Admin/Store/Banners', [
            'banners' => $banners,
        ]);
    }

    public function storeBanner(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'position' => 'nullable|string|in:slider,side',
            'image' => 'required|string',
            'link_url' => 'nullable|string|max:500',
        ]);

        $imagePath = MediaService::storeImage($request->image, 'banners', 1600);

        $nextOrder = (Banner::max('sort_order') ?? 0) + 1;

        Banner::create([
            'title' => $request->title,
            'position' => $request->position ?? 'slider',
            'image_path' => $imagePath,
            'link_url' => $request->link_url,
            'sort_order' => $nextOrder,
            'status' => 'active',
        ]);

        return back()->with('success', 'ব্যানার যোগ করা হয়েছে।');
    }

    public function updateBanner(Request $request, string $id)
    {
        $banner = Banner::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'position' => 'nullable|string|in:slider,side',
            'link_url' => 'nullable|string|max:500',
            'image' => 'nullable|string',
        ]);

        $imagePath = $banner->getRawOriginal('image_path');

        if ($request->filled('image') && str_starts_with($request->image, 'data:image')) {
            $newPath = MediaService::storeImage($request->image, 'banners', 1600);
            MediaService::deleteImage($imagePath);
            $imagePath = $newPath;
        }

        $banner->update([
            'title' => $request->title ?? $banner->title,
            'position' => $request->position ?? $banner->position ?? 'slider',
            'link_url' => $request->link_url,
            'image_path' => $imagePath,
        ]);

        return back()->with('success', 'ব্যানার আপডেট করা হয়েছে।');
    }

    public function destroyBanner(string $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return back()->with('success', 'ব্যানার মুছে ফেলা হয়েছে।');
    }

    // Landing Pages
    public function landingPages()
    {
        $pages = LandingPage::with('product')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Store/LandingPages', [
            'pages' => $pages,
            'landingPages' => $pages,
            'products' => Product::where('status', 'active')->get(['id', 'name']),
        ]);
    }

    public function createLandingPage()
    {
        return Inertia::render('Admin/Store/LandingPages/Create', [
            'products' => Product::where('status', 'active')->with(['images', 'variants'])->get(),
        ]);
    }

    public function storeLandingPage(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:landing_pages,slug',
            'product_id' => 'required|exists:products,id',
            'hero_headline' => 'nullable|string',
            'hero_subtext' => 'nullable|string',
            'hero_image_path' => 'nullable|string',
            'cta_button_text' => 'nullable|string',
            'sections' => 'nullable|array',
            'facebook_pixel_id' => 'nullable|string',
            'ga_id' => 'nullable|string',
            'status' => 'required|in:published,draft',
        ]);

        $heroImagePath = $request->hero_image_path;
        if ($heroImagePath && str_starts_with($heroImagePath, 'data:image')) {
            $heroImagePath = MediaService::storeImage($heroImagePath, 'landing-pages', 1600);
        }

        $page = LandingPage::create([
            'title' => $request->title,
            'slug' => Str::slug($request->slug),
            'product_id' => $request->product_id,
            'hero_headline' => $request->hero_headline,
            'hero_subtext' => $request->hero_subtext,
            'hero_image_path' => $heroImagePath,
            'cta_button_text' => $request->cta_button_text ?? 'এখনই অর্ডার করুন',
            'sections' => $request->sections,
            'facebook_pixel_id' => $request->facebook_pixel_id,
            'ga_id' => $request->ga_id,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.landing-pages.edit', ['id' => $page->id])->with('success', 'ল্যান্ডিং পেজ তৈরি করা হয়েছে।');
    }

    public function editLandingPage(string $id)
    {
        $page = LandingPage::with(['product.images', 'product.variants'])->findOrFail($id);

        return Inertia::render('Admin/Store/LandingPages/Edit', [
            'page' => $page,
            'products' => Product::where('status', 'active')->with(['images', 'variants'])->get(),
        ]);
    }

    public function updateLandingPage(Request $request, string $id)
    {
        $page = LandingPage::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:landing_pages,slug,'.$id,
            'product_id' => 'required|exists:products,id',
            'hero_headline' => 'nullable|string',
            'hero_subtext' => 'nullable|string',
            'hero_image_path' => 'nullable|string',
            'cta_button_text' => 'nullable|string',
            'sections' => 'nullable|array',
            'facebook_pixel_id' => 'nullable|string',
            'ga_id' => 'nullable|string',
            'status' => 'required|in:published,draft',
        ]);

        $heroImagePath = $page->getRawOriginal('hero_image_path');
        if ($request->filled('hero_image_path') && str_starts_with($request->hero_image_path, 'data:image')) {
            $newPath = MediaService::storeImage($request->hero_image_path, 'landing-pages', 1600);
            MediaService::deleteImage($heroImagePath);
            $heroImagePath = $newPath;
        } elseif ($request->hero_image_path === null || $request->hero_image_path === '') {
            MediaService::deleteImage($heroImagePath);
            $heroImagePath = null;
        }

        $page->update([
            'title' => $request->title,
            'slug' => Str::slug($request->slug),
            'product_id' => $request->product_id,
            'hero_headline' => $request->hero_headline,
            'hero_subtext' => $request->hero_subtext,
            'hero_image_path' => $heroImagePath,
            'cta_button_text' => $request->cta_button_text ?? 'এখনই অর্ডার করুন',
            'sections' => $request->sections,
            'facebook_pixel_id' => $request->facebook_pixel_id,
            'ga_id' => $request->ga_id,
            'status' => $request->status,
        ]);

        return back()->with('success', 'ল্যান্ডিং পেজ আপডেট করা হয়েছে। 🎉');
    }

    public function duplicateLandingPage(string $id)
    {
        $original = LandingPage::findOrFail($id);

        $newSlug = Str::slug($original->slug.'-copy-'.Str::random(4));

        LandingPage::create([
            'title' => $original->title.' (Copy)',
            'slug' => $newSlug,
            'product_id' => $original->product_id,
            'hero_headline' => $original->hero_headline,
            'hero_subtext' => $original->hero_subtext,
            'hero_image_path' => $original->getRawOriginal('hero_image_path'),
            'cta_button_text' => $original->cta_button_text,
            'sections' => $original->sections,
            'facebook_pixel_id' => $original->facebook_pixel_id,
            'ga_id' => $original->ga_id,
            'status' => 'draft',
        ]);

        return back()->with('success', 'ল্যান্ডিং পেজ সফলভাবে ডুপ্লিকেট করা হয়েছে। 📋');
    }

    public function destroyLandingPage(string $id)
    {
        $page = LandingPage::findOrFail($id);
        $page->delete();

        return back()->with('success', 'ল্যান্ডিং পেজ মুছে ফেলা হয়েছে।');
    }

    // Messages
    public function messages()
    {
        return Inertia::render('Admin/Message');
    }

    public function help()
    {
        return Inertia::render('Admin/Help');
    }

    public function integrations()
    {
        $settings = StoreSetting::all()->pluck('value', 'key');

        return Inertia::render('Admin/Integrations', [
            'settings' => $settings,
            'couriers' => CourierManager::getSupportedCouriers(),
        ]);
    }
}
