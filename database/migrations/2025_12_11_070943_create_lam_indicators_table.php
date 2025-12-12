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
        Schema::create('lam_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lam_element_id')->constrained('lam_elements')->onDelete('cascade');
            $table->string('code', 20); // I1, I2, I3, etc.
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->text('document_requirements')->nullable(); // JSON array of required documents
            $table->decimal('weight', 5, 2)->default(0);
            $table->integer('order_index');
            $table->boolean('is_auto_scorable')->default(false);
            $table->json('auto_scoring_rules')->nullable(); // Rules for automatic scoring
            $table->timestamps();

            $table->index('lam_element_id');
            $table->index('order_index');
            $table->unique(['lam_element_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lam_indicators');
    }
};
