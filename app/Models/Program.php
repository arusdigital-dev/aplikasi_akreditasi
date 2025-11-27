<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'jenjang',
        'fakultas',
    ];

    /**
     * Get the akreditasi targets for this program.
     */
    public function akreditasiTargets(): HasMany
    {
        return $this->hasMany(AkreditasiTarget::class, 'program_id');
    }

    /**
     * Get the standards for this program.
     */
    public function standards(): HasMany
    {
        return $this->hasMany(Standard::class, 'program_id');
    }

    /**
     * Get the reports for this program.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'program_id');
    }
}
