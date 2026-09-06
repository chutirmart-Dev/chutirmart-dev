<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DistrictSeeder::class,
            ThanaSeeder::class,
            StoreSettingsSeeder::class,
            AdminUserSeeder::class,
            ProductSeeder::class,
        ]);
    }
}
