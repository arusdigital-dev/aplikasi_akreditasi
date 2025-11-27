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
        // Create enum type for PostgreSQL (if using PostgreSQL)
        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement("CREATE TYPE units_type_enum AS ENUM ('fakultas', 'jurusan', 'program_studi', 'unit', 'lembaga')");
        }

        Schema::create('units', function (Blueprint $table) use ($driver) {
            $table->char('id', 36)->primary();

            if ($driver === 'pgsql') {
                $table->string('type');
            } else {
                // For SQLite and MySQL, use string with enum values enforced at application level
                $table->string('type')->comment('Enum: fakultas, jurusan, program_studi, unit, lembaga');
            }

            $table->string('name', 255);
            $table->string('kode_unit', 50)->nullable();
            $table->char('parent_id', 36)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('parent_id');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');

        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS units_type_enum');
        }
    }
};
