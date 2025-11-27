<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employees';

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
        'employment_status',
        'employment_type',
        'nip_nip3k_nik',
        'name',
        'cek_data_note',
        'gender',
        'place_of_birth',
        'date_of_birth',
        'management_position',
        'study_program',
        'unit_id',
        'homebase_unit_id',
        'pangkat',
        'golongan',
        'tmt_golongan',
        'jabatan_fungsional',
        'kum',
        'tmt_jabatan_fungsional',
        'jabatan_fungsional_pppk',
        'tmt_jabatan_fungsional_pppk',
        'education_level',
        'masa_kerja_text',
        'jabatan_struktural',
        'status_keaktifan',
        'jabatan_eselon',
        'siasn_notes',
        'additional_notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'employment_status' => EmployeeEmploymentStatus::class,
            'employment_type' => EmployeeEmploymentType::class,
            'gender' => EmployeeGender::class,
            'date_of_birth' => 'date',
            'tmt_golongan' => 'date',
            'tmt_jabatan_fungsional' => 'date',
            'tmt_jabatan_fungsional_pppk' => 'date',
            'kum' => 'decimal:2',
        ];
    }

    /**
     * Get the role assignments for the employee.
     */
    public function roleAssignments(): HasMany
    {
        return $this->hasMany(EmployeeRoleAssignment::class, 'employee_id');
    }

    /**
     * Get the primary role assignment for the employee.
     */
    public function primaryRoleAssignment(): ?EmployeeRoleAssignment
    {
        return $this->roleAssignments()->where('is_primary', true)->whereNull('revoked_at')->first();
    }
}
