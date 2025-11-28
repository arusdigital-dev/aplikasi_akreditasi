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

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            $table->char('unit_id', 36)->nullable();
            $table->string('action', 100);
            $table->string('entity_type', 50);
            $table->char('entity_id', 36)->nullable();
            $table->text('description')->nullable();
            $table->longText('metadata')->nullable();
            $table->string('ip_address', 100)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('user_id');
            $table->index('unit_id');
            $table->index('action');
            $table->index('entity_type');
            $table->index(['entity_type', 'entity_id']);
            $table->index('created_at');
        });

        // Add JSON validation constraint for MySQL
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_metadata_json_check CHECK (JSON_VALID(metadata) OR metadata IS NULL)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
