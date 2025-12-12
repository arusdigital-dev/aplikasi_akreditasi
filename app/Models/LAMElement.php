<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LAMElement extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lam_elements';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lam_standard_id',
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
     * Get the standard that owns this element.
     */
    public function standard(): BelongsTo
    {
        return $this->belongsTo(LAMStandard::class, 'lam_standard_id');
    }

    /**
     * Get the indicators for this element.
     */
    public function indicators(): HasMany
    {
        return $this->hasMany(LAMIndicator::class, 'lam_element_id')->orderBy('order_index');
    }
}
