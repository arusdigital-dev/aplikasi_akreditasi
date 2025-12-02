<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'units';

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
        'type',
        'name',
        'kode_unit',
        'parent_id',
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
            'type' => UnitType::class,
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the parent unit.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'parent_id');
    }

    /**
     * Get the child units.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Unit::class, 'parent_id');
    }

    /**
     * Get all descendants (recursive).
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Get the users with roles in this unit.
     */
    public function usersWithRoles(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_unit_roles', 'unit_id', 'user_id')
            ->withPivot('role_id')
            ->withTimestamps();
    }

    /**
     * Get the roles assigned to users in this unit.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_unit_roles', 'unit_id', 'role_id')
            ->withPivot('user_id')
            ->withTimestamps();
    }

    /**
     * Get the activity logs for this unit.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'unit_id');
    }

    /**
     * Get the assignments for this unit.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'unit_id');
    }
}
