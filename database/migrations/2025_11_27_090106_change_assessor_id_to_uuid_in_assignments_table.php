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
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropIndex(['assessor_id']);
            $table->dropColumn('assessor_id');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->foreignUuid('assessor_id')->after('criteria_id')->constrained('users')->onDelete('cascade');
            $table->index('assessor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['assessor_id']);
            $table->dropIndex(['assessor_id']);
            $table->dropColumn('assessor_id');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->unsignedBigInteger('assessor_id')->after('criteria_id');
            $table->index('assessor_id');
        });
    }
};
