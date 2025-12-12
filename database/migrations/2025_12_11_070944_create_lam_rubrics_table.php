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
        Schema::create('lam_rubrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lam_indicator_id')->constrained('lam_indicators')->onDelete('cascade');
            $table->integer('score'); // 1, 2, 3, 4, etc.
            $table->string('label', 100)->nullable(); // Sangat Baik, Baik, Cukup, Kurang
            $table->text('description');
            $table->integer('order_index');
            $table->timestamps();

            $table->index('lam_indicator_id');
            $table->index('score');
            $table->unique(['lam_indicator_id', 'score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lam_rubrics');
    }
};
