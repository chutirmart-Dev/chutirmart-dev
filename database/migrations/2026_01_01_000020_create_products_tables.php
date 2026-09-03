<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('product_code')->unique()->nullable(); // PRD-XXXXX
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable(); // original/strikethrough price
            $table->enum('discount_type', ['none', 'percentage', 'fixed', 'seasonal'])->default('none');
            $table->decimal('discount_value', 10, 2)->default(0);
            $table->decimal('cost_price', 10, 2)->nullable(); // for profit calculation
            $table->integer('stock_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(10);
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->string('youtube_url')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->enum('status', ['active', 'draft', 'archived'])->default('draft');
            $table->integer('total_sold')->default(0); // denormalized counter
            $table->timestamps();
            $table->softDeletes();
        });

        // Product Images
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_main')->default(false);
            $table->timestamps();
        });

        // Product ↔ Category (many-to-many)
        Schema::create('product_category', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->primary(['product_id', 'category_id']);
        });

        // Product ↔ Tag (many-to-many)
        Schema::create('product_tag', function (Blueprint $table) {
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['product_id', 'tag_id']);
        });

        // Product Variants (links to attribute_values)
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attribute_value_id')->constrained()->cascadeOnDelete();
            $table->decimal('additional_price', 10, 2)->default(0);
            $table->integer('stock_override')->nullable(); // if null, use product stock
            $table->timestamps();
        });

        // Reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name');
            $table->tinyInteger('rating')->unsigned(); // 1-5
            $table->text('review_text')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_tag');
        Schema::dropIfExists('product_category');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
    }
};
