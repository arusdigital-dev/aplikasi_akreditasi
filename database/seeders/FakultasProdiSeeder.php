<?php

namespace Database\Seeders;

use App\Models\Unit;
use App\Models\UnitType;
use Illuminate\Database\Seeder;

class FakultasProdiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Fakultas Teknik dan Teknologi Kemaritiman
        $fakultasTeknik = Unit::firstOrCreate(
            ['name' => 'Fakultas Teknik dan Teknologi Kemaritiman'],
            [
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]
        );

        $prodiTeknik = [
            'Teknik Informatika',
            'Teknik Elektro',
            'Teknik Perkapalan',
            'Kimia',
            'Teknik Industri',
            'Teknik Sipil',
            'Perencanaan Wilayah dan Kota',
        ];

        foreach ($prodiTeknik as $prodiName) {
            Unit::firstOrCreate(
                [
                    'name' => $prodiName,
                    'type' => UnitType::Prodi,
                    'parent_id' => $fakultasTeknik->id,
                ],
                [
                    'is_active' => true,
                ]
            );
        }

        // 2. Fakultas Ekonomi dan Bisnis Maritim
        $fakultasEkonomi = Unit::firstOrCreate(
            ['name' => 'Fakultas Ekonomi dan Bisnis Maritim'],
            [
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]
        );

        $prodiEkonomi = [
            'Akuntansi',
            'Manajemen',
            'Bisnis Digital',
            'Kewirausahaan',
        ];

        foreach ($prodiEkonomi as $prodiName) {
            Unit::firstOrCreate(
                [
                    'name' => $prodiName,
                    'type' => UnitType::Prodi,
                    'parent_id' => $fakultasEkonomi->id,
                ],
                [
                    'is_active' => true,
                ]
            );
        }

        // 3. Fakultas Ilmu Kelautan dan Perikanan
        $fakultasKelautan = Unit::firstOrCreate(
            ['name' => 'Fakultas Ilmu Kelautan dan Perikanan'],
            [
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]
        );

        $prodiKelautan = [
            'Ilmu Kelautan',
            'Manajemen Sumberdaya Perairan',
            'Budidaya Perairan',
            'Teknologi Hasil Perikanan',
            'Sosial Ekonomi Perikanan',
        ];

        foreach ($prodiKelautan as $prodiName) {
            Unit::firstOrCreate(
                [
                    'name' => $prodiName,
                    'type' => UnitType::Prodi,
                    'parent_id' => $fakultasKelautan->id,
                ],
                [
                    'is_active' => true,
                ]
            );
        }

        // 4. Fakultas Keguruan dan Ilmu Pendidikan
        $fakultasKeguruan = Unit::firstOrCreate(
            ['name' => 'Fakultas Keguruan dan Ilmu Pendidikan'],
            [
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]
        );

        $prodiKeguruan = [
            'Pendidikan Bahasa dan Sastra Indonesia',
            'Pendidikan Bahasa Inggris',
            'Pendidikan Matematika',
            'Pendidikan Biologi',
            'Pendidikan Kimia',
            'Pendidikan Profesi Guru',
        ];

        foreach ($prodiKeguruan as $prodiName) {
            Unit::firstOrCreate(
                [
                    'name' => $prodiName,
                    'type' => UnitType::Prodi,
                    'parent_id' => $fakultasKeguruan->id,
                ],
                [
                    'is_active' => true,
                ]
            );
        }

        // 5. Fakultas Ilmu Sosial dan Ilmu Politik
        $fakultasFisip = Unit::firstOrCreate(
            ['name' => 'Fakultas Ilmu Sosial dan Ilmu Politik'],
            [
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]
        );

        $prodiFisip = [
            'Ilmu Pemerintahan',
            'Administrasi Publik',
            'Sosiologi',
            'Ilmu Hukum',
            'Hubungan Internasional',
            'Kajian Film, Televisi, dan Media',
        ];

        foreach ($prodiFisip as $prodiName) {
            Unit::firstOrCreate(
                [
                    'name' => $prodiName,
                    'type' => UnitType::Prodi,
                    'parent_id' => $fakultasFisip->id,
                ],
                [
                    'is_active' => true,
                ]
            );
        }

        // 6. Fakultas Kedokteran
        $fakultasKedokteran = Unit::firstOrCreate(
            ['name' => 'Fakultas Kedokteran'],
            [
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]
        );

        $prodiKedokteran = [
            'Kedokteran',
            'Pendidikan Profesi Dokter',
        ];

        foreach ($prodiKedokteran as $prodiName) {
            Unit::firstOrCreate(
                [
                    'name' => $prodiName,
                    'type' => UnitType::Prodi,
                    'parent_id' => $fakultasKedokteran->id,
                ],
                [
                    'is_active' => true,
                ]
            );
        }

        // 7. Program Pasca Sarjana S2
        $pascasarjana = Unit::firstOrCreate(
            ['name' => 'Program Pasca Sarjana'],
            [
                'type' => UnitType::Pascasarjana,
                'is_active' => true,
            ]
        );

        $prodiPascasarjana = [
            'Magister Administrasi Publik',
            'Magister Ilmu Lingkungan',
            'Magister Pedagogi',
            'Magister Ilmu Pemerintahan',
            'Magister Manajemen',
        ];

        foreach ($prodiPascasarjana as $prodiName) {
            Unit::firstOrCreate(
                [
                    'name' => $prodiName,
                    'type' => UnitType::Prodi,
                    'parent_id' => $pascasarjana->id,
                ],
                [
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Fakultas dan Prodi created successfully!');
        $this->command->info('');
        $this->command->info('=== FAKULTAS & PRODI SUMMARY ===');
        $this->command->info('');
        $this->command->info('Fakultas Teknik dan Teknologi Kemaritiman: '.count($prodiTeknik).' prodi');
        $this->command->info('Fakultas Ekonomi dan Bisnis Maritim: '.count($prodiEkonomi).' prodi');
        $this->command->info('Fakultas Ilmu Kelautan dan Perikanan: '.count($prodiKelautan).' prodi');
        $this->command->info('Fakultas Keguruan dan Ilmu Pendidikan: '.count($prodiKeguruan).' prodi');
        $this->command->info('Fakultas Ilmu Sosial dan Ilmu Politik: '.count($prodiFisip).' prodi');
        $this->command->info('Fakultas Kedokteran: '.count($prodiKedokteran).' prodi');
        $this->command->info('Program Pasca Sarjana: '.count($prodiPascasarjana).' program');
        $this->command->info('');
        $this->command->info('Total: 7 Fakultas/Pascasarjana, '.(
            count($prodiTeknik) +
            count($prodiEkonomi) +
            count($prodiKelautan) +
            count($prodiKeguruan) +
            count($prodiFisip) +
            count($prodiKedokteran) +
            count($prodiPascasarjana)
        ).' Prodi/Program');
    }
}
