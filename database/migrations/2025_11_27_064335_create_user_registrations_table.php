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
            DB::statement("CREATE TYPE user_registrations_status_enum AS ENUM ('pending', 'approved', 'rejected')");
        }

        Schema::create('user_registrations', function (Blueprint $table) use ($driver) {
            $table->char('id', 36)->primary();
            $table->char('employee_id', 36);
            $table->string('email', 255);
            if ($driver === 'pgsql') {
                $table->string('status')->default('pending');
            } else {
                $table->string('status')->default('pending')->comment('Enum: pending, approved, rejected');
            }
            $table->string('token', 120)->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->char('reviewed_by', 36)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('employee_id');
            $table->index('email');
            $table->index('status');
            $table->index('token');
            $table->index('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_registrations');

        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS user_registrations_status_enum');
        }
    }
};
