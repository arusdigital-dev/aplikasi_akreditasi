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
        Schema::create('accreditation_cycles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('prodi_id');
            $table->foreignId('lam_id')->constrained('lams')->onDelete('restrict');
            $table->string('cycle_name', 100); // e.g., "Akreditasi 2025"
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->date('target_submission_date')->nullable();
            $table->enum('status', ['draft', 'active', 'submitted', 'evaluating', 'completed', 'archived'])->default('draft');
            $table->string('accreditation_result', 50)->nullable(); // Unggul, Baik Sekali, Baik, Tidak Terakreditasi
            $table->decimal('final_score', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('cascade');
            $table->index('prodi_id');
            $table->index('lam_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accreditation_cycles');
    }
};
