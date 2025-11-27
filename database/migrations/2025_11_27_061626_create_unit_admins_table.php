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

        Schema::create('unit_admins', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('unit_id', 36);
            $table->char('user_id', 36);
            $table->string('assignment_type', 255)->default('manual');
            $table->longText('metadata')->nullable();
            $table->timestamps();

            $table->index('unit_id');
            $table->index('user_id');
        });

        // Add JSON validation constraint for MySQL
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE unit_admins ADD CONSTRAINT unit_admins_metadata_json_check CHECK (JSON_VALID(metadata) OR metadata IS NULL)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit_admins');
    }
};
