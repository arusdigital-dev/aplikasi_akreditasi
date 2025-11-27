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

        // Create enum type for PostgreSQL (if using PostgreSQL)
        if ($driver === 'pgsql') {
            DB::statement("CREATE TYPE user_social_accounts_provider_enum AS ENUM ('google', 'facebook', 'github', 'twitter', 'microsoft', 'apple')");
        }

        Schema::create('user_social_accounts', function (Blueprint $table) use ($driver) {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            if ($driver === 'pgsql') {
                $table->string('provider');
            } else {
                $table->string('provider')->comment('Enum: google, facebook, github, twitter, microsoft, apple');
            }
            $table->string('provider_user_id', 255);
            $table->string('email', 255)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->timestamp('connected_at')->useCurrent();
            $table->timestamp('revoked_at')->nullable();
            $table->text('metadata')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('provider');
            $table->index(['provider', 'provider_user_id']);
        });

        // Add JSON validation constraint for MySQL
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE user_social_accounts ADD CONSTRAINT user_social_accounts_metadata_json_check CHECK (JSON_VALID(metadata) OR metadata IS NULL)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_social_accounts');

        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('DROP TYPE IF EXISTS user_social_accounts_provider_enum');
        }
    }
};
