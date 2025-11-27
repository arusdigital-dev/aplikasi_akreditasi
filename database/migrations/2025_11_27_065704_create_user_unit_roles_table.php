<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // SQLite requires primary key to be defined in create statement
            DB::statement('CREATE TABLE user_unit_roles (
                user_id CHAR(36) NOT NULL,
                unit_id CHAR(36) NOT NULL,
                role_id CHAR(36) NOT NULL,
                PRIMARY KEY (user_id, unit_id, role_id)
            )');
        } else {
            Schema::create('user_unit_roles', function (Blueprint $table) {
                $table->char('user_id', 36);
                $table->char('unit_id', 36);
                $table->char('role_id', 36);
                $table->primary(['user_id', 'unit_id', 'role_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_unit_roles');
    }
};
