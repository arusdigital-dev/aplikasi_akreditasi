<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            return; // Skip for sqlite in tests
        }

        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropIndex(['assessor_id']);
        });

        DB::statement('ALTER TABLE evaluations MODIFY COLUMN assessor_id CHAR(36) NOT NULL');

        Schema::table('evaluations', function (Blueprint $table) {
            $table->foreign('assessor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            return; // Skip for sqlite in tests
        }

        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropForeign(['assessor_id']);
        });

        DB::statement('ALTER TABLE evaluations MODIFY COLUMN assessor_id BIGINT UNSIGNED NOT NULL');

        Schema::table('evaluations', function (Blueprint $table) {
            $table->index('assessor_id');
        });
    }
};

