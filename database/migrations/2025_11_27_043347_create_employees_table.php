<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create enum types for PostgreSQL (if using PostgreSQL)
        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement("CREATE TYPE employees_employment_status_enum AS ENUM ('active', 'inactive', 'retired', 'terminated')");
            DB::statement("CREATE TYPE employees_employment_type_enum AS ENUM ('permanent', 'contract', 'part_time', 'intern')");
            DB::statement("CREATE TYPE employees_gender_enum AS ENUM ('male', 'female')");
        }

        Schema::create('employees', function (Blueprint $table) use ($driver) {
            $table->char('id', 36)->primary();

            if ($driver === 'pgsql') {
                $table->string('employment_status')->nullable();
                $table->string('employment_type')->nullable();
                $table->string('gender')->nullable();
            } else {
                // For SQLite and MySQL, use string with enum values enforced at application level
                $table->string('employment_status')->nullable()->comment('Enum: active, inactive, retired, terminated');
                $table->string('employment_type')->nullable()->comment('Enum: permanent, contract, part_time, intern');
                $table->string('gender')->nullable()->comment('Enum: male, female');
            }

            $table->string('nip_nip3k_nik', 30)->nullable();
            $table->string('name', 255);
            $table->text('cek_data_note')->nullable();
            $table->string('place_of_birth', 150)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('management_position', 255)->nullable();
            $table->string('study_program', 255)->nullable();
            $table->char('unit_id', 36)->nullable();
            $table->char('homebase_unit_id', 36)->nullable();
            $table->string('pangkat', 100)->nullable();
            $table->string('golongan', 50)->nullable();
            $table->date('tmt_golongan')->nullable();
            $table->string('jabatan_fungsional', 150)->nullable();
            $table->decimal('kum', 10, 2)->nullable();
            $table->date('tmt_jabatan_fungsional')->nullable();
            $table->string('jabatan_fungsional_pppk', 150)->nullable();
            $table->date('tmt_jabatan_fungsional_pppk')->nullable();
            $table->string('education_level', 100)->nullable();
            $table->string('masa_kerja_text', 50)->nullable();
            $table->string('jabatan_struktural', 150)->nullable();
            $table->string('status_keaktifan', 100)->nullable();
            $table->string('jabatan_eselon', 100)->nullable();
            $table->text('siasn_notes')->nullable();
            $table->text('additional_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');

        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS employees_employment_status_enum');
            DB::statement('DROP TYPE IF EXISTS employees_employment_type_enum');
            DB::statement('DROP TYPE IF EXISTS employees_gender_enum');
        }
    }
};
