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
        Schema::table('documents', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['assignment_id']);
            $table->dropIndex(['assignment_id', 'issue_status']);
            
            // Make assignment_id nullable
            $table->foreignId('assignment_id')->nullable()->change();
            
            // Re-add foreign key constraint
            $table->foreign('assignment_id')->references('id')->on('assignments')->onDelete('cascade');
            
            // Re-add index
            $table->index(['assignment_id', 'issue_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // First, set all null assignment_ids to a default value or delete those records
            // For safety, we'll just drop and recreate the foreign key
            $table->dropForeign(['assignment_id']);
            $table->dropIndex(['assignment_id', 'issue_status']);
            $table->foreignId('assignment_id')->nullable(false)->change();
            $table->foreign('assignment_id')->references('id')->on('assignments')->onDelete('cascade');
            $table->index(['assignment_id', 'issue_status']);
        });
    }
};

