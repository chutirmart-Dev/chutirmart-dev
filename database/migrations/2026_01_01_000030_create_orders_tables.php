<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Districts
        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->integer('delivery_charge')->nullable(); // null = use store default
            $table->timestamps();
        });

        // Thanas (sub-districts)
        Schema::create('thanas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        // Coupons
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->enum('type', ['percentage', 'fixed'])->default('fixed');
            $table->decimal('value', 10, 2);
            $table->decimal('min_order_amount', 10, 2)->default(0);
            $table->integer('max_uses')->nullable(); // null = unlimited
            $table->integer('used_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('mobile', 20)->index();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('district')->nullable();
            $table->integer('total_orders')->default(0); // denormalized
            $table->decimal('total_spent', 12, 2)->default(0); // denormalized
            $table->enum('status', ['new', 'returning', 'vip'])->default('new');
            $table->timestamps();
        });

        // Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 20)->unique(); // CHU-XXXXX
            // Customer info (snapshot — not FK, allows guest orders)
            $table->string('customer_name');
            $table->string('mobile', 20);
            $table->string('district');
            $table->string('thana')->nullable();
            $table->text('address');
            // Optional link to customer record
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            // Financials
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_charge', 10, 2)->default(0);
            $table->decimal('coupon_discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->string('coupon_code')->nullable();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            // Payment
            $table->enum('payment_method', ['cod', 'online'])->default('cod');
            $table->enum('payment_status', ['pending', 'paid', 'incomplete'])->default('pending');
            // Order status
            $table->enum('status', [
                'processing',
                'on_hold',
                'complete',
                'cancelled',
                'trash',
                'incomplete',
            ])->default('processing');
            $table->text('special_notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for common queries
            $table->index('status');
            $table->index('payment_status');
            $table->index('mobile');
            $table->index('created_at');
        });

        // Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name'); // snapshot
            $table->json('variant_info')->nullable(); // snapshot: [{attribute: "Color", value: "Red"}]
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('thanas');
        Schema::dropIfExists('districts');
    }
};
