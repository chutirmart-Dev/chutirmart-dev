<?php

namespace Database\Seeders;

use App\Models\District;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ThanaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure all 64 official districts exist with standard delivery charges
        $allDistricts = [
            // Dhaka Division
            ['name' => 'Dhaka', 'delivery_charge' => 80],
            ['name' => 'Gazipur', 'delivery_charge' => 80],
            ['name' => 'Narayanganj', 'delivery_charge' => 80],
            ['name' => 'Tangail', 'delivery_charge' => 130],
            ['name' => 'Kishoreganj', 'delivery_charge' => 130],
            ['name' => 'Manikganj', 'delivery_charge' => 130],
            ['name' => 'Munshiganj', 'delivery_charge' => 130],
            ['name' => 'Narsingdi', 'delivery_charge' => 130],
            ['name' => 'Faridpur', 'delivery_charge' => 130],
            ['name' => 'Gopalganj', 'delivery_charge' => 130],
            ['name' => 'Madaripur', 'delivery_charge' => 130],
            ['name' => 'Rajbari', 'delivery_charge' => 130],
            ['name' => 'Shariatpur', 'delivery_charge' => 130],
            // Chittagong Division
            ['name' => 'Chittagong', 'delivery_charge' => 130],
            ['name' => 'Comilla', 'delivery_charge' => 130],
            ['name' => 'Feni', 'delivery_charge' => 130],
            ['name' => 'Brahmanbaria', 'delivery_charge' => 130],
            ['name' => 'Rangamati', 'delivery_charge' => 130],
            ['name' => 'Noakhali', 'delivery_charge' => 130],
            ['name' => 'Chandpur', 'delivery_charge' => 130],
            ['name' => 'Lakshmipur', 'delivery_charge' => 130],
            ['name' => "Cox's Bazar", 'delivery_charge' => 130],
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
            ['name' => 'Kushtia', 'delivery_charge' => 130],
            ['name' => 'Jhenaidah', 'delivery_charge' => 130],
            // Barisal Division
            ['name' => 'Barisal', 'delivery_charge' => 130],
            ['name' => 'Bhola', 'delivery_charge' => 130],
            ['name' => 'Patuakhali', 'delivery_charge' => 130],
            ['name' => 'Pirojpur', 'delivery_charge' => 130],
            ['name' => 'Barguna', 'delivery_charge' => 130],
            ['name' => 'Jhalokati', 'delivery_charge' => 130],
            // Sylhet Division
            ['name' => 'Sylhet', 'delivery_charge' => 130],
            ['name' => 'Moulvibazar', 'delivery_charge' => 130],
            ['name' => 'Habiganj', 'delivery_charge' => 130],
            ['name' => 'Sunamganj', 'delivery_charge' => 130],
            // Rangpur Division
            ['name' => 'Rangpur', 'delivery_charge' => 130],
            ['name' => 'Dinajpur', 'delivery_charge' => 130],
            ['name' => 'Gaibandha', 'delivery_charge' => 130],
            ['name' => 'Kurigram', 'delivery_charge' => 130],
            ['name' => 'Nilphamari', 'delivery_charge' => 130],
            ['name' => 'Lalmonirhat', 'delivery_charge' => 130],
            ['name' => 'Thakurgaon', 'delivery_charge' => 130],
            ['name' => 'Panchagarh', 'delivery_charge' => 130],
            // Mymensingh Division
            ['name' => 'Mymensingh', 'delivery_charge' => 130],
            ['name' => 'Jamalpur', 'delivery_charge' => 130],
            ['name' => 'Netrokona', 'delivery_charge' => 130],
            ['name' => 'Sherpur', 'delivery_charge' => 130],
        ];

        foreach ($allDistricts as $d) {
            District::firstOrCreate(
                ['name' => $d['name']],
                ['delivery_charge' => $d['delivery_charge']]
            );
        }

        // Clean up redundant "Mymensingh City" district if it exists
        $cityDist = District::where('name', 'Mymensingh City')->first();
        $realMymensingh = District::where('name', 'Mymensingh')->first();
        if ($cityDist && $realMymensingh) {
            DB::table('thanas')->where('district_id', $cityDist->id)->update(['district_id' => $realMymensingh->id]);
            $cityDist->delete();
        }

        // 2. Comprehensive Bangladesh Thanas / Upazilas by District
        $districtThanas = [
            // Mymensingh Division
            'Mymensingh' => [
                'Trishal', 'Bhaluka', 'Muktagachha', 'Fulbaria', 'Gaffargaon',
                'Gauripur', 'Haluaghat', 'Ishwarganj', 'Mymensingh Sadar', 'Kotwali',
                'Nandail', 'Phulpur', 'Tarakanda', 'Dhobaura',
            ],
            'Jamalpur' => [
                'Jamalpur Sadar', 'Baksiganj', 'Dewanganj', 'Islampur', 'Madarganj',
                'Melandaha', 'Sarishabari',
            ],
            'Netrokona' => [
                'Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda',
                'Kendua', 'Khaliajuri', 'Madan', 'Mohanganj', 'Purbadhala',
            ],
            'Sherpur' => [
                'Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi',
            ],

            // Dhaka Division
            'Dhaka' => [
                'Adabor', 'Airport', 'Badda', 'Banani', 'Bangshal', 'Bhashantek',
                'Bhatara', 'Biman Bandar', 'Cantonment', 'Chawkbazar', 'Dakshinkhan',
                'Darus Salam', 'Demra', 'Dhanmondi', 'Gendaria', 'Gulshan', 'Hatirjheel',
                'Hazaribagh', 'Jatrabari', 'Kadamtali', 'Kafrul', 'Kalabagan',
                'Kamrangirchar', 'Khilgaon', 'Khilkhet', 'Kotwali', 'Lalbagh', 'Mirpur',
                'Mohammadpur', 'Motijheel', 'Mugda', 'New Market', 'Pallabi', 'Paltan',
                'Panthapath', 'Ramna', 'Rampura', 'Rupnagar', 'Sabujbagh', 'Shah Ali',
                'Shahbagh', 'Sher-e-Bangla Nagar', 'Shyampur', 'Sutrapur', 'Tejgaon',
                'Tejgaon Industrial Area', 'Turag', 'Uttara', 'Uttara East', 'Uttara West',
                'Uttar Khan', 'Vatara', 'Wari', 'Dhamrai', 'Dohar', 'Keraniganj',
                'Nawabganj', 'Savar',
            ],
            'Gazipur' => [
                'Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur',
                'Tongi', 'Tongi East', 'Tongi West', 'Bason', 'Gacha', 'Kashimpur', 'Konabari',
            ],
            'Narayanganj' => [
                'Narayanganj Sadar', 'Araihazar', 'Bandar', 'Fatullah', 'Rupganj',
                'Siddhirganj', 'Sonargaon',
            ],
            'Tangail' => [
                'Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Dhanbari',
                'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur',
                'Nagarpur', 'Sakhipur',
            ],
            'Kishoreganj' => [
                'Kishoreganj Sadar', 'Astagram', 'Bajitpur', 'Bhairab', 'Hossainpur',
                'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Mithamain',
                'Nikli', 'Pakundia', 'Tarail',
            ],
            'Manikganj' => [
                'Manikganj Sadar', 'Daulatpur', 'Ghior', 'Harirampur', 'Saturia',
                'Shibalaya', 'Singair',
            ],
            'Munshiganj' => [
                'Munshiganj Sadar', 'Gazaria', 'Louhajang', 'Sirajdikhan', 'Sreenagar',
                'Tongibari',
            ],
            'Narsingdi' => [
                'Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur',
            ],
            'Faridpur' => [
                'Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan',
                'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha',
            ],
            'Gopalganj' => [
                'Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara',
            ],
            'Madaripur' => [
                'Madaripur Sadar', 'Dasar', 'Kalkini', 'Rajoir', 'Shibchar',
            ],
            'Rajbari' => [
                'Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Kalukhali', 'Pangsha',
            ],
            'Shariatpur' => [
                'Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Zanjira',
            ],

            // Chittagong Division
            'Chittagong' => [
                'Chittagong Sadar', 'Akbar Shah', 'Anwara', 'Bakalia', 'Banshkhali',
                'Bayezid', 'Boalkhali', 'Chandanaish', 'Chandgaon', 'Chawkbazar',
                'Double Mooring', 'EPZ', 'Fatikchhari', 'Halishahar', 'Hathazari',
                'Karnafuli', 'Khulshi', 'Kotwali', 'Lohagara', 'Mirsharai',
                'Pahartali', 'Panchlaish', 'Patenga', 'Patiya', 'Rangunia',
                'Raozan', 'Sadarghat', 'Sandwip', 'Satkania', 'Sitakunda',
            ],
            "Cox's Bazar" => [
                "Cox's Bazar Sadar", 'Chakaria', 'Eidgaon', 'Kutubdia', 'Maheshkhali',
                'Pekua', 'Ramu', 'Teknaf', 'Ukhiya',
            ],
            'Comilla' => [
                'Comilla Sadar', 'Comilla Sadar Dakshin', 'Barura', 'Brahmanpara', 'Burichang',
                'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna',
                'Laksam', 'Lalmai', 'Meghna', 'Monohargonj', 'Muradnagar',
                'Nangalkot', 'Titas',
            ],
            'Feni' => [
                'Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Fulgazi', 'Parshuram', 'Sonagazi',
            ],
            'Brahmanbaria' => [
                'Brahmanbaria Sadar', 'Akhaura', 'Ashuganj', 'Bancharampur', 'Bijoynagar',
                'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail',
            ],
            'Rangamati' => [
                'Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Belaichhari', 'Juraichhari',
                'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali',
            ],
            'Noakhali' => [
                'Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya',
                'Kabirhat', 'Senbagh', 'Sonaimuri', 'Subarnachar',
            ],
            'Chandpur' => [
                'Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua',
                'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti',
            ],
            'Lakshmipur' => [
                'Lakshmipur Sadar', 'Kamalnagar', 'Raipur', 'Ramganj', 'Ramgati',
            ],
            'Khagrachhari' => [
                'Khagrachhari Sadar', 'Dighinala', 'Guimara', 'Lakshmichhari', 'Mahalchhari',
                'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh',
            ],
            'Bandarban' => [
                'Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari', 'Rowangchhari',
                'Ruma', 'Thanchi',
            ],

            // Rajshahi Division
            'Rajshahi' => [
                'Rajshahi Sadar', 'Bagha', 'Bagmara', 'Boalia', 'Chandrima',
                'Charghat', 'Durgapur', 'Godagari', 'Kashiadanga', 'Katakhali',
                'Matihar', 'Mohanpur', 'Paba', 'Puthia', 'Rajpara', 'Shah Makhdum', 'Tanore',
            ],
            'Bogra' => [
                'Bogra Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali',
                'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur',
                'Shibganj', 'Sonatala',
            ],
            'Pabna' => [
                'Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar',
                'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar',
            ],
            'Natore' => [
                'Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur',
                'Naldanga', 'Singra',
            ],
            'Sirajganj' => [
                'Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur',
                'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara',
            ],
            'Naogaon' => [
                'Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda',
                'Mohadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar',
            ],
            'Joypurhat' => [
                'Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi',
            ],
            'Chapai Nawabganj' => [
                'Chapai Nawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj',
            ],

            // Khulna Division
            'Khulna' => [
                'Khulna Sadar', 'Batiaghata', 'Dacope', 'Daulatpur', 'Dighalia',
                'Dumuria', 'Harintana', 'Khalishpur', 'Khan Jahan Ali', 'Kotwali',
                'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Sonadanga', 'Terokhada',
            ],
            'Jessore' => [
                'Jessore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha',
                'Keshabpur', 'Manirampur', 'Sharsha',
            ],
            'Satkhira' => [
                'Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj',
                'Shyamnagar', 'Tala',
            ],
            'Bagerhat' => [
                'Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat',
                'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola',
            ],
            'Narail' => [
                'Narail Sadar', 'Kalia', 'Lohagara',
            ],
            'Magura' => [
                'Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur',
            ],
            'Meherpur' => [
                'Meherpur Sadar', 'Gangni', 'Mujibnagar',
            ],
            'Chuadanga' => [
                'Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar',
            ],
            'Kushtia' => [
                'Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur',
            ],
            'Jhenaidah' => [
                'Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa',
            ],

            // Barisal Division
            'Barisal' => [
                'Barisal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara',
                'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur',
            ],
            'Bhola' => [
                'Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan',
                'Manpura', 'Tazumuddin',
            ],
            'Patuakhali' => [
                'Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki', 'Galachipa',
                'Kalapara', 'Mirzaganj', 'Rangabali',
            ],
            'Pirojpur' => [
                'Pirojpur Sadar', 'Bhandaria', 'Indurkani', 'Kawkhali', 'Mathbaria',
                'Nazirpur', 'Nesarabad (Swarupkati)',
            ],
            'Barguna' => [
                'Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali',
            ],
            'Jhalokati' => [
                'Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur',
            ],

            // Sylhet Division
            'Sylhet' => [
                'Sylhet Sadar', 'Airport', 'Balaganj', 'Beanibazar', 'Bishwanath',
                'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur',
                'Jalalabad', 'Kanaighat', 'Kotwali', 'Moglabazar', 'Osmani Nagar',
                'Shah Paran', 'South Surma', 'Zakiganj',
            ],
            'Moulvibazar' => [
                'Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura',
                'Rajnagar', 'Sreemangal',
            ],
            'Habiganj' => [
                'Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat',
                'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj',
            ],
            'Sunamganj' => [
                'Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Dakshin Sunamganj (Shantiganj)',
                'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj',
                'Madhyanagar', 'Sullah', 'Tahirpur',
            ],

            // Rangpur Division
            'Rangpur' => [
                'Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur',
                'Pirgachha', 'Pirganj', 'Taraganj',
            ],
            'Dinajpur' => [
                'Dinajpur Sadar', 'Biral', 'Birampur', 'Birganj', 'Bochaganj',
                'Chirirbandar', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama',
                'Nawabganj', 'Parbatipur', 'Phulbari',
            ],
            'Gaibandha' => [
                'Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari',
                'Sadullapur', 'Sughatta', 'Sundarganj',
            ],
            'Kurigram' => [
                'Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari',
                'Nageshwari', 'Phulbari', 'Rajarhat', 'Routhmari', 'Ulipur',
            ],
            'Nilphamari' => [
                'Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur',
            ],
            'Lalmonirhat' => [
                'Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram',
            ],
            'Thakurgaon' => [
                'Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail',
            ],
            'Panchagarh' => [
                'Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia',
            ],
        ];

        // Fetch all districts mapped by name
        $districts = District::all()->keyBy('name');

        $rowsToInsert = [];
        $now = now();

        foreach ($districtThanas as $districtName => $thanas) {
            $district = $districts->get($districtName);
            if (! $district) {
                continue;
            }

            // Deduplicate thanas per district
            $uniqueThanas = array_values(array_unique($thanas));

            foreach ($uniqueThanas as $thanaName) {
                $rowsToInsert[] = [
                    'district_id' => $district->id,
                    'name' => $thanaName,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // Wipe existing thanas to prevent duplicates and bulk insert
        DB::table('thanas')->delete();

        foreach (array_chunk($rowsToInsert, 100) as $chunk) {
            DB::table('thanas')->insert($chunk);
        }

        $this->command->info('✅ Successfully seeded '.count($rowsToInsert).' thanas across 64 districts.');
    }
}
