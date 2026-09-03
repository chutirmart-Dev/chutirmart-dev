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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('courier_name')->nullable()->after('payment_status');
            $table->string('consignment_id')->nullable()->after('courier_name');
            $table->string('courier_tracking_code')->nullable()->after('consignment_id');
            $table->string('courier_status')->nullable()->after('courier_tracking_code');
            $table->json('courier_response')->nullable()->after('courier_status');
            $table->timestamp('courier_sent_at')->nullable()->after('courier_response');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'courier_name',
                'consignment_id',
                'courier_tracking_code',
                'courier_status',
                'courier_response',
                'courier_sent_at',
            ]);
        });
    }
};
