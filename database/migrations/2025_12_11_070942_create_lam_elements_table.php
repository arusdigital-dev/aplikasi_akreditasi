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
        Schema::create('lam_elements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lam_standard_id')->constrained('lam_standards')->onDelete('cascade');
            $table->string('code', 20); // E1, E2, E3, etc.
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->decimal('weight', 5, 2)->default(0);
            $table->integer('order_index');
            $table->timestamps();

            $table->index('lam_standard_id');
            $table->index('order_index');
            $table->unique(['lam_standard_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lam_elements');
    }
};
