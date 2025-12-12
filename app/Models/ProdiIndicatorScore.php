<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProdiIndicatorScore extends Model
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
        'lam_indicator_id',
        'assessor_id',
        'score',
        'notes',
        'recommendations',
        'source',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
        ];
    }

    /**
     * Get the accreditation cycle for this score.
     */
    public function accreditationCycle(): BelongsTo
    {
        return $this->belongsTo(AccreditationCycle::class, 'accreditation_cycle_id');
    }

    /**
     * Get the indicator for this score.
     */
    public function indicator(): BelongsTo
    {
        return $this->belongsTo(LAMIndicator::class, 'lam_indicator_id');
    }

    /**
     * Get the assessor who scored this indicator.
     */
    public function assessor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessor_id');
    }
}
