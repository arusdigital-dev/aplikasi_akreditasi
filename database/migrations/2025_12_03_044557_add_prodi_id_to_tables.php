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
        // Add prodi_id to users table
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('prodi_id')->nullable()->after('unit_id');
            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('set null');
        });

        // Add prodi_id to documents table
        Schema::table('documents', function (Blueprint $table) {
            $table->uuid('prodi_id')->nullable()->after('unit_id');
            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('set null');
        });

        // Add prodi_id to assignments table
        Schema::table('assignments', function (Blueprint $table) {
            $table->uuid('prodi_id')->nullable()->after('unit_id');
            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['prodi_id']);
            $table->dropColumn('prodi_id');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['prodi_id']);
            $table->dropColumn('prodi_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['prodi_id']);
            $table->dropColumn('prodi_id');
        });
    }
};
