<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attribute_values', function (Blueprint $table) {
            if (! Schema::hasColumn('attribute_values', 'slug')) {
                $table->string('slug')->nullable()->after('value');
            }
            if (! Schema::hasColumn('attribute_values', 'status')) {
                $table->enum('status', ['active', 'inactive'])->default('active')->after('color_hex');
            }
            if (! Schema::hasColumn('attribute_values', 'image_path')) {
                $table->string('image_path')->nullable()->after('status');
            }
        });

        // Backfill slugs for existing rows that have no slug
        DB::table('attribute_values')->orderBy('id')->whereNull('slug')->each(function ($val) {
            DB::table('attribute_values')->where('id', $val->id)->update([
                'slug' => Str::slug($val->value).'-'.$val->id,
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('attribute_values', function (Blueprint $table) {
            if (Schema::hasColumn('attribute_values', 'slug')) {
                $table->dropColumn('slug');
            }
            if (Schema::hasColumn('attribute_values', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('attribute_values', 'image_path')) {
                $table->dropColumn('image_path');
            }
        });
    }
};
