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
            $table->string('access_level', 20)->default('read_write')->comment('Enum: read_only, read_write, full_access')->after('status');
            $table->date('deadline')->nullable()->after('assigned_date');
            $table->foreignUuid('unit_id')->nullable()->constrained('units')->onDelete('set null')->after('criteria_id');
            $table->text('notes')->nullable()->after('deadline');
            $table->timestamp('unassigned_at')->nullable()->after('notes');
            $table->foreignUuid('unassigned_by')->nullable()->constrained('users')->onDelete('set null')->after('unassigned_at');
            $table->string('assignment_type', 50)->default('criteria')->comment('criteria, unit, program')->after('unit_id');

            $table->index('unit_id');
            $table->index('access_level');
            $table->index('deadline');
            $table->index('assignment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropForeign(['unassigned_by']);
            $table->dropIndex(['unit_id']);
            $table->dropIndex(['access_level']);
            $table->dropIndex(['deadline']);
            $table->dropIndex(['assignment_type']);
            $table->dropColumn([
                'access_level',
                'deadline',
                'unit_id',
                'notes',
                'unassigned_at',
                'unassigned_by',
                'assignment_type',
            ]);
        });
    }
};
