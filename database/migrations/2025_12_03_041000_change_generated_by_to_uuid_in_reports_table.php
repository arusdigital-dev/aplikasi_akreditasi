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
            // Drop index first
            $table->dropIndex(['generated_by']);
            
            // Change column type to uuid
            $table->uuid('generated_by')->change();
            
            // Re-add index
            $table->index('generated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex(['generated_by']);
            $table->unsignedBigInteger('generated_by')->change();
            $table->index('generated_by');
        });
    }
};

