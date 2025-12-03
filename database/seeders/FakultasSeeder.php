<?php

namespace Database\Seeders;

use App\Models\Fakultas;
use Illuminate\Database\Seeder;

class FakultasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fakultasData = [
            [
                'name' => 'Fakultas Teknik dan Teknologi Kemaritiman',
                'kode_fakultas' => 'FTTK',
                'is_active' => true,
            ],
            [
                'name' => 'Fakultas Ekonomi dan Bisnis Maritim',
                'kode_fakultas' => 'FEBM',
                'is_active' => true,
            ],
            [
                'name' => 'Fakultas Ilmu Kelautan dan Perikanan',
                'kode_fakultas' => 'FKP',
                'is_active' => true,
            ],
            [
                'name' => 'Fakultas Keguruan dan Ilmu Pendidikan',
                'kode_fakultas' => 'FKIP',
                'is_active' => true,
            ],
            [
                'name' => 'Fakultas Ilmu Sosial dan Ilmu Politik',
                'kode_fakultas' => 'FISIP',
                'is_active' => true,
            ],
            [
                'name' => 'Fakultas Kedokteran',
                'kode_fakultas' => 'FK',
                'is_active' => true,
            ],
            [
                'name' => 'Program Pasca Sarjana',
                'kode_fakultas' => 'PPS',
                'is_active' => true,
            ],
        ];

        foreach ($fakultasData as $fakultas) {
            Fakultas::firstOrCreate(
                ['name' => $fakultas['name']],
                $fakultas
            );
        }

        $this->command->info('Fakultas seeded successfully!');
        $this->command->info('Total: '.count($fakultasData).' Fakultas');
    }
}
