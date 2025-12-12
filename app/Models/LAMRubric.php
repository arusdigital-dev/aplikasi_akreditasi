<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LAMRubric extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lam_rubrics';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lam_indicator_id',
        'score',
        'label',
        'description',
        'order_index',
    ];

    /**
     * Get the indicator that owns this rubric.
     */
    public function indicator(): BelongsTo
    {
        return $this->belongsTo(LAMIndicator::class, 'lam_indicator_id');
    }
}
