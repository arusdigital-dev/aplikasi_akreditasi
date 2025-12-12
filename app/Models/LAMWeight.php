<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class LAMWeight extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lam_weights';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lam_id',
        'weightable_type',
        'weightable_id',
        'weight',
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
     * Get the LAM that owns this weight.
     */
    public function lam(): BelongsTo
    {
        return $this->belongsTo(LAM::class, 'lam_id');
    }

    /**
     * Get the parent weightable model (standard, element, or indicator).
     */
    public function weightable(): MorphTo
    {
        return $this->morphTo();
    }
}
