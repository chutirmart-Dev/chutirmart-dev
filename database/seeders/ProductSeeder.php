<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Brands
        $brands = [
            ['name' => 'Xiaomi', 'slug' => 'xiaomi', 'status' => 'active'],
            ['name' => 'Philips', 'slug' => 'philips', 'status' => 'active'],
            ['name' => 'Kemei', 'slug' => 'kemei', 'status' => 'active'],
            ['name' => 'ChutirMart Select', 'slug' => 'chutirmart-select', 'status' => 'active'],
        ];
        foreach ($brands as $brand) {
            Brand::create($brand);
        }

        $xiaomi = Brand::where('slug', 'xiaomi')->first()->id;
        $select = Brand::where('slug', 'chutirmart-select')->first()->id;

        // 2. Create Categories
        $categories = [
            ['name' => 'Home & Kitchen', 'slug' => 'home-kitchen', 'icon' => '🍳', 'status' => 'active'],
            ['name' => 'Smart Gadgets', 'slug' => 'smart-gadgets', 'icon' => '⚡', 'status' => 'active'],
            ['name' => 'Offer Products', 'slug' => 'offer-products', 'icon' => '🎁', 'status' => 'active'],
            ['name' => 'Summer Products', 'slug' => 'summer-products', 'icon' => '☀️', 'status' => 'active'],
            ['name' => 'Feature Products', 'slug' => 'feature-products', 'icon' => '⭐', 'status' => 'active'],
        ];
        foreach ($categories as $cat) {
            Category::create($cat);
        }

        $home = Category::where('slug', 'home-kitchen')->first();
        $gadget = Category::where('slug', 'smart-gadgets')->first();
        $summer = Category::where('slug', 'summer-products')->first();
        $offer = Category::where('slug', 'offer-products')->first();

        // 3. Create Products
        $products = [
            [
                'name' => 'Xiaomi Turbo Handheld Mini Fan',
                'price' => 1200.00,
                'compare_at_price' => 1500.00,
                'discount_type' => 'percentage',
                'discount_value' => 20.00,
                'stock_quantity' => 45,
                'short_description' => 'পোর্টেবল রিচার্জেবল টাইপ-সি ফাস্ট চার্জিং মিনি ফ্যান। গ্রীষ্মের গরমে আরামদায়ক শীতল বাতাস।',
                'description' => '<h3>প্রোডাক্ট বিবরণী:</h3><p>গ্রীষ্মকালের জন্য এটি একটি আদর্শ পণ্য। ৩টি স্পিড মোড সহ শক্তিশালী ব্রাশলেস মোটর।</p><ul><li>ব্যাটারি লাইফ: ৮ ঘন্টা পর্যন্ত</li><li>চার্জিং টাইপ: টাইপ-সি ফাস্ট চার্জ</li><li>স্পিড মোড: ৩টি ভিন্ন মোড</li></ul>',
                'status' => 'active',
                'brand_id' => $xiaomi,
                'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'total_sold' => 234,
                'cats' => [$gadget->id, $summer->id],
            ],
            [
                'name' => 'Smart Watch T800 Ultra',
                'price' => 950.00,
                'compare_at_price' => 1200.00,
                'discount_type' => 'fixed',
                'discount_value' => 250.00,
                'stock_quantity' => 8, // Low stock for alerts
                'short_description' => '১.৯৯ ইঞ্চি বিগ ডিসপ্লে, ব্লুটুথ কলিং, ফিটনেস ট্র্যাকার এবং স্লিপ মনিটর স্পেক সহ স্মার্ট ওয়াচ।',
                'description' => '<h3>প্রোডাক্ট বিবরণী:</h3><p>এটি একটি স্টাইলিশ ও আধুনিক স্মার্টওয়াচ। কল করার সুবিধা ও স্বাস্থ্য ট্র্যাকিং ফিচারস সমৃদ্ধ।</p>',
                'status' => 'active',
                'brand_id' => $select,
                'total_sold' => 156,
                'cats' => [$gadget->id, $offer->id],
            ],
            [
                'name' => 'High-Speed Rechargeable Water Spray Gun',
                'price' => 2500.00,
                'compare_at_price' => 3500.00,
                'discount_type' => 'percentage',
                'discount_value' => 28.00,
                'stock_quantity' => 12,
                'short_description' => 'গাড়ি, বাইক এবং বাগান পরিষ্কার করার জন্য উচ্চ চাপের রিচার্জেবল ওয়াটার স্প্রে গান।',
                'description' => '<h3>প্রোডাক্ট বিবরণী:</h3><p>সহজে ব্যবহারের জন্য কর্ডলেস ডিজাইন। শক্তিশালী প্রেসার পাম্প।</p>',
                'status' => 'active',
                'brand_id' => $select,
                'total_sold' => 89,
                'cats' => [$home->id, $gadget->id],
            ],
            [
                'name' => 'Magic Kitchen Storage Rack',
                'price' => 850.00,
                'compare_at_price' => 1100.00,
                'discount_type' => 'none',
                'discount_value' => 0.00,
                'stock_quantity' => 30,
                'short_description' => 'রান্নাঘরের মসলার কৌটো ও হাড়ি-পাতিল গুছিয়ে রাখার জন্য বহুমুখী ৩-লেয়ার মেটাল র‍্যাক।',
                'description' => '<h3>প্রোডাক্ট বিবরণী:</h3><p>মরিচারোধী মেটাল কোটিং। দীর্ঘস্থায়ী এবং টেকসই গঠন।</p>',
                'status' => 'active',
                'brand_id' => $select,
                'total_sold' => 45,
                'cats' => [$home->id],
            ],
        ];

        foreach ($products as $prodData) {
            $cats = $prodData['cats'] ?? [];
            unset($prodData['cats']);

            $prodData['slug'] = Str::slug($prodData['name']);
            $prodData['product_code'] = 'PRD-'.strtoupper(Str::random(6));

            $product = Product::create($prodData);

            // Link categories
            $product->categories()->attach($cats);

            // Add placeholder images
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => 'defaults/default-product.svg',
                'sort_order' => 0,
                'is_main' => true,
            ]);
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => 'defaults/default-product.svg',
                'sort_order' => 1,
                'is_main' => false,
            ]);

            // Add Reviews
            Review::create([
                'product_id' => $product->id,
                'customer_name' => 'আব্দুর রহমান',
                'rating' => 5,
                'review_text' => 'খুব সুন্দর প্রোডাক্ট! ফ্যানের বাতাস বেশ ভালো এবং চার্জ অনেক সময় থাকে। দ্রুত ডেলিভারির জন্য ধন্যবাদ।',
                'status' => 'approved',
                'verified' => true,
            ]);

            Review::create([
                'product_id' => $product->id,
                'customer_name' => 'ফাতেমা আক্তার',
                'rating' => 4,
                'review_text' => 'দাম অনুযায়ী ভালো প্রোডাক্ট। ব্যবহারের পর রিভিউ দিচ্ছি। ক্যাশ অন ডেলিভারিতে পেয়েছি।',
                'status' => 'approved',
                'verified' => true,
            ]);
        }
    }
}
