<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccreditationSimulation extends Model
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
        'created_by',
        'indicator_scores',
        'standard_scores',
        'total_score',
        'predicted_result',
        'gap_analysis',
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
            'indicator_scores' => 'array',
            'standard_scores' => 'array',
            'total_score' => 'decimal:2',
            'gap_analysis' => 'array',
        ];
    }

    /**
     * Get the accreditation cycle for this simulation.
     */
    public function accreditationCycle(): BelongsTo
    {
        return $this->belongsTo(AccreditationCycle::class, 'accreditation_cycle_id');
    }

    /**
     * Get the user who created this simulation.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
