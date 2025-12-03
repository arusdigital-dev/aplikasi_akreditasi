<?php

namespace Database\Seeders;

use App\Models\Fakultas;
use App\Models\Prodi;
use Illuminate\Database\Seeder;

class ProdiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Fakultas
        $fakultasTeknik = Fakultas::where('name', 'Fakultas Teknik dan Teknologi Kemaritiman')->first();
        $fakultasEkonomi = Fakultas::where('name', 'Fakultas Ekonomi dan Bisnis Maritim')->first();
        $fakultasKelautan = Fakultas::where('name', 'Fakultas Ilmu Kelautan dan Perikanan')->first();
        $fakultasKeguruan = Fakultas::where('name', 'Fakultas Keguruan dan Ilmu Pendidikan')->first();
        $fakultasFisip = Fakultas::where('name', 'Fakultas Ilmu Sosial dan Ilmu Politik')->first();
        $fakultasKedokteran = Fakultas::where('name', 'Fakultas Kedokteran')->first();
        $pascasarjana = Fakultas::where('name', 'Program Pasca Sarjana')->first();

        // 1. Fakultas Teknik dan Teknologi Kemaritiman
        $prodiTeknik = [
            ['name' => 'Teknik Informatika', 'kode_prodi' => 'TI'],
            ['name' => 'Teknik Elektro', 'kode_prodi' => 'TE'],
            ['name' => 'Teknik Perkapalan', 'kode_prodi' => 'TP'],
            ['name' => 'Kimia', 'kode_prodi' => 'KIM'],
            ['name' => 'Teknik Industri', 'kode_prodi' => 'TIN'],
            ['name' => 'Teknik Sipil', 'kode_prodi' => 'TS'],
            ['name' => 'Perencanaan Wilayah dan Kota', 'kode_prodi' => 'PWK'],
        ];

        foreach ($prodiTeknik as $prodi) {
            Prodi::firstOrCreate(
                [
                    'name' => $prodi['name'],
                    'fakultas_id' => $fakultasTeknik->id,
                ],
                [
                    'kode_prodi' => $prodi['kode_prodi'],
                    'is_active' => true,
                ]
            );
        }

        // 2. Fakultas Ekonomi dan Bisnis Maritim
        $prodiEkonomi = [
            ['name' => 'Akuntansi', 'kode_prodi' => 'AKT'],
            ['name' => 'Manajemen', 'kode_prodi' => 'MGT'],
            ['name' => 'Bisnis Digital', 'kode_prodi' => 'BD'],
            ['name' => 'Kewirausahaan', 'kode_prodi' => 'KWU'],
        ];

        foreach ($prodiEkonomi as $prodi) {
            Prodi::firstOrCreate(
                [
                    'name' => $prodi['name'],
                    'fakultas_id' => $fakultasEkonomi->id,
                ],
                [
                    'kode_prodi' => $prodi['kode_prodi'],
                    'is_active' => true,
                ]
            );
        }

        // 3. Fakultas Ilmu Kelautan dan Perikanan
        $prodiKelautan = [
            ['name' => 'Ilmu Kelautan', 'kode_prodi' => 'IK'],
            ['name' => 'Manajemen Sumberdaya Perairan', 'kode_prodi' => 'MSP'],
            ['name' => 'Budidaya Perairan', 'kode_prodi' => 'BP'],
            ['name' => 'Teknologi Hasil Perikanan', 'kode_prodi' => 'THP'],
            ['name' => 'Sosial Ekonomi Perikanan', 'kode_prodi' => 'SEP'],
        ];

        foreach ($prodiKelautan as $prodi) {
            Prodi::firstOrCreate(
                [
                    'name' => $prodi['name'],
                    'fakultas_id' => $fakultasKelautan->id,
                ],
                [
                    'kode_prodi' => $prodi['kode_prodi'],
                    'is_active' => true,
                ]
            );
        }

        // 4. Fakultas Keguruan dan Ilmu Pendidikan
        $prodiKeguruan = [
            ['name' => 'Pendidikan Bahasa dan Sastra Indonesia', 'kode_prodi' => 'PBSI'],
            ['name' => 'Pendidikan Bahasa Inggris', 'kode_prodi' => 'PBI'],
            ['name' => 'Pendidikan Matematika', 'kode_prodi' => 'PMTK'],
            ['name' => 'Pendidikan Biologi', 'kode_prodi' => 'PBIO'],
            ['name' => 'Pendidikan Kimia', 'kode_prodi' => 'PKIM'],
            ['name' => 'Pendidikan Profesi Guru', 'kode_prodi' => 'PPG'],
        ];

        foreach ($prodiKeguruan as $prodi) {
            Prodi::firstOrCreate(
                [
                    'name' => $prodi['name'],
                    'fakultas_id' => $fakultasKeguruan->id,
                ],
                [
                    'kode_prodi' => $prodi['kode_prodi'],
                    'is_active' => true,
                ]
            );
        }

        // 5. Fakultas Ilmu Sosial dan Ilmu Politik
        $prodiFisip = [
            ['name' => 'Ilmu Pemerintahan', 'kode_prodi' => 'IP'],
            ['name' => 'Administrasi Publik', 'kode_prodi' => 'AP'],
            ['name' => 'Sosiologi', 'kode_prodi' => 'SOS'],
            ['name' => 'Ilmu Hukum', 'kode_prodi' => 'IH'],
            ['name' => 'Hubungan Internasional', 'kode_prodi' => 'HI'],
            ['name' => 'Kajian Film, Televisi, dan Media', 'kode_prodi' => 'KFTM'],
        ];

        foreach ($prodiFisip as $prodi) {
            Prodi::firstOrCreate(
                [
                    'name' => $prodi['name'],
                    'fakultas_id' => $fakultasFisip->id,
                ],
                [
                    'kode_prodi' => $prodi['kode_prodi'],
                    'is_active' => true,
                ]
            );
        }

        // 6. Fakultas Kedokteran
        $prodiKedokteran = [
            ['name' => 'Kedokteran', 'kode_prodi' => 'KED'],
            ['name' => 'Pendidikan Profesi Dokter', 'kode_prodi' => 'PPD'],
        ];

        foreach ($prodiKedokteran as $prodi) {
            Prodi::firstOrCreate(
                [
                    'name' => $prodi['name'],
                    'fakultas_id' => $fakultasKedokteran->id,
                ],
                [
                    'kode_prodi' => $prodi['kode_prodi'],
                    'is_active' => true,
                ]
            );
        }

        // 7. Program Pasca Sarjana
        $prodiPascasarjana = [
            ['name' => 'Magister Administrasi Publik', 'kode_prodi' => 'MAP'],
            ['name' => 'Magister Ilmu Lingkungan', 'kode_prodi' => 'MIL'],
            ['name' => 'Magister Pedagogi', 'kode_prodi' => 'MP'],
            ['name' => 'Magister Ilmu Pemerintahan', 'kode_prodi' => 'MIP'],
            ['name' => 'Magister Manajemen', 'kode_prodi' => 'MM'],
        ];

        foreach ($prodiPascasarjana as $prodi) {
            Prodi::firstOrCreate(
                [
                    'name' => $prodi['name'],
                    'fakultas_id' => $pascasarjana->id,
                ],
                [
                    'kode_prodi' => $prodi['kode_prodi'],
                    'is_active' => true,
                ]
            );
        }

        $totalProdi = count($prodiTeknik) + count($prodiEkonomi) + count($prodiKelautan) +
                     count($prodiKeguruan) + count($prodiFisip) + count($prodiKedokteran) +
                     count($prodiPascasarjana);

        $this->command->info('Prodi seeded successfully!');
        $this->command->info('');
        $this->command->info('=== PRODI SUMMARY ===');
        $this->command->info('Fakultas Teknik dan Teknologi Kemaritiman: '.count($prodiTeknik).' prodi');
        $this->command->info('Fakultas Ekonomi dan Bisnis Maritim: '.count($prodiEkonomi).' prodi');
        $this->command->info('Fakultas Ilmu Kelautan dan Perikanan: '.count($prodiKelautan).' prodi');
        $this->command->info('Fakultas Keguruan dan Ilmu Pendidikan: '.count($prodiKeguruan).' prodi');
        $this->command->info('Fakultas Ilmu Sosial dan Ilmu Politik: '.count($prodiFisip).' prodi');
        $this->command->info('Fakultas Kedokteran: '.count($prodiKedokteran).' prodi');
        $this->command->info('Program Pasca Sarjana: '.count($prodiPascasarjana).' program');
        $this->command->info('Total: '.$totalProdi.' Prodi/Program');
    }
}
