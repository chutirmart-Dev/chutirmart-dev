<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DistrictSeeder extends Seeder
{
    public function run(): void
    {
        $dhaka = [
            'Dhaka', 'Narayanganj', 'Gazipur', 'Manikganj', 'Munshiganj',
            'Narsingdi', 'Tangail', 'Kishoreganj', 'Netrokona', 'Mymensingh', 'Jamalpur', 'Sherpur',
        ];

        $districts = [
            // Dhaka Division (Inside Dhaka = 80, Others = 130)
            ['name' => 'Dhaka', 'delivery_charge' => 80],
            ['name' => 'Narayanganj', 'delivery_charge' => 80],
            ['name' => 'Gazipur', 'delivery_charge' => 80],
            ['name' => 'Manikganj', 'delivery_charge' => 130],
            ['name' => 'Munshiganj', 'delivery_charge' => 130],
            ['name' => 'Narsingdi', 'delivery_charge' => 130],
            ['name' => 'Tangail', 'delivery_charge' => 130],
            ['name' => 'Kishoreganj', 'delivery_charge' => 130],
            ['name' => 'Netrokona', 'delivery_charge' => 130],
            ['name' => 'Mymensingh', 'delivery_charge' => 130],
            ['name' => 'Jamalpur', 'delivery_charge' => 130],
            ['name' => 'Sherpur', 'delivery_charge' => 130],
            // Chittagong Division
            ['name' => 'Chittagong', 'delivery_charge' => 130],
            ['name' => 'Comilla', 'delivery_charge' => 130],
            ['name' => 'Feni', 'delivery_charge' => 130],
            ['name' => 'Lakshmipur', 'delivery_charge' => 130],
            ['name' => 'Noakhali', 'delivery_charge' => 130],
            ['name' => 'Chandpur', 'delivery_charge' => 130],
            ['name' => 'Brahmanbaria', 'delivery_charge' => 130],
            ['name' => 'Cox\'s Bazar', 'delivery_charge' => 130],
            ['name' => 'Rangamati', 'delivery_charge' => 130],
            ['name' => 'Khagrachhari', 'delivery_charge' => 130],
            ['name' => 'Bandarban', 'delivery_charge' => 130],
            // Rajshahi Division
            ['name' => 'Rajshahi', 'delivery_charge' => 130],
            ['name' => 'Bogra', 'delivery_charge' => 130],
            ['name' => 'Pabna', 'delivery_charge' => 130],
            ['name' => 'Natore', 'delivery_charge' => 130],
            ['name' => 'Sirajganj', 'delivery_charge' => 130],
            ['name' => 'Naogaon', 'delivery_charge' => 130],
            ['name' => 'Joypurhat', 'delivery_charge' => 130],
            ['name' => 'Chapai Nawabganj', 'delivery_charge' => 130],
            // Khulna Division
            ['name' => 'Khulna', 'delivery_charge' => 130],
            ['name' => 'Jessore', 'delivery_charge' => 130],
            ['name' => 'Satkhira', 'delivery_charge' => 130],
            ['name' => 'Bagerhat', 'delivery_charge' => 130],
            ['name' => 'Narail', 'delivery_charge' => 130],
            ['name' => 'Magura', 'delivery_charge' => 130],
            ['name' => 'Meherpur', 'delivery_charge' => 130],
            ['name' => 'Chuadanga', 'delivery_charge' => 130],
            ['name' => 'Jhenaidah', 'delivery_charge' => 130],
            ['name' => 'Kushtia', 'delivery_charge' => 130],
            // Sylhet Division
            ['name' => 'Sylhet', 'delivery_charge' => 130],
            ['name' => 'Moulvibazar', 'delivery_charge' => 130],
            ['name' => 'Habiganj', 'delivery_charge' => 130],
            ['name' => 'Sunamganj', 'delivery_charge' => 130],
            // Barisal Division
            ['name' => 'Barisal', 'delivery_charge' => 130],
            ['name' => 'Bhola', 'delivery_charge' => 130],
            ['name' => 'Patuakhali', 'delivery_charge' => 130],
            ['name' => 'Pirojpur', 'delivery_charge' => 130],
            ['name' => 'Barguna', 'delivery_charge' => 130],
            ['name' => 'Jhalokati', 'delivery_charge' => 130],
            // Rangpur Division
            ['name' => 'Rangpur', 'delivery_charge' => 130],
            ['name' => 'Dinajpur', 'delivery_charge' => 130],
            ['name' => 'Gaibandha', 'delivery_charge' => 130],
            ['name' => 'Kurigram', 'delivery_charge' => 130],
            ['name' => 'Lalmonirhat', 'delivery_charge' => 130],
            ['name' => 'Nilphamari', 'delivery_charge' => 130],
            ['name' => 'Panchagarh', 'delivery_charge' => 130],
            ['name' => 'Thakurgaon', 'delivery_charge' => 130],
            // Mymensingh Division
            ['name' => 'Mymensingh City', 'delivery_charge' => 130],
        ];

        DB::table('districts')->insert(
            array_map(fn ($d) => array_merge($d, [
                'created_at' => now(),
                'updated_at' => now(),
            ]), $districts)
        );

        $this->command->info('✅ Districts seeded: '.count($districts).' districts');
    }
}
