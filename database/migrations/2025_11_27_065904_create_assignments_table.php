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
        $driver = DB::getDriverName();

        // Create enum type for PostgreSQL (if using PostgreSQL)
        if ($driver === 'pgsql') {
            DB::statement("CREATE TYPE assignments_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'cancelled')");
        }

        Schema::create('assignments', function (Blueprint $table) use ($driver) {
            $table->id();
            $table->foreignId('criteria_id')->constrained('criteria')->onDelete('cascade');
            $table->unsignedBigInteger('assessor_id');
            $table->date('assigned_date');
            if ($driver === 'pgsql') {
                $table->string('status')->default('pending');
            } else {
                $table->string('status', 20)->default('pending')->comment('Enum: pending, in_progress, completed, cancelled');
            }
            $table->timestamps();

            $table->index('criteria_id');
            $table->index('assessor_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');

        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS assignments_status_enum');
        }
    }
};
