<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\Program;
use App\Models\Role;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index(Request $request): Response
    {
        $query = Employee::query()
            ->with(['unit', 'homebaseUnit', 'roleAssignments' => function ($q) {
                $q->where('is_primary', true)->whereNull('revoked_at')->with('role');
            }, 'user']);

        // Search by name or NIP
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nip_nip3k_nik', 'like', "%{$search}%");
            });
        }

        // Filter by unit (fakultas)
        if ($request->has('unit_id') && $request->unit_id) {
            $query->where('unit_id', $request->unit_id);
        }

        // Filter by study program
        if ($request->has('study_program') && $request->study_program) {
            $query->where('study_program', 'like', "%{$request->study_program}%");
        }

        // Filter by role
        if ($request->has('role_id') && $request->role_id) {
            $query->whereHas('roleAssignments', function ($q) use ($request) {
                $q->where('role_id', $request->role_id)->whereNull('revoked_at');
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            if ($request->status === 'active') {
                $query->where('status_keaktifan', 'Aktif');
            } elseif ($request->status === 'inactive') {
                $query->where('status_keaktifan', '!=', 'Aktif');
            }
        }

        $employees = $query->latest('created_at')->paginate(20);

        // Transform employees data to include primary role assignment
        $employees->getCollection()->transform(function ($employee) {
            $primaryRole = $employee->roleAssignments->first();
            $employee->primary_role_assignment = $primaryRole ? [
                'role' => $primaryRole->role,
            ] : null;
            unset($employee->roleAssignments);

            return $employee;
        });

        // Get filter options
        $units = Unit::where('is_active', true)
            ->whereIn('type', ['fakultas', 'prodi'])
            ->orderBy('name')
            ->get()
            ->map(fn ($unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type->value,
            ]);

        $roles = Role::orderBy('name')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
        ]);

        $studyPrograms = Employee::distinct('study_program')
            ->whereNotNull('study_program')
            ->orderBy('study_program')
            ->pluck('study_program')
            ->map(fn ($program) => ['value' => $program, 'label' => $program]);

        return Inertia::render('Dashboard/Employees/Index', [
            'employees' => $employees,
            'filters' => $request->only(['search', 'unit_id', 'study_program', 'role_id', 'status']),
            'units' => $units,
            'roles' => $roles,
            'studyPrograms' => $studyPrograms,
        ]);
    }

    /**
     * Show the form for creating a new employee.
     */
    public function create(): Response
    {
        $units = Unit::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type->value,
            ]);

        $roles = Role::orderBy('name')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
        ]);

        return Inertia::render('Dashboard/Employees/Create', [
            'units' => $units,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(StoreEmployeeRequest $request)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            $employee = Employee::create($validated);

            // Create role assignment if role is provided
            if ($request->has('role_id') && $request->role_id) {
                $employee->roleAssignments()->create([
                    'role_id' => $request->role_id,
                    'unit_id' => $request->unit_id,
                    'assigned_by' => Auth::id(),
                    'assigned_at' => now(),
                    'is_primary' => true,
                ]);
            }

            // Log activity
            if (Auth::check()) {
                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'employee_created',
                    'description' => "Employee created: {$employee->name}",
                    'model_type' => Employee::class,
                    'model_id' => $employee->id,
                ]);
            }

            DB::commit();

            return redirect()->route('employees.index')
                ->with('success', 'Pegawai berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating employee: '.$e->getMessage());

            return back()->withErrors(['error' => 'Gagal menambahkan pegawai. Silakan coba lagi.']);
        }
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee): Response
    {
        $employee->load([
            'unit',
            'homebaseUnit',
            'roleAssignments.role',
            'roleAssignments.unit',
            'user',
        ]);

        // Get activity logs
        $activityLogs = ActivityLog::where('model_type', Employee::class)
            ->where('model_id', $employee->id)
            ->with('user')
            ->latest()
            ->get();

        return Inertia::render('Dashboard/Employees/Show', [
            'employee' => $employee,
            'activityLogs' => $activityLogs,
        ]);
    }

    /**
     * Show the form for editing the specified employee.
     */
    public function edit(Employee $employee): Response
    {
        $employee->load(['roleAssignments.role', 'unit', 'homebaseUnit']);

        $units = Unit::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type->value,
            ]);

        $roles = Role::orderBy('name')->get()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
        ]);

        return Inertia::render('Dashboard/Employees/Edit', [
            'employee' => $employee,
            'units' => $units,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified employee.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            $employee->update($validated);

            // Update role assignment if changed
            if ($request->has('role_id')) {
                // Revoke existing primary role
                $employee->roleAssignments()
                    ->where('is_primary', true)
                    ->whereNull('revoked_at')
                    ->update(['revoked_at' => now()]);

                // Create new role assignment if role is provided
                if ($request->role_id) {
                    $employee->roleAssignments()->create([
                        'role_id' => $request->role_id,
                        'unit_id' => $request->unit_id,
                        'assigned_by' => Auth::id(),
                        'assigned_at' => now(),
                        'is_primary' => true,
                    ]);
                }
            }

            // Log activity
            if (Auth::check()) {
                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'employee_updated',
                    'description' => "Employee updated: {$employee->name}",
                    'model_type' => Employee::class,
                    'model_id' => $employee->id,
                ]);
            }

            DB::commit();

            return redirect()->route('employees.index')
                ->with('success', 'Pegawai berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating employee: '.$e->getMessage());

            return back()->withErrors(['error' => 'Gagal memperbarui pegawai. Silakan coba lagi.']);
        }
    }

    /**
     * Remove the specified employee (soft delete).
     */
    public function destroy(Employee $employee)
    {
        DB::beginTransaction();
        try {
            $employeeName = $employee->name;
            $employee->delete();

            // Log activity
            if (Auth::check()) {
                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'employee_deleted',
                    'description' => "Employee deleted: {$employeeName}",
                    'model_type' => Employee::class,
                    'model_id' => $employee->id,
                ]);
            }

            DB::commit();

            return redirect()->route('employees.index')
                ->with('success', 'Pegawai berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting employee: '.$e->getMessage());

            return back()->withErrors(['error' => 'Gagal menghapus pegawai. Silakan coba lagi.']);
        }
    }

    /**
     * Import employees from CSV/Excel file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:10240',
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        DB::beginTransaction();
        try {
            $imported = 0;
            $updated = 0;
            $errors = [];

            if (in_array($extension, ['csv', 'txt'])) {
                $data = $this->parseCsv($file);
            } else {
                $data = $this->parseExcel($file);
            }

            foreach ($data as $index => $row) {
                try {
                    $employeeData = $this->mapCsvRowToEmployee($row);

                    // Check if employee exists by NIP
                    $employee = Employee::where('nip_nip3k_nik', $employeeData['nip_nip3k_nik'])->first();

                    if ($employee) {
                        $employee->update($employeeData);
                        $updated++;
                    } else {
                        Employee::create($employeeData);
                        $imported++;
                    }
                } catch (\Exception $e) {
                    $errors[] = 'Baris '.($index + 2).": {$e->getMessage()}";
                    Log::error("Error importing employee row {$index}: {$e->getMessage()}");
                }
            }

            // Log activity
            if (Auth::check()) {
                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'employees_imported',
                    'description' => "Imported {$imported} new employees, updated {$updated} existing employees",
                ]);
            }

            DB::commit();

            $message = "Import berhasil: {$imported} pegawai baru, {$updated} pegawai diperbarui.";
            if (! empty($errors)) {
                $message .= ' Terdapat '.count($errors).' error.';
            }

            return redirect()->route('employees.index')
                ->with('success', $message)
                ->with('import_errors', $errors);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error importing employees: '.$e->getMessage());

            return back()->withErrors(['error' => 'Gagal mengimpor data. '.$e->getMessage()]);
        }
    }

    /**
     * Parse CSV file.
     */
    private function parseCsv($file): array
    {
        $data = [];
        $handle = fopen($file->getRealPath(), 'r');
        $headers = fgetcsv($handle); // Read header row

        while (($row = fgetcsv($handle)) !== false) {
            $data[] = array_combine($headers, $row);
        }

        fclose($handle);

        return $data;
    }

    /**
     * Parse Excel file.
     */
    private function parseExcel($file): array
    {
        // For now, return empty array - implement Excel parsing if needed
        // You can use PhpSpreadsheet or Laravel Excel package
        throw new \Exception('Excel import belum diimplementasikan. Gunakan format CSV.');
    }

    /**
     * Map CSV row to employee data array.
     */
    private function mapCsvRowToEmployee(array $row): array
    {
        // Map CSV headers to database columns
        $mapping = [
            'Status Pegawai' => 'employment_status',
            'Jenis Tenaga' => 'employment_type',
            'NIP/NIP3K/NIK' => 'nip_nip3k_nik',
            'Nama' => 'name',
            'CEK DATA' => 'cek_data_note',
            'JK' => 'gender',
            'Tempat Lahir' => 'place_of_birth',
            'Tanggal Lahir' => 'date_of_birth',
            'Jabatan di Manajemen' => 'management_position',
            'Program Studi/Homebase' => 'study_program',
            'Fakultas /Unit Kerja' => 'unit_name', // Will need to find unit_id
            'Pangkat' => 'pangkat',
            'Golongan Terakhir' => 'golongan',
            'TMT Golongan' => 'tmt_golongan',
            'Jabfung Terakhir' => 'jabatan_fungsional',
            'KUM' => 'kum',
            'TMT Jabfung Terakhir' => 'tmt_jabatan_fungsional',
            'Jabfung Sesuai SK PPPK' => 'jabatan_fungsional_pppk',
            'TMT Jabfung Sesuai SK PPPK' => 'tmt_jabatan_fungsional_pppk',
            'Jenjang Pendidikan' => 'education_level',
            'Masa Kerja (Thn/Bln)' => 'masa_kerja_text',
            'JABATAN' => 'jabatan_struktural',
            'Status' => 'status_keaktifan',
            'Jabatan Eselon' => 'jabatan_eselon',
            'CEK SIASN PINDAH KEMENSAINS' => 'siasn_notes',
            'Keterangan' => 'additional_notes',
        ];

        $employeeData = [];

        foreach ($mapping as $csvHeader => $dbColumn) {
            if (isset($row[$csvHeader])) {
                $value = trim($row[$csvHeader]);

                // Handle special cases
                if ($dbColumn === 'gender') {
                    $employeeData[$dbColumn] = $this->mapGender($value);
                } elseif ($dbColumn === 'employment_status') {
                    $employeeData[$dbColumn] = $this->mapEmploymentStatus($value);
                } elseif ($dbColumn === 'employment_type') {
                    $employeeData[$dbColumn] = $this->mapEmploymentType($value);
                } elseif (in_array($dbColumn, ['date_of_birth', 'tmt_golongan', 'tmt_jabatan_fungsional', 'tmt_jabatan_fungsional_pppk'])) {
                    $employeeData[$dbColumn] = $this->parseDate($value);
                } elseif ($dbColumn === 'kum') {
                    $employeeData[$dbColumn] = $this->parseDecimal($value);
                } elseif ($dbColumn === 'unit_name') {
                    // Find unit by name
                    $unit = Unit::where('name', $value)->first();
                    if ($unit) {
                        $employeeData['unit_id'] = $unit->id;
                    }
                } else {
                    $employeeData[$dbColumn] = $value ?: null;
                }
            }
        }

        // Validate required fields
        if (empty($employeeData['name']) || empty($employeeData['nip_nip3k_nik'])) {
            throw new \Exception('Nama dan NIP/NIP3K/NIK wajib diisi');
        }

        return $employeeData;
    }

    /**
     * Map gender value.
     */
    private function mapGender(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        $value = strtolower(trim($value));
        if (in_array($value, ['l', 'laki-laki', 'pria', 'male'])) {
            return 'male';
        } elseif (in_array($value, ['p', 'perempuan', 'wanita', 'female'])) {
            return 'female';
        }

        return null;
    }

    /**
     * Map employment status.
     */
    private function mapEmploymentStatus(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        $statusMap = [
            'pns' => 'pns',
            'pppk' => 'pppk',
            'kontrak' => 'kontrak',
            'honorer' => 'honorer',
            'tetap non pns' => 'TetapNonPNS',
            'non pns' => 'NonPNS',
            'dosen dengan perjanjian kerja' => 'DosendenganPerjanjianKerja',
            'cpns' => 'cpns',
        ];

        $value = strtolower(trim($value));

        return $statusMap[$value] ?? null;
    }

    /**
     * Map employment type.
     */
    private function mapEmploymentType(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        $value = strtolower(trim($value));
        if (str_contains($value, 'pendidik') || str_contains($value, 'dosen')) {
            return 'tenaga_pendidik';
        } elseif (str_contains($value, 'kependidikan') || str_contains($value, 'tendik')) {
            return 'tenaga_kependidikan';
        }

        return 'lainnya';
    }

    /**
     * Parse date string.
     */
    private function parseDate(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        try {
            // Try various date formats
            $formats = ['Y-m-d', 'd/m/Y', 'd-m-Y', 'Y/m/d'];
            foreach ($formats as $format) {
                $date = Carbon::createFromFormat($format, trim($value));
                if ($date) {
                    return $date->format('Y-m-d');
                }
            }

            // Try Carbon parse
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Parse decimal value.
     */
    private function parseDecimal(?string $value): ?float
    {
        if (! $value) {
            return null;
        }

        $value = str_replace(',', '.', trim($value));

        return is_numeric($value) ? (float) $value : null;
    }
}
