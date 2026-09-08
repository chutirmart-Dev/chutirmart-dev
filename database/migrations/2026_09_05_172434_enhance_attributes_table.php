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
        Schema::table('attributes', function (Blueprint $table) {
            if (! Schema::hasColumn('attributes', 'slug')) {
                $table->string('slug')->nullable()->after('name');
            }
            if (! Schema::hasColumn('attributes', 'status')) {
                $table->enum('status', ['active', 'inactive'])->default('active')->after('type');
            }
            if (! Schema::hasColumn('attributes', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('status');
            }
        });

        // Backfill slugs for existing rows that have no slug
        DB::table('attributes')->orderBy('id')->whereNull('slug')->each(function ($attr) {
            DB::table('attributes')->where('id', $attr->id)->update([
                'slug' => Str::slug($attr->name).'-'.$attr->id,
            ]);
        });

        // Make slug unique after backfill (only if not already unique)
        $hasUnique = false;
        if (DB::connection()->getDriverName() === 'mysql') {
            $indexes = collect(DB::select("SHOW INDEX FROM `attributes` WHERE Key_name != 'PRIMARY'"))
                ->pluck('Key_name')->toArray();
            $hasUnique = in_array('attributes_slug_unique', $indexes);
        } elseif (method_exists(Schema::class, 'hasIndex')) {
            $hasUnique = Schema::hasIndex('attributes', 'attributes_slug_unique');
        }

        if (! $hasUnique) {
            Schema::table('attributes', function (Blueprint $table) {
                $table->string('slug')->nullable(false)->unique()->change();
            });
        }
    }

    public function down(): void
    {
        Schema::table('attributes', function (Blueprint $table) {
            if (Schema::hasColumn('attributes', 'slug')) {
                $table->dropUnique(['slug']);
                $table->dropColumn('slug');
            }
            if (Schema::hasColumn('attributes', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('attributes', 'sort_order')) {
                $table->dropColumn('sort_order');
            }
        });
    }
};
