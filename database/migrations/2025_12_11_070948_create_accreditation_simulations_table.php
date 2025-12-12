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
        Schema::create('accreditation_simulations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('accreditation_cycle_id');
            $table->foreign('accreditation_cycle_id')->references('id')->on('accreditation_cycles')->onDelete('cascade');
            $table->uuid('created_by'); // User who ran the simulation
            $table->json('indicator_scores'); // {indicator_id: score}
            $table->json('standard_scores'); // {standard_id: {score, weighted_score}}
            $table->decimal('total_score', 5, 2);
            $table->string('predicted_result', 50); // Unggul, Baik Sekali, Baik, Tidak Terakreditasi
            $table->json('gap_analysis')->nullable(); // Areas that need improvement
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->index('accreditation_cycle_id');
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accreditation_simulations');
    }
};
