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
        Schema::create('prodis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('fakultas_id');
            $table->string('name');
            $table->string('kode_prodi', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('fakultas_id')->references('id')->on('fakultas')->onDelete('cascade');
            $table->index('fakultas_id');
            $table->index('kode_prodi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prodis');
    }
};
