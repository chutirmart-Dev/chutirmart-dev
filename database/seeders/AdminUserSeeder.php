<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('admin_users')->insert([
            'name' => 'Admin',
            'email' => 'admin@chutirmart.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('✅ Admin user created');
        $this->command->line('   Email:    admin@chutirmart.com');
        $this->command->line('   Password: admin123');
        $this->command->warn('   ⚠️  Change password after first login!');
    }
}
