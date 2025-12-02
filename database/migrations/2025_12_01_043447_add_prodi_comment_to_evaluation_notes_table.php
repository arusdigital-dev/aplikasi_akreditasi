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
        Schema::table('evaluation_notes', function (Blueprint $table) {
            $table->text('prodi_comment')->nullable()->after('status'); // Komentar Prodi terhadap evaluasi
            $table->foreignUuid('prodi_comment_by')->nullable()->after('prodi_comment')->constrained('users')->onDelete('set null');
            $table->timestamp('prodi_comment_at')->nullable()->after('prodi_comment_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluation_notes', function (Blueprint $table) {
            $table->dropForeign(['prodi_comment_by']);
            $table->dropColumn(['prodi_comment', 'prodi_comment_by', 'prodi_comment_at']);
        });
    }
};
