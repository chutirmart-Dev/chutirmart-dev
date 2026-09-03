<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Banners (Homepage hero carousel)
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image_path');
            $table->string('link_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Store Settings (key-value store for admin configurable options)
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->enum('type', ['text', 'image', 'json', 'boolean', 'number'])->default('text');
            $table->timestamps();
        });

        // Landing Pages (campaign pages for Facebook Ads traffic)
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('hero_headline')->nullable();
            $table->text('hero_subtext')->nullable();
            $table->string('hero_image_path')->nullable();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->json('sections')->nullable(); // page builder blocks
            $table->string('cta_button_text')->default('এখনই অর্ডার করুন');
            $table->string('facebook_pixel_id')->nullable();
            $table->string('ga_id')->nullable();
            $table->enum('status', ['published', 'draft'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        // Admin Users (separate from storefront users)
        Schema::create('admin_users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'manager'])->default('admin');
            $table->string('avatar_path')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_users');
        Schema::dropIfExists('landing_pages');
        Schema::dropIfExists('store_settings');
        Schema::dropIfExists('banners');
    }
};
