<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Product ↔ Attribute Options (which specific options are available per product)
        if (! Schema::hasTable('product_attribute_options')) {
            Schema::create('product_attribute_options', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
                $table->foreignId('option_id')->constrained('attribute_values')->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['product_id', 'attribute_id', 'option_id'], 'pao_product_attr_opt_unique');
                $table->index(['product_id', 'attribute_id'], 'pao_product_attr_index');
            });
        }

        // Product Variations (a specific combination of attribute options)
        if (! Schema::hasTable('product_variations')) {
            Schema::create('product_variations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('sku')->nullable()->unique();
                $table->decimal('price', 10, 2)->nullable();       // null = use product base price
                $table->decimal('sale_price', 10, 2)->nullable();  // null = use product discounted price
                $table->integer('stock_quantity')->default(0);
                $table->enum('stock_status', ['in_stock', 'out_of_stock', 'backorder'])->default('in_stock');
                $table->string('image_path')->nullable();
                $table->decimal('weight', 8, 2)->nullable();
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamps();

                $table->index(['product_id', 'status']);
            });
        }

        // Variation ↔ Attribute Option mapping (e.g., variation 5 = Size:M + Color:Black)
        if (! Schema::hasTable('product_variation_options')) {
            Schema::create('product_variation_options', function (Blueprint $table) {
                $table->id();
                $table->foreignId('variation_id')->constrained('product_variations')->cascadeOnDelete();
                $table->foreignId('option_id')->constrained('attribute_values')->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['variation_id', 'option_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variation_options');
        Schema::dropIfExists('product_variations');
        Schema::dropIfExists('product_attribute_options');
    }
};
