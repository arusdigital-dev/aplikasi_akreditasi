<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LAMStandard extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lam_standards';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lam_id',
        'code',
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
     * Get the LAM that owns this standard.
     */
    public function lam(): BelongsTo
    {
        return $this->belongsTo(LAM::class, 'lam_id');
    }

    /**
     * Get the elements for this standard.
     */
    public function elements(): HasMany
    {
        return $this->hasMany(LAMElement::class, 'lam_standard_id')->orderBy('order_index');
    }
}
