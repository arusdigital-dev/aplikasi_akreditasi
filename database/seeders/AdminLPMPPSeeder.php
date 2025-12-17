<?php

namespace Database\Seeders;

use App\Models\Criterion;
use App\Models\Program;
use App\Models\Role;
use App\Models\Standard;
use App\Models\Unit;
use App\Models\UnitType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminLPMPPSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get Admin LPMPP role
        $adminRole = Role::firstOrCreate(
            ['name' => 'Admin LPMPP'],
            [
                'description' => 'Administrator Lembaga Penjaminan Mutu dan Pengembangan Pendidikan',
            ]
        );

        // Create Admin LPMPP user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin.lpmpp@umrah.ac.id'],
            [
                'name' => 'Admin LPMPP',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        // Assign role to user
        if (!$adminUser->roles()->where('role_id', $adminRole->id)->exists()) {
            $adminUser->roles()->attach($adminRole->id);
        }

        // Create some units for testing
        $fakultas = Unit::firstOrCreate(
            ['name' => 'Fakultas Teknik'],
            [
                'type' => UnitType::Fakultas,
                'is_active' => true,
            ]
        );

        $prodi = Unit::firstOrCreate(
            ['name' => 'Teknik Informatika'],
            [
                'type' => UnitType::Prodi,
                'parent_id' => $fakultas->id,
                'is_active' => true,
            ]
        );

        // Create some programs
        $program1 = Program::firstOrCreate(
            ['name' => 'Teknik Informatika'],
            [
                'jenjang' => 'S1',
                'fakultas' => 'Fakultas Teknik',
                'criteria_points_base_scale' => 500,
                'lam_name' => 'LAM INFOKOM',
            ]
        );

        $program2 = Program::firstOrCreate(
            ['name' => 'Sistem Informasi'],
            [
                'jenjang' => 'S1',
                'fakultas' => 'Fakultas Teknik',
                'criteria_points_base_scale' => 500,
                'lam_name' => 'LAM INFOKOM',
            ]
        );

        $program3 = Program::firstOrCreate(
            ['name' => 'Teknik Sipil'],
            [
                'jenjang' => 'S1',
                'fakultas' => 'Fakultas Teknik',
                'criteria_points_base_scale' => 500,
                'lam_name' => 'LAM TEKNIK',
            ]
        );

        // Create standards for programs
        $standard1 = Standard::firstOrCreate(
            [
                'program_id' => $program1->id,
                'name' => 'Standar 1: Visi, Misi, Tujuan dan Strategi',
            ],
            [
                'description' => 'Standar tentang visi, misi, tujuan dan strategi program studi',
                'weight' => 20.00,
                'order_index' => 1,
            ]
        );

        $standard2 = Standard::firstOrCreate(
            [
                'program_id' => $program1->id,
                'name' => 'Standar 2: Tata Pamong, Tata Kelola, dan Kerjasama',
            ],
            [
                'description' => 'Standar tentang tata pamong, tata kelola, dan kerjasama',
                'weight' => 15.00,
                'order_index' => 2,
            ]
        );

        // Create criteria for standards
        $criteria1 = Criterion::firstOrCreate(
            [
                'standard_id' => $standard1->id,
                'name' => 'Kriteria 1.1: Visi Program Studi',
            ],
            [
                'description' => 'Visi program studi yang jelas dan terukur',
                'weight' => 10.00,
                'order_index' => 1,
            ]
        );

        $criteria2 = Criterion::firstOrCreate(
            [
                'standard_id' => $standard1->id,
                'name' => 'Kriteria 1.2: Misi Program Studi',
            ],
            [
                'description' => 'Misi program studi yang mendukung visi',
                'weight' => 10.00,
                'order_index' => 2,
            ]
        );

        // Create assessor users for assignments
        $assessor1 = User::firstOrCreate(
            ['email' => 'assessor1@umrah.ac.id'],
            [
                'name' => 'Asesor 1',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        $assessor2 = User::firstOrCreate(
            ['email' => 'assessor2@umrah.ac.id'],
            [
                'name' => 'Asesor 2',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active' => true,
                'registration_completed_at' => now(),
            ]
        );

        // Note: assessor_id is bigint but User uses UUID
        // For now, we'll create assignments without assessor_id
        // You may need to update the migration to use UUID for assessor_id
        // or create a separate assessors table

        $this->command->info('Admin LPMPP user created successfully!');
        $this->command->info('Email: admin.lpmpp@umrah.ac.id');
        $this->command->info('Password: password');
        $this->command->info('Role: Admin LPMPP');
    }
}
