<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('accreditation_assessor_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('accreditation_cycle_id');
            $table->uuid('assessor_id'); // External assessor user
            $table->uuid('assigned_by'); // Admin LPMPP who assigned
            $table->date('assigned_date');
            $table->date('deadline')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('accreditation_cycle_id', 'acc_ass_assign_cycle_fk')->references('id')->on('accreditation_cycles')->onDelete('cascade');
            $table->foreign('assessor_id', 'acc_ass_assign_assessor_fk')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_by', 'acc_ass_assign_by_fk')->references('id')->on('users')->onDelete('cascade');
            $table->index('accreditation_cycle_id');
            $table->index('assessor_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accreditation_assessor_assignments');
    }
};
