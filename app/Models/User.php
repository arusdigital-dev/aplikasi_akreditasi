<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUuids, Notifiable;

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
        'unit_id',
        'prodi_id',
        'employee_id',
        'is_active',
        'name',
        'email',
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'last_login_at',
        'registration_completed_at',
        'google_sso_enabled',
        'google_sso_email',
        'google_sso_sub',
        'google_sso_connected_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'registration_completed_at' => 'datetime',
            'google_sso_enabled' => 'boolean',
            'google_sso_connected_at' => 'datetime',
        ];
    }

    /**
     * Get the unit that the user belongs to.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Get the prodi that the user belongs to.
     */
    public function prodi(): BelongsTo
    {
        return $this->belongsTo(Prodi::class, 'prodi_id');
    }

    /**
     * Get the employee record associated with the user.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Get the roles assigned to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id');
    }

    /**
     * Get the social accounts associated with the user.
     */
    public function socialAccounts(): HasMany
    {
        return $this->hasMany(UserSocialAccount::class, 'user_id');
    }

    /**
     * Get the unit roles for the user.
     */
    public function unitRoles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_unit_roles', 'user_id', 'role_id')
            ->withPivot('unit_id');
    }

    /**
     * Get the roles for a specific unit.
     */
    public function rolesForUnit(string $unitId): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_unit_roles', 'user_id', 'role_id')
            ->wherePivot('unit_id', $unitId)
            ->withPivot('unit_id');
    }

    /**
     * Get the activity logs for this user.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }

    /**
     * Get the assignments where this user is the assessor.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'assessor_id');
    }

    /**
     * Get the notifications for this user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    /**
     * Check if user has Admin LPMPP role.
     */
    public function isAdminLPMPP(): bool
    {
        if (! $this->relationLoaded('roles')) {
            $this->load('roles');
        }

        return $this->roles->contains('name', 'Admin LPMPP');
    }

    /**
     * Check if user has coordinator prodi role for a unit.
     */
    public function isCoordinatorProdi(?string $unitId = null): bool
    {
        // First check global roles
        if (! $this->relationLoaded('roles')) {
            $this->load('roles');
        }

        $hasGlobalRole = $this->roles->contains(function ($role) {
            return in_array($role->name, ['Koordinator Prodi', 'Koordinator Program Studi']);
        });

        if ($hasGlobalRole) {
            return true;
        }

        // Then check unit-specific roles if unit_id is provided
        $unitId = $unitId ?? $this->unit_id;

        if (! $unitId) {
            return false;
        }

        return $this->rolesForUnit($unitId)
            ->whereIn('name', ['Koordinator Prodi', 'Koordinator Program Studi'])
            ->exists();
    }

    /**
     * Check if user has Assessor Internal role.
     */
    public function isAssessorInternal(): bool
    {
        if (! $this->relationLoaded('roles')) {
            $this->load('roles');
        }

        return $this->roles->contains('name', 'Asesor Internal');
    }
    
    /**
     * Check if user has Assessor External role.
     */
    public function isAssessorExternal(): bool
    {
        if (! $this->relationLoaded('roles')) {
            $this->load('roles');
        }
        
        return $this->roles->contains('name', 'Asesor Eksternal');
    }

    /**
     * Check if user is Rektor (universitas level).
     */
    public function isRektor(): bool
    {
        if (! $this->relationLoaded('roles')) {
            $this->load('roles');
        }

        return $this->roles->contains('name', 'Rektor');
    }

    /**
     * Check if user is Wakil Rektor (universitas level).
     */
    public function isWakilRektor(): bool
    {
        if (! $this->relationLoaded('roles')) {
            $this->load('roles');
        }

        return $this->roles->contains('name', 'Wakil Rektor');
    }

    /**
     * Check if user is Dekan (fakultas level).
     */
    public function isDekan(?string $unitId = null): bool
    {
        $unitId = $unitId ?? $this->unit_id;

        if (! $unitId) {
            return false;
        }

        return $this->rolesForUnit($unitId)
            ->where('name', 'Dekan')
            ->exists();
    }

    /**
     * Check if user is Wakil Dekan (fakultas level).
     */
    public function isWakilDekan(?string $unitId = null): bool
    {
        $unitId = $unitId ?? $this->unit_id;

        if (! $unitId) {
            return false;
        }

        return $this->rolesForUnit($unitId)
            ->where('name', 'Wakil Dekan')
            ->exists();
    }

    /**
     * Check if user is Kajur (prodi level).
     */
    public function isKajur(?string $unitId = null): bool
    {
        $unitId = $unitId ?? $this->unit_id;

        if (! $unitId) {
            return false;
        }

        return $this->rolesForUnit($unitId)
            ->where('name', 'Kajur')
            ->exists();
    }

    /**
     * Check if user is any pimpinan role.
     */
    public function isPimpinan(): bool
    {
        // Check for universitas level roles (Rektor, Wakil Rektor)
        if (! $this->relationLoaded('roles')) {
            $this->load('roles');
        }

        $universitasRoles = $this->roles->pluck('name')->toArray();
        if (in_array('Rektor', $universitasRoles) || in_array('Wakil Rektor', $universitasRoles)) {
            return true;
        }

        // Check for fakultas/prodi level roles (Dekan, Wakil Dekan, Kajur)
        if ($this->unit_id) {
            if ($this->isDekan() || $this->isWakilDekan() || $this->isKajur()) {
                return true;
            }
        }

        // Also check unitRoles for any pimpinan role
        if (! $this->relationLoaded('unitRoles')) {
            $this->load('unitRoles');
        }

        $pimpinanRoleNames = ['Rektor', 'Wakil Rektor', 'Dekan', 'Wakil Dekan', 'Kajur'];
        $userUnitRoleNames = $this->unitRoles->pluck('name')->toArray();

        return ! empty(array_intersect($pimpinanRoleNames, $userUnitRoleNames));
    }

    /**
     * Get pimpinan level (universitas, fakultas, or prodi).
     */
    public function getPimpinanLevel(): ?string
    {
        if ($this->isRektor() || $this->isWakilRektor()) {
            return 'universitas';
        }

        if ($this->isDekan() || $this->isWakilDekan()) {
            return 'fakultas';
        }

        if ($this->isKajur()) {
            return 'prodi';
        }

        return null;
    }

    /**
     * Get programs accessible by coordinator.
     * Programs are accessible if they belong to the user's prodi (via fakultas field).
     *
     * @return Builder<Program>
     */
    public function accessiblePrograms(): Builder
    {
        if (! $this->prodi_id) {
            return Program::query()->whereRaw('1 = 0'); // Empty result
        }

        // Load prodi relationship if not loaded
        if (! $this->relationLoaded('prodi')) {
            $this->load('prodi');
        }

        $prodi = $this->prodi;

        if (! $prodi) {
            return Program::query()->whereRaw('1 = 0'); // Empty result
        }

        // Load fakultas relationship if not loaded
        if (! $prodi->relationLoaded('fakultas')) {
            $prodi->load('fakultas');
        }

        // Get programs with matching fakultas name from prodi's fakultas
        $fakultas = $prodi->fakultas;
        if ($fakultas) {
            return Program::query()->where('fakultas', $fakultas->name);
        }

        // Fallback: return empty if no fakultas
        return Program::query()->whereRaw('1 = 0');
    }
}
