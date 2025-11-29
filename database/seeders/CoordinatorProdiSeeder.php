<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Role;
use App\Models\Unit;
use App\Models\UnitType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
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

        // Get or create Fakultas Teknik (from AdminLPMPPSeeder)
        $fakultas = Unit::where('name', 'Fakultas Teknik')
            ->where('type', UnitType::Fakultas)
            ->first();

        if (! $fakultas) {
            $fakultas = Unit::create([
                'name' => 'Fakultas Teknik',
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]);
        }

        // Get or create Prodi Teknik Informatika
        $prodi = Unit::where('name', 'Teknik Informatika')
            ->where('type', UnitType::Prodi)
            ->first();

        if (! $prodi) {
            $prodi = Unit::create([
                'name' => 'Teknik Informatika',
                'type' => UnitType::Prodi,
                'parent_id' => $fakultas->id,
                'is_active' => true,
            ]);
        }

        // Create Koordinator Prodi user for Teknik Informatika
        $coordinator1 = User::firstOrCreate(
            ['email' => 'koor.ti@umrah.ac.id'],
            [
                'name' => 'Koordinator Teknik Informatika',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
                'unit_id' => $prodi->id,
            ]
        );

        // Assign role to user for specific unit (using user_unit_roles table)
        if (! DB::table('user_unit_roles')
            ->where('user_id', $coordinator1->id)
            ->where('role_id', $coordinatorRole->id)
            ->where('unit_id', $prodi->id)
            ->exists()) {
            DB::table('user_unit_roles')->insert([
                'user_id' => $coordinator1->id,
                'role_id' => $coordinatorRole->id,
                'unit_id' => $prodi->id,
            ]);
        }

        // Create another Prodi for variety
        $prodiSI = Unit::firstOrCreate(
            ['name' => 'Sistem Informasi'],
            [
                'type' => UnitType::Prodi,
                'parent_id' => $fakultas->id,
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
                'unit_id' => $prodiSI->id,
            ]
        );

        // Assign role to user for specific unit
        if (! DB::table('user_unit_roles')
            ->where('user_id', $coordinator2->id)
            ->where('role_id', $coordinatorRole->id)
            ->where('unit_id', $prodiSI->id)
            ->exists()) {
            DB::table('user_unit_roles')->insert([
                'user_id' => $coordinator2->id,
                'role_id' => $coordinatorRole->id,
                'unit_id' => $prodiSI->id,
            ]);
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
        $this->command->info('  Unit: Teknik Informatika');
        $this->command->info('');
        $this->command->info('User 2:');
        $this->command->info('  Email: koor.si@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('  Role: Koordinator Prodi');
        $this->command->info('  Unit: Sistem Informasi');
    }
}
