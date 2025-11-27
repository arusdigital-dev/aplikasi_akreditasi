<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Criterion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'standard_id',
        'name',
        'description',
        'weight',
        'order_index',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'weight' => 'decimal:2',
        ];
    }

    /**
     * Get the standard that owns this criterion.
     */
    public function standard(): BelongsTo
    {
        return $this->belongsTo(Standard::class, 'standard_id');
    }

    /**
     * Get the criteria points for this criterion.
     */
    public function criteriaPoints(): HasMany
    {
        return $this->hasMany(CriteriaPoint::class, 'criteria_id');
    }

    /**
     * Get the assignments for this criterion.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'criteria_id');
    }
}
