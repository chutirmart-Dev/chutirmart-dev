<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\LandingPage;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PageController extends Controller
{
    public function about()
    {
        $content = StoreSetting::getValue('about_page_content', '<h2>আমাদের সম্পর্কে</h2><p>ChutirMart বাংলাদেশের একটি বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম।</p>');

        return Inertia::render('Storefront/About', [
            'content' => $content,
        ]);
    }

    public function terms()
    {
        $defaultTerms = [
            'terms' => '<h3>সেবার শর্তাবলী</h3><p>আমাদের সেবা ব্যবহার করে আপনি এই শর্তগুলো মেনে নিচ্ছেন।</p>',
            'privacy' => '<h3>প্রাইভেসি পলিসি</h3><p>আমরা আপনার তথ্য সুরক্ষিত রাখি।</p>',
            'returns' => '<h3>রিটার্ন পলিসি</h3><p>পণ্য পেয়ে সন্তুষ্ট না হলে ৭ দিনের মধ্যে রিটার্ন করুন।</p>',
        ];

        $content = StoreSetting::getValue('terms_page_content', $defaultTerms);

        return Inertia::render('Storefront/Terms', [
            'terms' => $content['terms'] ?? $defaultTerms['terms'],
            'privacy' => $content['privacy'] ?? $defaultTerms['privacy'],
            'returns' => $content['returns'] ?? $defaultTerms['returns'],
        ]);
    }

    public function landingPage(string $slug)
    {
        $query = LandingPage::where('slug', $slug)
            ->with(['product.images', 'product.variants', 'product.reviews' => function ($q) {
                $q->where('status', 'approved')->latest();
            }]);

        // If not admin, only show published
        if (! Auth::guard('admin')->check()) {
            $query->where('status', 'published');
        }

        $landingPage = $query->firstOrFail();

        $districts = District::orderBy('name')->get(['id', 'name', 'delivery_charge']);
        $defaultInsideDhaka = (float) StoreSetting::getValue('delivery_inside_dhaka', 80);
        $defaultOutsideDhaka = (float) StoreSetting::getValue('delivery_outside_dhaka', 130);

        return Inertia::render('Storefront/LandingPage', [
            'landingPage' => $landingPage,
            'districts' => $districts,
            'defaultInsideDhaka' => $defaultInsideDhaka,
            'defaultOutsideDhaka' => $defaultOutsideDhaka,
        ]);
    }
}
