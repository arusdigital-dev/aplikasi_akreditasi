<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccreditationCycle extends Model
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
        'prodi_id',
        'lam_id',
        'cycle_name',
        'start_date',
        'end_date',
        'target_submission_date',
        'status',
        'accreditation_result',
        'final_score',
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
            'start_date' => 'date',
            'end_date' => 'date',
            'target_submission_date' => 'date',
            'final_score' => 'decimal:2',
        ];
    }

    /**
     * Get the prodi for this accreditation cycle.
     */
    public function prodi(): BelongsTo
    {
        return $this->belongsTo(Prodi::class, 'prodi_id');
    }

    /**
     * Get the LAM for this accreditation cycle.
     */
    public function lam(): BelongsTo
    {
        return $this->belongsTo(LAM::class, 'lam_id');
    }

    /**
     * Get the simulations for this accreditation cycle.
     */
    public function simulations(): HasMany
    {
        return $this->hasMany(AccreditationSimulation::class, 'accreditation_cycle_id');
    }

    /**
     * Get the indicator scores for this accreditation cycle.
     */
    public function indicatorScores(): HasMany
    {
        return $this->hasMany(ProdiIndicatorScore::class, 'accreditation_cycle_id');
    }

    /**
     * Get the documents for this accreditation cycle.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'accreditation_cycle_id');
    }

    /**
     * Check if cycle is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
