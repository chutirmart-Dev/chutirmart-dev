<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StoreSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Site Identity
            ['key' => 'site_name',              'value' => 'ChutirMart',                        'type' => 'text'],
            ['key' => 'site_tagline',           'value' => 'আপনার পছন্দের পণ্য, দ্রুত ডেলিভারি',    'type' => 'text'],
            ['key' => 'site_logo',              'value' => null,                                 'type' => 'image'],
            ['key' => 'favicon',                'value' => null,                                 'type' => 'image'],

            // Contact Info
            ['key' => 'contact_phone',          'value' => '01700-000000',                       'type' => 'text'],
            ['key' => 'contact_address',        'value' => 'ঢাকা, বাংলাদেশ',                    'type' => 'text'],
            ['key' => 'contact_email',          'value' => 'info@chutirmart.com',                'type' => 'text'],
            ['key' => 'whatsapp_number',        'value' => '8801700000000',                      'type' => 'text'],

            // Social Links
            ['key' => 'social_facebook',        'value' => 'https://facebook.com/chutirmart',    'type' => 'text'],
            ['key' => 'social_instagram',       'value' => '',                                   'type' => 'text'],
            ['key' => 'social_youtube',         'value' => '',                                   'type' => 'text'],

            // Footer
            ['key' => 'footer_about',           'value' => 'ChutirMart — বাংলাদেশের বিশ্বস্ত অনলাইন শপ। সেরা পণ্য, সেরা মূল্য।', 'type' => 'text'],
            ['key' => 'footer_link_group_1',    'value' => json_encode([
                'title' => 'দরকারি লিংক',
                'links' => [
                    ['label' => 'হোম', 'url' => '/'],
                    ['label' => 'শপ', 'url' => '/shop'],
                    ['label' => 'আমাদের সম্পর্কে', 'url' => '/about'],
                    ['label' => 'যোগাযোগ', 'url' => '/contact'],
                ],
            ]),                                                                                   'type' => 'json'],
            ['key' => 'footer_link_group_2',    'value' => json_encode([
                'title' => 'পলিসি',
                'links' => [
                    ['label' => 'শর্তাবলী', 'url' => '/terms'],
                    ['label' => 'প্রাইভেসি পলিসি', 'url' => '/terms#privacy'],
                    ['label' => 'রিটার্ন পলিসি', 'url' => '/terms#returns'],
                ],
            ]),                                                                                   'type' => 'json'],

            // Delivery Charges
            ['key' => 'delivery_inside_dhaka',  'value' => '80',                                 'type' => 'number'],
            ['key' => 'delivery_outside_dhaka', 'value' => '130',                                'type' => 'number'],

            // Payment Settings
            ['key' => 'cod_enabled',            'value' => '1',                                  'type' => 'boolean'],
            ['key' => 'online_payment_enabled', 'value' => '0',                                  'type' => 'boolean'],

            // Page Content
            ['key' => 'about_page_content',     'value' => '<h2>আমাদের সম্পর্কে</h2><p>ChutirMart বাংলাদেশের একটি বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম।</p>', 'type' => 'text'],
            ['key' => 'terms_page_content',     'value' => json_encode([
                'terms' => '<h3>সেবার শর্তাবলী</h3><p>আমাদের সেবা ব্যবহার করে আপনি এই শর্তগুলো মেনে নিচ্ছেন।</p>',
                'privacy' => '<h3>প্রাইভেসি পলিসি</h3><p>আমরা আপনার তথ্য সুরক্ষিত রাখি।</p>',
                'returns' => '<h3>রিটার্ন পলিসি</h3><p>পণ্য পেয়ে সন্তুষ্ট না হলে ৭ দিনের মধ্যে রিটার্ন করুন।</p>',
            ]),                                                                                   'type' => 'json'],

            // Featured product for urgency CTA banner on homepage
            ['key' => 'urgency_banner_product_id', 'value' => null,                              'type' => 'text'],
            ['key' => 'urgency_banner_text',    'value' => 'সীমিত স্টক! এখনই অর্ডার করুন!',    'type' => 'text'],
        ];

        DB::table('store_settings')->insert(
            array_map(fn ($s) => array_merge($s, [
                'created_at' => now(),
                'updated_at' => now(),
            ]), $settings)
        );

        $this->command->info('✅ Store settings seeded: '.count($settings).' settings');
    }
}
