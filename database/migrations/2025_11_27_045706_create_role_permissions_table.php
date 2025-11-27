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
            DB::statement('CREATE TABLE role_permissions (
                role_id CHAR(36) NOT NULL,
                permission_id CHAR(36) NOT NULL,
                PRIMARY KEY (role_id, permission_id)
            )');
        } else {
            Schema::create('role_permissions', function (Blueprint $table) {
                $table->char('role_id', 36);
                $table->char('permission_id', 36);
                $table->primary(['role_id', 'permission_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
