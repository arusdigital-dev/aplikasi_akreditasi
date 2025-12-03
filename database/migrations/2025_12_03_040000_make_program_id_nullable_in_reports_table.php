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
        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('program_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            // First, we need to set a default value for null program_ids before making it non-nullable
            // For safety, we'll just drop and recreate the foreign key
            $table->dropForeign(['program_id']);
            $table->foreignId('program_id')->nullable(false)->change();
            $table->foreign('program_id')->references('id')->on('programs')->onDelete('cascade');
        });
    }
};

