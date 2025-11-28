<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'assignment_id',
        'program_id',
        'unit_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'issue_type',
        'issue_status',
        'metadata',
        'expired_at',
        'rejection_notes',
        'uploaded_by',
        'rejected_by',
        'validated_at',
        'validated_by',
        'year',
        'category',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'expired_at' => 'date',
            'validated_at' => 'datetime',
            'file_size' => 'integer',
            'year' => 'integer',
        ];
    }

    /**
     * Get the assignment for this document.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    /**
     * Get the program for this document.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    /**
     * Get the unit for this document.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Get the user who uploaded this document.
     */
    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the user who rejected this document.
     */
    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Get the user who validated this document.
     */
    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    /**
     * Get the histories for this document.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(DocumentHistory::class, 'document_id');
    }

    /**
     * Check if document is expired.
     */
    public function isExpired(): bool
    {
        if (! $this->expired_at instanceof Carbon) {
            return false;
        }

        return $this->expired_at->isPast();
    }

    /**
     * Check if document has wrong format.
     */
    public function hasWrongFormat(): bool
    {
        $allowedTypes = ['pdf', 'doc', 'docx'];
        $extension = strtolower(pathinfo($this->file_name, PATHINFO_EXTENSION));

        return ! in_array($extension, $allowedTypes) || $this->file_size > 10 * 1024 * 1024; // 10MB max
    }
}
