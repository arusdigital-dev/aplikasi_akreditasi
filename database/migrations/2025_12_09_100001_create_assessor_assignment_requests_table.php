<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assessor_assignment_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('prodi_id');
            $table->unsignedBigInteger('criteria_id');
            $table->string('scope_category')->nullable();
            $table->string('preferred_assessor_email')->nullable();
            $table->uuid('requested_by');
            $table->string('status')->default('pending');
            $table->uuid('processed_by')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('cascade');
            $table->foreign('criteria_id')->references('id')->on('criteria')->onDelete('cascade');
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['prodi_id', 'status']);
            $table->index('criteria_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessor_assignment_requests');
    }
};

