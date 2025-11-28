<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssessorAssignmentRequest;
use App\Http\Requests\UpdateAssessorAssignmentRequest;
use App\Models\ActivityLog;
use App\Models\Assignment;
use App\Models\AssignmentStatus;
use App\Models\Criterion;
use App\Models\Program;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AssessorAssignmentController extends Controller
{
    /**
     * Display a listing of assessor assignments.
     */
    public function index(Request $request): Response
    {
        $query = Assignment::query()
            ->with(['assessor', 'criterion.standard.program', 'unit'])
            ->whereNull('unassigned_at');

        // Filter by assessor
        if ($request->has('assessor_id')) {
            $query->where('assessor_id', $request->assessor_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by assignment type
        if ($request->has('assignment_type')) {
            $query->where('assignment_type', $request->assignment_type);
        }

        $assignments = $query->latest('assigned_date')->paginate(20);

        // Get all assessors for filter dropdown
        $assessors = User::query()
            ->whereHas('assignments', function ($q) {
                $q->whereNull('unassigned_at');
            })
            ->with(['unit', 'employee'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'unit_name' => $user->unit?->name ?? 'N/A',
                ];
            });

        // Get monitoring statistics
        $monitoringStats = $this->getMonitoringStats();

        return Inertia::render('Dashboard/AssessorAssignments/Index', [
            'assignments' => $assignments,
            'assessors' => $assessors,
            'monitoringStats' => $monitoringStats,
            'filters' => $request->only(['assessor_id', 'status', 'assignment_type']),
        ]);
    }

    /**
     * Show the form for creating a new assessor assignment.
     */
    public function create(Request $request): Response
    {
        // Get available assessors (users who can be assigned)
        $availableAssessors = User::query()
            ->where('is_active', true)
            ->with(['unit', 'employee'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'unit_name' => $user->unit?->name ?? 'N/A',
                ];
            });

        // Get criteria for selection
        $criteria = Criterion::query()
            ->with(['standard.program'])
            ->get()
            ->map(function ($criterion) {
                return [
                    'id' => $criterion->id,
                    'name' => $criterion->name,
                    'standard_name' => $criterion->standard?->name ?? 'N/A',
                    'program_name' => $criterion->standard?->program?->name ?? 'N/A',
                ];
            });

        // Get units (fakultas/prodi) for selection
        $units = Unit::query()
            ->where('is_active', true)
            ->whereIn('type', ['fakultas', 'prodi'])
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'type' => $unit->type->value,
                ];
            });

        // Get programs for selection
        $programs = Program::query()
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'fakultas' => $program->fakultas,
                    'jenjang' => $program->jenjang,
                ];
            });

        return Inertia::render('Dashboard/AssessorAssignments/Create', [
            'availableAssessors' => $availableAssessors,
            'criteria' => $criteria,
            'units' => $units,
            'programs' => $programs,
            'assignmentType' => $request->get('type', 'criteria'),
        ]);
    }

    /**
     * Store a newly created assessor assignment.
     */
    public function store(StoreAssessorAssignmentRequest $request)
    {
        $validated = $request->validated();

        // Handle different assignment types
        if ($validated['assignment_type'] === 'criteria') {
            // Assign to specific criteria
            $assignment = Assignment::create([
                'criteria_id' => $validated['criteria_id'],
                'assessor_id' => $validated['assessor_id'],
                'assignment_type' => 'criteria',
                'assigned_date' => Carbon::today(),
                'access_level' => $validated['access_level'],
                'deadline' => $validated['deadline'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => AssignmentStatus::Pending,
            ]);
        } elseif ($validated['assignment_type'] === 'unit') {
            // Assign to unit (fakultas/prodi) - create assignments for all criteria in that unit
            $unit = Unit::findOrFail($validated['unit_id']);
            $programs = Program::where('fakultas', $unit->name)->get();

            $assignments = [];
            foreach ($programs as $program) {
                foreach ($program->standards as $standard) {
                    foreach ($standard->criteria as $criterion) {
                        $assignments[] = [
                            'criteria_id' => $criterion->id,
                            'assessor_id' => $validated['assessor_id'],
                            'unit_id' => $validated['unit_id'],
                            'assignment_type' => 'unit',
                            'assigned_date' => Carbon::today(),
                            'access_level' => $validated['access_level'],
                            'deadline' => $validated['deadline'] ?? null,
                            'notes' => $validated['notes'] ?? null,
                            'status' => AssignmentStatus::Pending,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }

            Assignment::insert($assignments);
            $assignment = Assignment::where('assessor_id', $validated['assessor_id'])
                ->where('unit_id', $validated['unit_id'])
                ->first();
        } else {
            // Assign to program - create assignments for all criteria in that program
            $program = Program::findOrFail($validated['program_id']);

            $assignments = [];
            foreach ($program->standards as $standard) {
                foreach ($standard->criteria as $criterion) {
                    $assignments[] = [
                        'criteria_id' => $criterion->id,
                        'assessor_id' => $validated['assessor_id'],
                        'assignment_type' => 'program',
                        'assigned_date' => Carbon::today(),
                        'access_level' => $validated['access_level'],
                        'deadline' => $validated['deadline'] ?? null,
                        'notes' => $validated['notes'] ?? null,
                        'status' => AssignmentStatus::Pending,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            Assignment::insert($assignments);
            $assignment = Assignment::where('assessor_id', $validated['assessor_id'])
                ->where('assignment_type', 'program')
                ->first();
        }

        // Log activity
        if (Auth::check()) {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'assessor_assigned',
                'description' => "Assessor assigned to {$validated['assignment_type']}",
                'model_type' => Assignment::class,
                'model_id' => $assignment->id,
            ]);
        }

        return redirect()->route('assessor-assignments.index')
            ->with('success', 'Penugasan asesor berhasil dibuat.');
    }

    /**
     * Display the specified assessor assignment.
     */
    public function show(Assignment $assessorAssignment): Response
    {
        $assessorAssignment->load([
            'assessor.unit',
            'assessor.employee',
            'criterion.standard.program',
            'unit',
            'evaluations',
        ]);

        // Get assignment history
        $history = ActivityLog::query()
            ->where('model_type', Assignment::class)
            ->where('model_id', $assessorAssignment->id)
            ->with('user')
            ->latest()
            ->get();

        return Inertia::render('Dashboard/AssessorAssignments/Show', [
            'assignment' => $assessorAssignment,
            'history' => $history,
        ]);
    }

    /**
     * Show the form for editing the specified assessor assignment.
     */
    public function edit(Assignment $assessorAssignment): Response
    {
        $assessorAssignment->load(['assessor', 'criterion.standard.program', 'unit']);

        $availableAssessors = User::query()
            ->where('is_active', true)
            ->with(['unit', 'employee'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'unit_name' => $user->unit?->name ?? 'N/A',
                ];
            });

        return Inertia::render('Dashboard/AssessorAssignments/Edit', [
            'assignment' => $assessorAssignment,
            'availableAssessors' => $availableAssessors,
        ]);
    }

    /**
     * Update the specified assessor assignment.
     */
    public function update(UpdateAssessorAssignmentRequest $request, Assignment $assessorAssignment)
    {
        $validated = $request->validated();
        $oldAssessorId = $assessorAssignment->assessor_id;

        $assessorAssignment->update($validated);

        // Log activity if assessor changed
        if (Auth::check()) {
            if (isset($validated['assessor_id']) && $validated['assessor_id'] !== $oldAssessorId) {
                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'assessor_reassigned',
                    'description' => 'Assessor reassigned',
                    'model_type' => Assignment::class,
                    'model_id' => $assessorAssignment->id,
                ]);
            } else {
                ActivityLog::create([
                    'user_id' => Auth::id(),
                    'action' => 'assessor_assignment_updated',
                    'description' => 'Assessor assignment updated',
                    'model_type' => Assignment::class,
                    'model_id' => $assessorAssignment->id,
                ]);
            }
        }

        return redirect()->route('assessor-assignments.index')
            ->with('success', 'Penugasan asesor berhasil diperbarui.');
    }

    /**
     * Remove/unassign the specified assessor assignment.
     */
    public function destroy(Assignment $assessorAssignment)
    {
        $assessorAssignment->update([
            'unassigned_at' => now(),
            'unassigned_by' => Auth::check() ? Auth::id() : null,
            'status' => AssignmentStatus::Cancelled,
        ]);

        // Log activity
        if (Auth::check()) {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'assessor_unassigned',
                'description' => 'Assessor unassigned',
                'model_type' => Assignment::class,
                'model_id' => $assessorAssignment->id,
            ]);
        }

        return redirect()->route('assessor-assignments.index')
            ->with('success', 'Penugasan asesor berhasil dihapus.');
    }

    /**
     * Get monitoring statistics for assessor assignments.
     *
     * @return array<string, mixed>
     */
    private function getMonitoringStats(): array
    {
        $activeAssessors = Assignment::query()
            ->whereNull('unassigned_at')
            ->distinct('assessor_id')
            ->count('assessor_id');

        $totalAssignments = Assignment::query()
            ->whereNull('unassigned_at')
            ->count();

        $completedAssignments = Assignment::query()
            ->whereNull('unassigned_at')
            ->where('status', AssignmentStatus::Completed)
            ->count();

        $overdueAssignments = Assignment::query()
            ->whereNull('unassigned_at')
            ->whereNotNull('deadline')
            ->where('deadline', '<', Carbon::today())
            ->where('status', '!=', AssignmentStatus::Completed)
            ->count();

        // Get progress per assessor
        $assessorsProgress = User::query()
            ->whereHas('assignments', function ($q) {
                $q->whereNull('unassigned_at');
            })
            ->withCount([
                'assignments as total_assignments' => function ($q) {
                    $q->whereNull('unassigned_at');
                },
                'assignments as completed_assignments' => function ($q) {
                    $q->whereNull('unassigned_at')->where('status', AssignmentStatus::Completed);
                },
            ])
            ->get()
            ->map(function ($user) {
                $total = $user->total_assignments ?? 0;
                $completed = $user->completed_assignments ?? 0;
                $progress = $total > 0 ? ($completed / $total) * 100 : 0;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'total' => $total,
                    'completed' => $completed,
                    'progress' => round($progress, 1),
                ];
            });

        return [
            'active_assessors' => $activeAssessors,
            'total_assignments' => $totalAssignments,
            'completed_assignments' => $completedAssignments,
            'overdue_assignments' => $overdueAssignments,
            'assessors_progress' => $assessorsProgress,
        ];
    }
}
