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
        Schema::table('users', function (Blueprint $table) {
            // Add new columns only if they don't exist
            if (! Schema::hasColumn('users', 'unit_id')) {
                $table->char('unit_id', 36)->nullable()->after('id');
            }
            if (! Schema::hasColumn('users', 'employee_id')) {
                $table->char('employee_id', 36)->nullable()->after('unit_id');
            }
            if (! Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('employee_id');
            }
            if (! Schema::hasColumn('users', 'two_factor_secret')) {
                $table->text('two_factor_secret')->nullable()->after('password');
            }
            if (! Schema::hasColumn('users', 'two_factor_recovery_codes')) {
                $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            }
            if (! Schema::hasColumn('users', 'two_factor_confirmed_at')) {
                $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
            }
            if (! Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('remember_token');
            }
            if (! Schema::hasColumn('users', 'registration_completed_at')) {
                $table->timestamp('registration_completed_at')->nullable()->after('last_login_at');
            }
            if (! Schema::hasColumn('users', 'google_sso_enabled')) {
                $table->boolean('google_sso_enabled')->default(false)->after('registration_completed_at');
            }
            if (! Schema::hasColumn('users', 'google_sso_email')) {
                $table->string('google_sso_email', 255)->nullable()->after('google_sso_enabled');
            }
            if (! Schema::hasColumn('users', 'google_sso_sub')) {
                $table->string('google_sso_sub', 255)->nullable()->after('google_sso_email');
            }
            if (! Schema::hasColumn('users', 'google_sso_connected_at')) {
                $table->timestamp('google_sso_connected_at')->nullable()->after('google_sso_sub');
            }
        });

        // Drop google_id column if it exists
        if (Schema::hasColumn('users', 'google_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('google_id');
            });
        }

        // Add indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index('unit_id');
            $table->index('employee_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remove indexes first
            $table->dropIndex(['unit_id']);
            $table->dropIndex(['employee_id']);
            $table->dropIndex(['is_active']);

            // Remove new columns
            $table->dropColumn([
                'unit_id',
                'employee_id',
                'is_active',
                'two_factor_secret',
                'two_factor_recovery_codes',
                'two_factor_confirmed_at',
                'last_login_at',
                'registration_completed_at',
                'google_sso_enabled',
                'google_sso_email',
                'google_sso_sub',
                'google_sso_connected_at',
            ]);
        });

        // Restore google_id if needed
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->after('email');
        });
    }
};
