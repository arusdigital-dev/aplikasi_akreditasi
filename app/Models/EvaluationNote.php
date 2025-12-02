<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationNote extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'assignment_id',
        'document_id',
        'assessor_id',
        'short_assessment',
        'general_notes',
        'specific_notes',
        'status',
        'evaluation_file_path',
        'evaluation_file_name',
        'recommendation_file_path',
        'recommendation_file_name',
        'attachments',
        'prodi_comment',
        'prodi_comment_by',
        'prodi_comment_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specific_notes' => 'array',
            'attachments' => 'array',
            'prodi_comment_at' => 'datetime',
        ];
    }

    /**
     * Get the assignment for this evaluation note.
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    /**
     * Get the document for this evaluation note.
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    /**
     * Get the assessor (user) for this evaluation note.
     */
    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }

    /**
     * Get the user who commented (Prodi).
     */
    public function prodiCommentBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prodi_comment_by');
    }

    /**
     * Get the histories for this evaluation note.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(EvaluationNoteHistory::class, 'evaluation_note_id');
    }
}
