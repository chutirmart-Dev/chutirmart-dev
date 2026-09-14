<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Make product_id nullable so store-wide customer reviews can be created
            $table->unsignedBigInteger('product_id')->nullable()->change();

            if (! Schema::hasColumn('reviews', 'customer_designation')) {
                $table->string('customer_designation')->nullable()->default('ভেরিফাইড ক্রেতা')->after('customer_name');
            }

            if (! Schema::hasColumn('reviews', 'customer_avatar')) {
                $table->string('customer_avatar')->nullable()->after('customer_designation');
            }

            if (! Schema::hasColumn('reviews', 'show_on_home')) {
                $table->boolean('show_on_home')->default(true)->after('verified');
            }

            if (! Schema::hasColumn('reviews', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('show_on_home');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable(false)->change();

            $columnsToDrop = [];
            if (Schema::hasColumn('reviews', 'customer_designation')) {
                $columnsToDrop[] = 'customer_designation';
            }
            if (Schema::hasColumn('reviews', 'customer_avatar')) {
                $columnsToDrop[] = 'customer_avatar';
            }
            if (Schema::hasColumn('reviews', 'show_on_home')) {
                $columnsToDrop[] = 'show_on_home';
            }
            if (Schema::hasColumn('reviews', 'sort_order')) {
                $columnsToDrop[] = 'sort_order';
            }

            if (! empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
