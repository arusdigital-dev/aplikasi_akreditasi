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
        Schema::table('prodis', function (Blueprint $table) {
            $table->foreignId('lam_id')->nullable()->after('fakultas_id')->constrained('lams')->onDelete('set null');
            $table->index('lam_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prodis', function (Blueprint $table) {
            $table->dropForeign(['lam_id']);
            $table->dropIndex(['lam_id']);
            $table->dropColumn('lam_id');
        });
    }
};
