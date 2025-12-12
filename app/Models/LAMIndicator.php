<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LAMIndicator extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lam_indicators';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lam_element_id',
        'code',
        'name',
        'description',
        'document_requirements',
        'weight',
        'order_index',
        'is_auto_scorable',
        'auto_scoring_rules',
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
            'document_requirements' => 'array',
            'is_auto_scorable' => 'boolean',
            'auto_scoring_rules' => 'array',
        ];
    }

    /**
     * Get the element that owns this indicator.
     */
    public function element(): BelongsTo
    {
        return $this->belongsTo(LAMElement::class, 'lam_element_id');
    }

    /**
     * Get the rubrics for this indicator.
     */
    public function rubrics(): HasMany
    {
        return $this->hasMany(LAMRubric::class, 'lam_indicator_id')->orderBy('score');
    }

    /**
     * Get the prodi indicator scores for this indicator.
     */
    public function prodiIndicatorScores(): HasMany
    {
        return $this->hasMany(ProdiIndicatorScore::class, 'lam_indicator_id');
    }
}
