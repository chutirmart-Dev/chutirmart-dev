<?php

namespace Database\Seeders;

use App\Models\District;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ThanaSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure any missing districts exist
        $missingDistricts = [
            ['name' => 'Faridpur', 'delivery_charge' => 130],
            ['name' => 'Gopalganj', 'delivery_charge' => 130],
            ['name' => 'Madaripur', 'delivery_charge' => 130],
            ['name' => 'Rajbari', 'delivery_charge' => 130],
            ['name' => 'Shariatpur', 'delivery_charge' => 130],
        ];

        foreach ($missingDistricts as $d) {
            District::firstOrCreate(
                ['name' => $d['name']],
                ['delivery_charge' => $d['delivery_charge']]
            );
        }

        // 2. Comprehensive Bangladesh Thanas / Upazilas by District
        $districtThanas = [
            // Barisal Division
            'Barisal' => [
                'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Barisal Sadar',
                'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur',
            ],
            'Barguna' => [
                'Amtali', 'Bamna', 'Barguna Sadar', 'Betagi', 'Patharghata', 'Taltali',
            ],
            'Bhola' => [
                'Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan',
                'Manpura', 'Tazumuddin',
            ],
            'Jhalokati' => [
                'Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur',
            ],
            'Patuakhali' => [
                'Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kalapara', 'Mirzaganj',
                'Patuakhali Sadar', 'Rangabali',
            ],
            'Pirojpur' => [
                'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad (Swarupkati)',
                'Pirojpur Sadar', 'Indurkani (Zianagar)',
            ],

            // Chittagong Division
            'Chittagong' => [
                'Anwara', 'Banshkhali', 'Boalkhali', 'Chandanaish', 'Fatikchhari',
                'Hathazari', 'Karnafuli', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia',
                'Raozan', 'Sandwip', 'Satkania', 'Sitakunda', 'Kotwali', 'Panchlaish',
                'Pahartali', 'Halishahar', 'Khulshi', 'Bakalia', 'Bayezid', 'Chandgaon',
                'Double Mooring', 'Patenga',
            ],
            'Bandarban' => [
                'Alikadam', 'Bandarban Sadar', 'Lama', 'Naikhongchhari', 'Rowangchhari',
                'Ruma', 'Thanchi',
            ],
            'Brahmanbaria' => [
                'Akhaura', 'Ashuganj', 'Bancharampur', 'Bijoynagar', 'Brahmanbaria Sadar',
                'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail',
            ],
            'Chandpur' => [
                'Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua',
                'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti',
            ],
            'Comilla' => [
                'Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram',
                'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Lalmai', 'Meghna',
                'Monohargonj', 'Muradnagar', 'Nangalkot', 'Comilla Sadar',
                'Comilla Sadar Dakshin', 'Titas',
            ],
            'Cox\'s Bazar' => [
                'Chakaria', 'Cox\'s Bazar Sadar', 'Eidgaon', 'Kutubdia', 'Maheshkhali',
                'Pekua', 'Ramu', 'Teknaf', 'Ukhiya',
            ],
            'Feni' => [
                'Chhagalnaiya', 'Daganbhuiyan', 'Feni Sadar', 'Fulgazi', 'Parshuram',
                'Sonagazi',
            ],
            'Khagrachhari' => [
                'Dighinala', 'Guimara', 'Khagrachhari Sadar', 'Lakshmichhari',
                'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari', 'Ramgarh',
            ],
            'Lakshmipur' => [
                'Kamalnagar', 'Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati',
            ],
            'Noakhali' => [
                'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Kabirhat',
                'Noakhali Sadar', 'Senbagh', 'Sonaimuri', 'Subarnachar',
            ],
            'Rangamati' => [
                'Baghaichhari', 'Barkal', 'Belaichhari', 'Juraichhari', 'Kaptai',
                'Kawkhali', 'Langadu', 'Naniarchar', 'Rajasthali', 'Rangamati Sadar',
            ],

            // Dhaka Division
            'Dhaka' => [
                'Adabor', 'Badda', 'Bangshal', 'Biman Bandar', 'Cantonment', 'Chawkbazar',
                'Dakshinkhan', 'Darus Salam', 'Demra', 'Dhanmondi', 'Gendaria', 'Gulshan',
                'Hazaribagh', 'Jatrabari', 'Kadamtali', 'Kafrul', 'Kalabagan',
                'Kamrangirchar', 'Khilgaon', 'Khilkhet', 'Kotwali', 'Lalbagh', 'Mirpur',
                'Mohammadpur', 'Motijheel', 'New Market', 'Pallabi', 'Paltan', 'Ramna',
                'Rampura', 'Sabujbagh', 'Shah Ali', 'Shahbagh', 'Sher-e-Bangla Nagar',
                'Shyampur', 'Sutrapur', 'Tejgaon', 'Tejgaon Industrial Area', 'Turag',
                'Uttara', 'Uttar Khan', 'Vatara', 'Wari', 'Dhamrai', 'Dohar', 'Keraniganj',
                'Nawabganj', 'Savar',
            ],
            'Gazipur' => [
                'Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Tongi',
            ],
            'Kishoreganj' => [
                'Astagram', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Itna', 'Karimganj',
                'Katiadi', 'Kishoreganj Sadar', 'Kuliarchar', 'Mithamain', 'Nikli',
                'Pakundia', 'Tarail',
            ],
            'Manikganj' => [
                'Daulatpur', 'Ghior', 'Harirampur', 'Manikganj Sadar', 'Saturia',
                'Shibalaya', 'Singair',
            ],
            'Munshiganj' => [
                'Gazaria', 'Louhajang', 'Munshiganj Sadar', 'Sirajdikhan', 'Sreenagar',
                'Tongibari',
            ],
            'Narayanganj' => [
                'Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon',
                'Siddhirganj', 'Fatullah',
            ],
            'Narsingdi' => [
                'Belabo', 'Monohardi', 'Narsingdi Sadar', 'Palash', 'Raipura', 'Shibpur',
            ],
            'Tangail' => [
                'Basail', 'Bhuapur', 'Delduar', 'Dhanbari', 'Ghatail', 'Gopalpur',
                'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Tangail Sadar',
            ],
            'Faridpur' => [
                'Alfadanga', 'Bhanga', 'Boalmari', 'Charbhadrasan', 'Faridpur Sadar',
                'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha',
            ],
            'Gopalganj' => [
                'Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara',
            ],
            'Madaripur' => [
                'Kalkini', 'Madaripur Sadar', 'Rajoir', 'Shibchar', 'Dasar',
            ],
            'Rajbari' => [
                'Baliakandi', 'Goalandaghat', 'Kalukhali', 'Pangsha', 'Rajbari Sadar',
            ],
            'Shariatpur' => [
                'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Shariatpur Sadar',
                'Zanjira',
            ],

            // Khulna Division
            'Bagerhat' => [
                'Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat',
                'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola',
            ],
            'Chuadanga' => [
                'Alamdanga', 'Chuadanga Sadar', 'Damurhuda', 'Jibannagar',
            ],
            'Jessore' => [
                'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jessore Sadar', 'Jhikargachha',
                'Keshabpur', 'Manirampur', 'Sharsha',
            ],
            'Jhenaidah' => [
                'Harinakunda', 'Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Maheshpur',
                'Shailkupa',
            ],
            'Khulna' => [
                'Batiaghata', 'Dacope', 'Dighalia', 'Dumuria', 'Koyra', 'Paikgachha',
                'Phultala', 'Rupsha', 'Terokhada', 'Daulatpur', 'Khalishpur',
                'Khan Jahan Ali', 'Kotwali', 'Sonadanga',
            ],
            'Kushtia' => [
                'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Kushtia Sadar',
                'Mirpur',
            ],
            'Magura' => [
                'Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur',
            ],
            'Meherpur' => [
                'Gangni', 'Meherpur Sadar', 'Mujibnagar',
            ],
            'Narail' => [
                'Kalia', 'Lohagara', 'Narail Sadar',
            ],
            'Satkhira' => [
                'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Satkhira Sadar',
                'Shyamnagar', 'Tala',
            ],

            // Mymensingh Division
            'Jamalpur' => [
                'Baksiganj', 'Dewanganj', 'Islampur', 'Jamalpur Sadar', 'Madarganj',
                'Melandaha', 'Sarishabari',
            ],
            'Mymensingh' => [
                'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur',
                'Haluaghat', 'Ishwarganj', 'Mymensingh Sadar', 'Muktagachha',
                'Nandail', 'Phulpur', 'Tara Khanda',
            ],
            'Mymensingh City' => [
                'Mymensingh Sadar', 'Kotwali',
            ],
            'Netrokona' => [
                'Atpara', 'Barhatta', 'Durgapur', 'Kalmakanda', 'Kendua', 'Madan',
                'Mohanganj', 'Netrokona Sadar', 'Purbadhala', 'Khaliajuri',
            ],
            'Sherpur' => [
                'Jhenaigati', 'Nakla', 'Nalitabari', 'Sherpur Sadar', 'Sreebardi',
            ],

            // Rajshahi Division
            'Bogra' => [
                'Adamdighi', 'Bogra Sadar', 'Dhunat', 'Dhupchanchia', 'Gabtali',
                'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur',
                'Shibganj', 'Sonatala',
            ],
            'Chapai Nawabganj' => [
                'Bholahat', 'Gomastapur', 'Nachole', 'Chapai Nawabganj Sadar', 'Shibganj',
            ],
            'Joypurhat' => [
                'Akkelpur', 'Joypurhat Sadar', 'Kalai', 'Khetlal', 'Panchbibi',
            ],
            'Naogaon' => [
                'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur',
                'Naogaon Sadar', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar',
            ],
            'Natore' => [
                'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Natore Sadar',
                'Singra', 'Naldanga',
            ],
            'Pabna' => [
                'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi',
                'Santhia', 'Sujanagar', 'Pabna Sadar',
            ],
            'Rajshahi' => [
                'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur',
                'Paba', 'Puthia', 'Tanore', 'Boalia', 'Matihar', 'Rajpara', 'Shah Makhdum',
            ],
            'Sirajganj' => [
                'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj',
                'Shahjadpur', 'Sirajganj Sadar', 'Tarash', 'Ullahpara',
            ],

            // Rangpur Division
            'Dinajpur' => [
                'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar',
                'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama',
                'Dinajpur Sadar', 'Nawabganj', 'Parbatipur',
            ],
            'Gaibandha' => [
                'Fulchhari', 'Gaibandha Sadar', 'Gobindaganj', 'Palashbari',
                'Sadullapur', 'Sughatta', 'Sundarganj',
            ],
            'Kurigram' => [
                'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Kurigram Sadar',
                'Nageshwari', 'Phulbari', 'Rajarhat', 'Routhmari', 'Ulipur',
            ],
            'Lalmonirhat' => [
                'Aditmari', 'Hatibandha', 'Kaliganj', 'Lalmonirhat Sadar', 'Patgram',
            ],
            'Nilphamari' => [
                'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Nilphamari Sadar', 'Saidpur',
            ],
            'Panchagarh' => [
                'Atwari', 'Boda', 'Debiganj', 'Panchagarh Sadar', 'Tetulia',
            ],
            'Rangpur' => [
                'Badarganj', 'Gangachhara', 'Kaunia', 'Rangpur Sadar', 'Mithapukur',
                'Pirgachha', 'Pirganj', 'Taraganj',
            ],
            'Thakurgaon' => [
                'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Thakurgaon Sadar',
            ],

            // Sylhet Division
            'Habiganj' => [
                'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Habiganj Sadar',
                'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj',
            ],
            'Moulvibazar' => [
                'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Moulvibazar Sadar',
                'Rajnagar', 'Sreemangal',
            ],
            'Sunamganj' => [
                'Bishwamvarpur', 'Chhatak', 'Dakshin Sunamganj (Shantiganj)', 'Derai',
                'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah',
                'Sunamganj Sadar', 'Tahirpur', 'Madhyanagar',
            ],
            'Sylhet' => [
                'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj',
                'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Osmani Nagar',
                'Sylhet Sadar', 'Zakiganj', 'South Surma',
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

            foreach ($thanas as $thanaName) {
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

        $this->command->info('✅ Seeded '.count($rowsToInsert).' thanas across Bangladesh.');
    }
}
