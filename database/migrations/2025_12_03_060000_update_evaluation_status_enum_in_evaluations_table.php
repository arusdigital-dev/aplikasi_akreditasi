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
            Schema::table('evaluations', function (Blueprint $table) {
                $table->string('evaluation_status')->nullable()->change();
            });
        } else {
            DB::statement("ALTER TABLE evaluations MODIFY COLUMN evaluation_status ENUM('baik', 'cukup', 'baik_sekali', 'unggul') NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            Schema::table('evaluations', function (Blueprint $table) {
                $table->string('evaluation_status')->nullable()->change();
            });
        } else {
            DB::statement("ALTER TABLE evaluations MODIFY COLUMN evaluation_status ENUM('passed', 'needs_improvement', 'inadequate') NULL");
        }
    }
};

