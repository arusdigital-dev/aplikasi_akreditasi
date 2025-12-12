<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccreditationAssessorAssignment extends Model
{
    use HasFactory, HasUuids;

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'accreditation_cycle_id',
        'assessor_id',
        'assigned_by',
        'assigned_date',
        'deadline',
        'status',
        'notes',
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
        ];
    }

    /**
     * Get the accreditation cycle for this assignment.
     */
    public function accreditationCycle(): BelongsTo
    {
        return $this->belongsTo(AccreditationCycle::class, 'accreditation_cycle_id');
    }

    /**
     * Get the assessor (user) for this assignment.
     */
    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }

    /**
     * Get the user who assigned this assignment.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Check if assignment is active.
     */
    public function isActive(): bool
    {
        return $this->status !== 'cancelled';
    }
}
