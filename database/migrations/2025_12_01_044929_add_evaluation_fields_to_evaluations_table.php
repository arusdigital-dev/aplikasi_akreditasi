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
        Schema::table('evaluations', function (Blueprint $table) {
            $table->text('descriptive_narrative')->nullable()->after('notes'); // Narasi deskriptif penilaian
            $table->text('improvement_suggestion')->nullable()->after('descriptive_narrative'); // Saran perbaikan
            $table->enum('evaluation_status', ['passed', 'needs_improvement', 'inadequate'])->nullable()->after('improvement_suggestion'); // Status: Lulus kriteria, Butuh perbaikan, Tidak memadai
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropColumn(['descriptive_narrative', 'improvement_suggestion', 'evaluation_status']);
        });
    }
};
