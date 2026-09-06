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
            $table->string('meta_purchase_event_id', 100)->nullable()->after('updated_at');
            $table->boolean('meta_purchase_sent')->default(false)->after('meta_purchase_event_id')->index();
            $table->timestamp('meta_purchase_sent_at')->nullable()->after('meta_purchase_sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['meta_purchase_sent']);
            $table->dropColumn(['meta_purchase_event_id', 'meta_purchase_sent', 'meta_purchase_sent_at']);
        });
    }
};
