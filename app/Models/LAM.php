<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LAM extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lams';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'min_score_scale',
        'max_score_scale',
        'accreditation_levels',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'accreditation_levels' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the standards for this LAM.
     */
    public function standards(): HasMany
    {
        return $this->hasMany(LAMStandard::class, 'lam_id')->orderBy('order_index');
    }

    /**
     * Get the weights for this LAM.
     */
    public function weights(): HasMany
    {
        return $this->hasMany(LAMWeight::class, 'lam_id');
    }

    /**
     * Get the prodis using this LAM.
     */
    public function prodis(): HasMany
    {
        return $this->hasMany(Prodi::class, 'lam_id');
    }

    /**
     * Get the accreditation cycles using this LAM.
     */
    public function accreditationCycles(): HasMany
    {
        return $this->hasMany(AccreditationCycle::class, 'lam_id');
    }
}
