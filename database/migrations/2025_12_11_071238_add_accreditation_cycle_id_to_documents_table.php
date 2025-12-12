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
            $table->uuid('accreditation_cycle_id')->nullable()->after('assignment_id');
            $table->foreign('accreditation_cycle_id')->references('id')->on('accreditation_cycles')->onDelete('cascade');
            $table->index('accreditation_cycle_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['accreditation_cycle_id']);
            $table->dropIndex(['accreditation_cycle_id']);
            $table->dropColumn('accreditation_cycle_id');
        });
    }
};
