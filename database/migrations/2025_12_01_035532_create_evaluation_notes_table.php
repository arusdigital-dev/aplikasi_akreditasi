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
        Schema::create('evaluation_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->foreignUuid('document_id')->nullable()->constrained('documents')->onDelete('set null');
            $table->foreignUuid('assessor_id')->constrained('users')->onDelete('cascade');
            $table->string('short_assessment')->nullable(); // Penilaian singkat
            $table->text('general_notes')->nullable(); // Catatan umum
            $table->json('specific_notes')->nullable(); // Catatan khusus untuk kriteria tertentu [{criteria_id: string, note: string}]
            $table->enum('status', ['valid', 'invalid', 'minor_revision', 'major_revision'])->default('valid');
            $table->string('evaluation_file_path')->nullable(); // File PDF catatan evaluasi
            $table->string('evaluation_file_name')->nullable();
            $table->string('recommendation_file_path')->nullable(); // File Word rekomendasi
            $table->string('recommendation_file_name')->nullable();
            $table->json('attachments')->nullable(); // Array of lampiran pendukung [{path: string, name: string, type: string}]
            $table->timestamps();

            $table->index('assignment_id');
            $table->index('document_id');
            $table->index('assessor_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_notes');
    }
};
