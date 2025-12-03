<?php

namespace Database\Seeders;

use App\Models\Fakultas;
use App\Models\Prodi;
use App\Models\Program;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CoordinatorProdiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get Koordinator Prodi role
        $coordinatorRole = Role::firstOrCreate(
            ['name' => 'Koordinator Prodi'],
            [
                'description' => 'Koordinator Program Studi - Mengelola dokumen dan monitoring akreditasi program studi',
            ]
        );

        // Alternative role name (if exists)
        $coordinatorRoleAlt = Role::firstOrCreate(
            ['name' => 'Koordinator Program Studi'],
            [
                'description' => 'Koordinator Program Studi - Mengelola dokumen dan monitoring akreditasi program studi',
            ]
        );

        // Get or create Fakultas Teknik
        $fakultas = Fakultas::firstOrCreate(
            ['name' => 'Fakultas Teknik'],
            [
                'kode_fakultas' => 'FT',
                'is_active' => true,
            ]
        );

        // Get or create Prodi Teknik Informatika
        $prodi = Prodi::firstOrCreate(
            ['name' => 'Teknik Informatika'],
            [
                'fakultas_id' => $fakultas->id,
                'kode_prodi' => 'TI',
                'is_active' => true,
            ]
        );

        // Create Koordinator Prodi user for Teknik Informatika
        $coordinator1 = User::firstOrCreate(
            ['email' => 'koor.ti@umrah.ac.id'],
            [
                'name' => 'Koordinator Teknik Informatika',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
                'prodi_id' => $prodi->id,
            ]
        );

        // Assign role to user (global role, not unit-specific)
        if (! $coordinator1->roles->contains($coordinatorRole->id)) {
            $coordinator1->roles()->attach($coordinatorRole->id);
        }

        // Create another Prodi for variety
        $prodiSI = Prodi::firstOrCreate(
            ['name' => 'Sistem Informasi'],
            [
                'fakultas_id' => $fakultas->id,
                'kode_prodi' => 'SI',
                'is_active' => true,
            ]
        );

        // Create Koordinator Prodi user for Sistem Informasi
        $coordinator2 = User::firstOrCreate(
            ['email' => 'koor.si@umrah.ac.id'],
            [
                'name' => 'Koordinator Sistem Informasi',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
                'prodi_id' => $prodiSI->id,
            ]
        );

        // Assign role to user (global role, not unit-specific)
        if (! $coordinator2->roles->contains($coordinatorRole->id)) {
            $coordinator2->roles()->attach($coordinatorRole->id);
        }

        // Ensure programs exist for these prodi
        $programTI = Program::firstOrCreate(
            ['name' => 'Teknik Informatika'],
            [
                'jenjang' => 'S1',
                'fakultas' => 'Fakultas Teknik',
            ]
        );

        $programSI = Program::firstOrCreate(
            ['name' => 'Sistem Informasi'],
            [
                'jenjang' => 'S1',
                'fakultas' => 'Fakultas Teknik',
            ]
        );

        $this->command->info('Koordinator Prodi users created successfully!');
        $this->command->info('');
        $this->command->info('User 1:');
        $this->command->info('  Email: koor.ti@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('  Role: Koordinator Prodi');
        $this->command->info('  Prodi: Teknik Informatika');
        $this->command->info('');
        $this->command->info('User 2:');
        $this->command->info('  Email: koor.si@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('  Role: Koordinator Prodi');
        $this->command->info('  Prodi: Sistem Informasi');
    }
}
