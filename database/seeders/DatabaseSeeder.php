<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {


        $this->call([
            FakultasSeeder::class,
            ProdiSeeder::class,
            FakultasProdiSeeder::class, // Keep for backward compatibility with Unit model
            AdminLPMPPSeeder::class,
            CoordinatorProdiSeeder::class,
            AssessorInternalSeeder::class,
            PimpinanUniversitasSeeder::class,
            LAMSeeder::class,
            CriteriaPointSeeder::class,
        ]);
    }
}
