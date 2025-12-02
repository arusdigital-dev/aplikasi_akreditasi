<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Unit;
use App\Models\UnitType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PimpinanUniversitasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get Rektor role
        $rektorRole = Role::firstOrCreate(
            ['name' => 'Rektor'],
            [
                'description' => 'Rektor - Pimpinan tertinggi universitas, memiliki akses overview akreditasi tingkat universitas, visualisasi data universitas → fakultas → prodi, laporan eksekutif, dan insight kesiapan akreditasi',
            ]
        );

        // Create or get Wakil Rektor role
        $wakilRektorRole = Role::firstOrCreate(
            ['name' => 'Wakil Rektor'],
            [
                'description' => 'Wakil Rektor - Pimpinan universitas, memiliki akses overview akreditasi tingkat universitas, visualisasi data universitas → fakultas → prodi, laporan eksekutif, dan insight kesiapan akreditasi',
            ]
        );

        // Create or get Dekan role
        $dekanRole = Role::firstOrCreate(
            ['name' => 'Dekan'],
            [
                'description' => 'Dekan - Pimpinan fakultas, memiliki akses overview akreditasi tingkat fakultas, visualisasi data fakultas → prodi, laporan eksekutif fakultas, dan insight kesiapan akreditasi fakultas',
            ]
        );

        // Create or get Wakil Dekan role
        $wakilDekanRole = Role::firstOrCreate(
            ['name' => 'Wakil Dekan'],
            [
                'description' => 'Wakil Dekan - Pimpinan fakultas, memiliki akses overview akreditasi tingkat fakultas, visualisasi data fakultas → prodi, laporan eksekutif fakultas, dan insight kesiapan akreditasi fakultas',
            ]
        );

        // Create or get Kajur role
        $kajurRole = Role::firstOrCreate(
            ['name' => 'Kajur'],
            [
                'description' => 'Kepala Jurusan - Pimpinan program studi, memiliki akses overview akreditasi tingkat prodi, visualisasi data prodi, laporan eksekutif prodi, dan insight kesiapan akreditasi prodi',
            ]
        );

        // Get Fakultas Teknik dan Teknologi Kemaritiman (should exist from FakultasProdiSeeder)
        $fakultasTeknik = Unit::where('name', 'Fakultas Teknik dan Teknologi Kemaritiman')
            ->where('type', UnitType::Fakultas)
            ->first();

        if (! $fakultasTeknik) {
            // Fallback: create if FakultasProdiSeeder hasn't run yet
            $fakultasTeknik = Unit::create([
                'name' => 'Fakultas Teknik dan Teknologi Kemaritiman',
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]);
        }

        // Get Prodi Teknik Informatika (should exist from FakultasProdiSeeder)
        $prodiTI = Unit::where('name', 'Teknik Informatika')
            ->where('type', UnitType::Prodi)
            ->where('parent_id', $fakultasTeknik->id)
            ->first();

        if (! $prodiTI) {
            // Fallback: create if FakultasProdiSeeder hasn't run yet
            $prodiTI = Unit::create([
                'name' => 'Teknik Informatika',
                'type' => UnitType::Prodi,
                'parent_id' => $fakultasTeknik->id,
                'is_active' => true,
            ]);
        }

        // Create Rektor user
        $rektor = User::firstOrCreate(
            ['email' => 'rektor@umrah.ac.id'],
            [
                'name' => 'Rektor UMRAH',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        // Assign Rektor role
        if (! DB::table('user_roles')
            ->where('user_id', $rektor->id)
            ->where('role_id', $rektorRole->id)
            ->exists()) {
            DB::table('user_roles')->insert([
                'user_id' => $rektor->id,
                'role_id' => $rektorRole->id,
            ]);
        }

        // Create Wakil Rektor users
        $wakilRektor1 = User::firstOrCreate(
            ['email' => 'wakil.rektor1@umrah.ac.id'],
            [
                'name' => 'Wakil Rektor I',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        if (! DB::table('user_roles')
            ->where('user_id', $wakilRektor1->id)
            ->where('role_id', $wakilRektorRole->id)
            ->exists()) {
            DB::table('user_roles')->insert([
                'user_id' => $wakilRektor1->id,
                'role_id' => $wakilRektorRole->id,
            ]);
        }

        $wakilRektor2 = User::firstOrCreate(
            ['email' => 'wakil.rektor2@umrah.ac.id'],
            [
                'name' => 'Wakil Rektor II',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        if (! DB::table('user_roles')
            ->where('user_id', $wakilRektor2->id)
            ->where('role_id', $wakilRektorRole->id)
            ->exists()) {
            DB::table('user_roles')->insert([
                'user_id' => $wakilRektor2->id,
                'role_id' => $wakilRektorRole->id,
            ]);
        }

        // Create Dekan user for Fakultas Teknik dan Teknologi Kemaritiman
        $dekan = User::firstOrCreate(
            ['email' => 'dekan.teknik@umrah.ac.id'],
            [
                'name' => 'Dekan Fakultas Teknik dan Teknologi Kemaritiman',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
                'unit_id' => $fakultasTeknik->id,
            ]
        );

        // Assign Dekan role for specific unit
        if (! DB::table('user_unit_roles')
            ->where('user_id', $dekan->id)
            ->where('role_id', $dekanRole->id)
            ->where('unit_id', $fakultasTeknik->id)
            ->exists()) {
            DB::table('user_unit_roles')->insert([
                'user_id' => $dekan->id,
                'role_id' => $dekanRole->id,
                'unit_id' => $fakultasTeknik->id,
            ]);
        }

        // Create Wakil Dekan user for Fakultas Teknik dan Teknologi Kemaritiman
        $wakilDekan = User::firstOrCreate(
            ['email' => 'wakil.dekan.teknik@umrah.ac.id'],
            [
                'name' => 'Wakil Dekan Fakultas Teknik dan Teknologi Kemaritiman',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
                'unit_id' => $fakultasTeknik->id,
            ]
        );

        // Assign Wakil Dekan role for specific unit
        if (! DB::table('user_unit_roles')
            ->where('user_id', $wakilDekan->id)
            ->where('role_id', $wakilDekanRole->id)
            ->where('unit_id', $fakultasTeknik->id)
            ->exists()) {
            DB::table('user_unit_roles')->insert([
                'user_id' => $wakilDekan->id,
                'role_id' => $wakilDekanRole->id,
                'unit_id' => $fakultasTeknik->id,
            ]);
        }

        // Create Kajur user for Teknik Informatika
        $kajur = User::firstOrCreate(
            ['email' => 'kajur.ti@umrah.ac.id'],
            [
                'name' => 'Kepala Jurusan Teknik Informatika',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
                'unit_id' => $prodiTI->id,
            ]
        );

        // Assign Kajur role for specific unit
        if (! DB::table('user_unit_roles')
            ->where('user_id', $kajur->id)
            ->where('role_id', $kajurRole->id)
            ->where('unit_id', $prodiTI->id)
            ->exists()) {
            DB::table('user_unit_roles')->insert([
                'user_id' => $kajur->id,
                'role_id' => $kajurRole->id,
                'unit_id' => $prodiTI->id,
            ]);
        }

        // Create another Kajur for Teknik Elektro (from Fakultas Teknik dan Teknologi Kemaritiman)
        $prodiElektro = Unit::where('name', 'Teknik Elektro')
            ->where('type', UnitType::Prodi)
            ->where('parent_id', $fakultasTeknik->id)
            ->first();

        if ($prodiElektro) {
            $kajurElektro = User::firstOrCreate(
                ['email' => 'kajur.elektro@umrah.ac.id'],
                [
                    'name' => 'Kepala Jurusan Teknik Elektro',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                    'registration_completed_at' => now(),
                    'unit_id' => $prodiElektro->id,
                ]
            );

            if (! DB::table('user_unit_roles')
                ->where('user_id', $kajurElektro->id)
                ->where('role_id', $kajurRole->id)
                ->where('unit_id', $prodiElektro->id)
                ->exists()) {
                DB::table('user_unit_roles')->insert([
                    'user_id' => $kajurElektro->id,
                    'role_id' => $kajurRole->id,
                    'unit_id' => $prodiElektro->id,
                ]);
            }
        }

        $this->command->info('Pimpinan Universitas users created successfully!');
        $this->command->info('');
        $this->command->info('=== ROLES CREATED ===');
        $this->command->info('');
        $this->command->info('1. Rektor');
        $this->command->info('   Description: Pimpinan tertinggi universitas, memiliki akses overview akreditasi tingkat universitas');
        $this->command->info('');
        $this->command->info('2. Wakil Rektor');
        $this->command->info('   Description: Pimpinan universitas, memiliki akses overview akreditasi tingkat universitas');
        $this->command->info('');
        $this->command->info('3. Dekan');
        $this->command->info('   Description: Pimpinan fakultas, memiliki akses overview akreditasi tingkat fakultas');
        $this->command->info('');
        $this->command->info('4. Wakil Dekan');
        $this->command->info('   Description: Pimpinan fakultas, memiliki akses overview akreditasi tingkat fakultas');
        $this->command->info('');
        $this->command->info('5. Kajur');
        $this->command->info('   Description: Kepala Jurusan, memiliki akses overview akreditasi tingkat prodi');
        $this->command->info('');
        $this->command->info('=== USERS CREATED ===');
        $this->command->info('');
        $this->command->info('Rektor:');
        $this->command->info('  Email: rektor@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('Wakil Rektor I:');
        $this->command->info('  Email: wakil.rektor1@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('Wakil Rektor II:');
        $this->command->info('  Email: wakil.rektor2@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('Dekan Fakultas Teknik dan Teknologi Kemaritiman:');
        $this->command->info('  Email: dekan.teknik@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('  Unit: Fakultas Teknik dan Teknologi Kemaritiman');
        $this->command->info('');
        $this->command->info('Wakil Dekan Fakultas Teknik dan Teknologi Kemaritiman:');
        $this->command->info('  Email: wakil.dekan.teknik@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('  Unit: Fakultas Teknik dan Teknologi Kemaritiman');
        $this->command->info('');
        $this->command->info('Kajur Teknik Informatika:');
        $this->command->info('  Email: kajur.ti@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('  Unit: Teknik Informatika');
        if ($prodiElektro) {
            $this->command->info('');
            $this->command->info('Kajur Teknik Elektro:');
            $this->command->info('  Email: kajur.elektro@umrah.ac.id');
            $this->command->info('  Password: password');
            $this->command->info('  Unit: Teknik Elektro');
        }
    }
}
