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
        Schema::create('prodi_indicator_scores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('accreditation_cycle_id');
            $table->foreign('accreditation_cycle_id')->references('id')->on('accreditation_cycles')->onDelete('cascade');
            $table->foreignId('lam_indicator_id')->constrained('lam_indicators')->onDelete('cascade');
            $table->uuid('assessor_id')->nullable(); // User who scored (can be null for coordinator self-assessment)
            $table->decimal('score', 5, 2);
            $table->text('notes')->nullable();
            $table->text('recommendations')->nullable();
            $table->enum('source', ['coordinator', 'assessor_internal', 'assessor_external'])->default('coordinator');
            $table->timestamps();

            $table->foreign('assessor_id')->references('id')->on('users')->onDelete('set null');
            $table->index('accreditation_cycle_id');
            $table->index('lam_indicator_id');
            $table->index('assessor_id');
            $table->unique(['accreditation_cycle_id', 'lam_indicator_id', 'assessor_id', 'source'], 'prodi_indicator_score_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prodi_indicator_scores');
    }
};
