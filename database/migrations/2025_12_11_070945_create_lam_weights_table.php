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
        Schema::create('lam_weights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lam_id')->constrained('lams')->onDelete('cascade');
            $table->string('weightable_type'); // 'standard', 'element', 'indicator'
            $table->unsignedBigInteger('weightable_id');
            $table->decimal('weight', 5, 2);
            $table->timestamps();

            $table->index(['lam_id', 'weightable_type', 'weightable_id']);
            $table->unique(['lam_id', 'weightable_type', 'weightable_id'], 'lam_weight_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lam_weights');
    }
};
