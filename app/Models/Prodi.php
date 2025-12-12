<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prodi extends Model
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
        'fakultas_id',
        'lam_id',
        'name',
        'kode_prodi',
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
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the fakultas that this prodi belongs to.
     */
    public function fakultas(): BelongsTo
    {
        return $this->belongsTo(Fakultas::class, 'fakultas_id');
    }

    /**
     * Get the users for this prodi.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'prodi_id');
    }

    /**
     * Get the documents for this prodi.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'prodi_id');
    }

    /**
     * Get the assignments for this prodi.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'prodi_id');
    }

    /**
     * Get the LAM that this prodi uses.
     */
    public function lam(): BelongsTo
    {
        return $this->belongsTo(LAM::class, 'lam_id');
    }

    /**
     * Get the accreditation cycles for this prodi.
     */
    public function accreditationCycles(): HasMany
    {
        return $this->hasMany(AccreditationCycle::class, 'prodi_id');
    }
}
