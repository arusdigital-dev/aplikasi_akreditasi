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
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('assignment_id')->constrained('assignments')->onDelete('cascade');
            $table->foreignId('program_id')->nullable()->constrained('programs')->onDelete('set null');
            $table->uuid('unit_id')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->nullable(); // pdf, doc, docx, etc
            $table->unsignedBigInteger('file_size')->nullable(); // in bytes
            $table->string('issue_type')->nullable(); // expired, wrong_format, missing_metadata, not_validated, rejected
            $table->string('issue_status')->default('pending'); // pending, resolved, rejected
            $table->json('metadata')->nullable(); // Additional metadata
            $table->date('expired_at')->nullable();
            $table->text('rejection_notes')->nullable();
            $table->uuid('uploaded_by')->nullable();
            $table->uuid('rejected_by')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->uuid('validated_by')->nullable();
            $table->integer('year')->nullable(); // Tahun dokumen
            $table->string('category')->nullable(); // Kategori dokumen
            $table->timestamps();

            $table->foreign('unit_id')->references('id')->on('units')->onDelete('set null');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('rejected_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('validated_by')->references('id')->on('users')->onDelete('set null');

            $table->index(['assignment_id', 'issue_status']);
            $table->index(['program_id', 'issue_status']);
            $table->index(['unit_id', 'issue_status']);
            $table->index('issue_type');
            $table->index('year');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
