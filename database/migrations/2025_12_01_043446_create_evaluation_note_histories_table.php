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
        Schema::create('evaluation_note_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_note_id')->constrained('evaluation_notes')->onDelete('cascade');
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // created, updated, file_uploaded, status_changed, commented
            $table->text('notes')->nullable(); // Catatan perubahan
            $table->json('changes')->nullable(); // Track what changed (old values, new values)
            $table->string('version')->nullable(); // Versi evaluasi (v1, v2, etc.)
            $table->timestamps();

            $table->index(['evaluation_note_id', 'created_at']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_note_histories');
    }
};
