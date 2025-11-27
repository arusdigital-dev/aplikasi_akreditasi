<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        // Check if ID is already UUID
        $columnType = DB::select('PRAGMA table_info(users)')[0]->type ?? null;
        if ($driver === 'sqlite') {
            $tableInfo = DB::select('PRAGMA table_info(users)');
            $idColumn = collect($tableInfo)->firstWhere('name', 'id');
            if ($idColumn && $idColumn->type === 'char(36)') {
                return; // Already UUID
            }
        }

        // For SQLite, we need to recreate the table
        if ($driver === 'sqlite') {
            // Get current table structure
            $tableInfo = DB::select('PRAGMA table_info(users)');
            $columns = collect($tableInfo)->map(function ($col) {
                $def = $col->name;
                if ($col->name === 'id') {
                    $def .= ' CHAR(36) PRIMARY KEY';
                } else {
                    $def .= ' '.$col->type;
                    if ($col->notnull) {
                        $def .= ' NOT NULL';
                    }
                    if ($col->dflt_value !== null) {
                        $def .= ' DEFAULT '.$col->dflt_value;
                    }
                }

                return $def;
            })->implode(', ');

            // Create temporary table with UUID structure preserving all columns
            DB::statement("CREATE TABLE users_new ({$columns})");

            // Get all column names except id
            $columnNames = collect($tableInfo)->pluck('name')->filter(fn ($name) => $name !== 'id')->toArray();

            // Migrate data if exists
            $users = DB::table('users')->get();
            foreach ($users as $user) {
                $data = ['id' => Str::uuid()->toString()];
                foreach ($columnNames as $colName) {
                    $data[$colName] = $user->$colName ?? null;
                }
                DB::table('users_new')->insert($data);
            }

            // Drop old table and rename new one
            Schema::drop('users');
            DB::statement('ALTER TABLE users_new RENAME TO users');

            // Recreate indexes if columns exist
            if (Schema::hasColumn('users', 'unit_id')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->index('unit_id');
                });
            }
            if (Schema::hasColumn('users', 'employee_id')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->index('employee_id');
                });
            }
            if (Schema::hasColumn('users', 'is_active')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->index('is_active');
                });
            }
        } else {
            // For MySQL and PostgreSQL
            // First, drop foreign key constraints
            if ($driver === 'mysql') {
                try {
                    DB::statement('ALTER TABLE sessions DROP FOREIGN KEY sessions_user_id_foreign');
                } catch (\Exception $e) {
                    // Foreign key might not exist
                }
            }

            // Add temporary UUID column
            Schema::table('users', function (Blueprint $table) {
                $table->char('uuid_temp', 36)->nullable()->after('id');
            });

            // Generate UUIDs for existing records
            $users = DB::table('users')->get();
            foreach ($users as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['uuid_temp' => Str::uuid()->toString()]);
            }

            // Update foreign keys in sessions table
            if (Schema::hasTable('sessions')) {
                DB::table('sessions')->get()->each(function ($session) use ($users) {
                    if ($session->user_id) {
                        $user = $users->firstWhere('id', $session->user_id);
                        if ($user) {
                            $newUuid = DB::table('users')->where('id', $user->id)->value('uuid_temp');
                            DB::table('sessions')
                                ->where('id', $session->id)
                                ->update(['user_id' => $newUuid]);
                        }
                    }
                });
            }

            // Drop old ID column and rename UUID column
            Schema::table('users', function (Blueprint $table) {
                $table->dropPrimary();
            });

            DB::statement('ALTER TABLE users DROP COLUMN id');
            DB::statement('ALTER TABLE users CHANGE uuid_temp id CHAR(36) NOT NULL PRIMARY KEY');

            // Update sessions table column type
            if (Schema::hasTable('sessions')) {
                Schema::table('sessions', function (Blueprint $table) {
                    $table->char('user_id', 36)->nullable()->change();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: Reverting UUID to integer ID is complex and may cause data loss
        // This is a one-way migration in practice
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // Get current table structure
            $tableInfo = DB::select('PRAGMA table_info(users)');
            $columns = collect($tableInfo)->map(function ($col) {
                $def = $col->name;
                if ($col->name === 'id') {
                    $def .= ' INTEGER PRIMARY KEY AUTOINCREMENT';
                } else {
                    $def .= ' '.$col->type;
                    if ($col->notnull) {
                        $def .= ' NOT NULL';
                    }
                    if ($col->dflt_value !== null) {
                        $def .= ' DEFAULT '.$col->dflt_value;
                    }
                }

                return $def;
            })->implode(', ');

            // Recreate with integer ID
            DB::statement("CREATE TABLE users_old ({$columns})");

            // Get all column names except id
            $columnNames = collect($tableInfo)->pluck('name')->filter(fn ($name) => $name !== 'id')->toArray();

            $users = DB::table('users')->get();
            foreach ($users as $index => $user) {
                $data = ['id' => $index + 1];
                foreach ($columnNames as $colName) {
                    $data[$colName] = $user->$colName ?? null;
                }
                DB::table('users_old')->insert($data);
            }

            Schema::drop('users');
            DB::statement('ALTER TABLE users_old RENAME TO users');
        }
    }
};
