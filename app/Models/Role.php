<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'roles';

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
        'name',
        'description',
    ];

    /**
     * Get the employee role assignments for this role.
     */
    public function employeeRoleAssignments(): HasMany
    {
        return $this->hasMany(EmployeeRoleAssignment::class, 'role_id');
    }

    /**
     * Get the permissions for this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id');
    }

    /**
     * Get the users that have this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id');
    }

    /**
     * Get the users with this role in specific units.
     */
    public function usersInUnits(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_unit_roles', 'role_id', 'user_id')
            ->withPivot('unit_id')
            ->withTimestamps();
    }

    /**
     * Get the units where this role is assigned to users.
     */
    public function units(): BelongsToMany
    {
        return $this->belongsToMany(Unit::class, 'user_unit_roles', 'role_id', 'unit_id')
            ->withPivot('user_id')
            ->withTimestamps();
    }
}
