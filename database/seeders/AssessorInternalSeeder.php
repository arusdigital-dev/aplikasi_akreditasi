<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AssessorInternalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get Asesor Internal role
        $assessorRole = Role::firstOrCreate(
            ['name' => 'Asesor Internal'],
            [
                'description' => 'Asesor Internal - Mengakses dokumen seluruh unit/prodi, melakukan penilaian kriteria akreditasi, mengisi skor dan catatan, melihat progres penilaian dan statistik akreditasi',
            ]
        );

        // Create Asesor Internal users
        $assessor1 = User::firstOrCreate(
            ['email' => 'asesor.internal1@umrah.ac.id'],
            [
                'name' => 'Asesor Internal 1',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        // Assign role to user
        if (! DB::table('user_roles')
            ->where('user_id', $assessor1->id)
            ->where('role_id', $assessorRole->id)
            ->exists()) {
            DB::table('user_roles')->insert([
                'user_id' => $assessor1->id,
                'role_id' => $assessorRole->id,
            ]);
        }

        $assessor2 = User::firstOrCreate(
            ['email' => 'asesor.internal2@umrah.ac.id'],
            [
                'name' => 'Asesor Internal 2',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        // Assign role to user
        if (! DB::table('user_roles')
            ->where('user_id', $assessor2->id)
            ->where('role_id', $assessorRole->id)
            ->exists()) {
            DB::table('user_roles')->insert([
                'user_id' => $assessor2->id,
                'role_id' => $assessorRole->id,
            ]);
        }

        $assessor3 = User::firstOrCreate(
            ['email' => 'asesor.internal3@umrah.ac.id'],
            [
                'name' => 'Asesor Internal 3',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        // Assign role to user
        if (! DB::table('user_roles')
            ->where('user_id', $assessor3->id)
            ->where('role_id', $assessorRole->id)
            ->exists()) {
            DB::table('user_roles')->insert([
                'user_id' => $assessor3->id,
                'role_id' => $assessorRole->id,
            ]);
        }

        $this->command->info('Asesor Internal users created successfully!');
        $this->command->info('');
        $this->command->info('Role: Asesor Internal');
        $this->command->info('Description: Mengakses dokumen seluruh unit/prodi, melakukan penilaian kriteria akreditasi, mengisi skor dan catatan, melihat progres penilaian dan statistik akreditasi');
        $this->command->info('');
        $this->command->info('User 1:');
        $this->command->info('  Email: asesor.internal1@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('User 2:');
        $this->command->info('  Email: asesor.internal2@umrah.ac.id');
        $this->command->info('  Password: password');
        $this->command->info('');
        $this->command->info('User 3:');
        $this->command->info('  Email: asesor.internal3@umrah.ac.id');
        $this->command->info('  Password: password');
    }
}
