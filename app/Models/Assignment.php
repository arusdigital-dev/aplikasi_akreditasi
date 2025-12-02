<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'criteria_id',
        'assessor_id',
        'assigned_date',
        'status',
        'access_level',
        'deadline',
        'unit_id',
        'notes',
        'unassigned_at',
        'unassigned_by',
        'assignment_type',
        'locked_at',
        'locked_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_date' => 'date',
            'deadline' => 'date',
            'status' => AssignmentStatus::class,
            'access_level' => AssessorAccessLevel::class,
            'unassigned_at' => 'datetime',
            'locked_at' => 'datetime',
        ];
    }

    /**
     * Get the criterion for this assignment.
     */
    public function criterion(): BelongsTo
    {
        return $this->belongsTo(Criterion::class, 'criteria_id');
    }

    /**
     * Get the evaluations for this assignment.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'assignment_id');
    }

    /**
     * Get the evaluation notes for this assignment.
     */
    public function evaluationNotes(): HasMany
    {
        return $this->hasMany(\App\Models\EvaluationNote::class, 'assignment_id');
    }

    /**
     * Get the assessor (user) for this assignment.
     */
    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }

    /**
     * Get the unit for this assignment.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Get the user who unassigned this assignment.
     */
    public function unassignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'unassigned_by');
    }

    /**
     * Get the user who locked this assignment.
     */
    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    /**
     * Check if assignment is active.
     */
    public function isActive(): bool
    {
        return $this->status !== AssignmentStatus::Cancelled && $this->unassigned_at === null;
    }

    /**
     * Check if assignment is locked.
     */
    public function isLocked(): bool
    {
        return $this->locked_at !== null;
    }
}
