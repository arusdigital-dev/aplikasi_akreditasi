<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminLPMPP\AssignAssessorRequest;
use App\Http\Requests\AdminLPMPP\GenerateReportRequest;
use App\Http\Requests\AdminLPMPP\SendBroadcastRequest;
use App\Http\Requests\AdminLPMPP\SendReminderRequest;
use App\Http\Requests\AdminLPMPP\StoreAssignmentRequest;
use App\Http\Requests\AdminLPMPP\StoreEmployeeRequest;
use App\Http\Requests\AdminLPMPP\SyncEmployeesRequest;
use App\Http\Requests\AdminLPMPP\UnassignAssessorRequest;
use App\Http\Requests\AdminLPMPP\UpdateAssignmentRequest;
use App\Http\Requests\AdminLPMPP\UpdateEmployeeRequest;
use App\Models\ActivityLog;
use App\Models\AssessorAccessLevel;
use App\Models\AssessorAssignmentRequest;
use App\Models\Assignment;
use App\Models\AssignmentStatus;
use App\Models\Criterion;
use App\Models\Document;
use App\Models\Employee;
use App\Models\Evaluation;
use App\Models\Fakultas;
use App\Models\Notification;
use App\Models\NotificationChannel;
use App\Models\NotificationType;
use App\Models\Prodi;
use App\Models\Program;
use App\Models\Report;
use App\Models\Role;
use App\Models\LAM;
use App\Models\LAMStandard;
use App\Models\LAMElement;
use App\Models\LAMIndicator;
use App\Models\LAMRubric;
use App\Models\Unit;
use App\Models\UnitType;
use App\Models\User;
use App\Models\AccreditationSimulation;
use App\Services\NotificationService;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminLPMPPController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {
        //
    }

    /**
     * Display the admin LPMPP dashboard.
     */
    public function index(Request $request): Response
    {
        // Get statistics
        $totalPrograms = Program::count();
        $inProgress = Program::query()
            ->whereHas('standards', function ($query) {
                $query->whereHas('criteria', function ($q) {
                    $q->whereHas('assignments', function ($a) {
                        $a->where('status', 'in_progress');
                    });
                });
            })
            ->count();

        $assessorsAssigned = Assignment::query()
            ->whereNotNull('assessor_id')
            ->distinct('assessor_id')
            ->count('assessor_id');

        // Get recent assignments with related data
        $recentAssignments = Assignment::query()
            ->with(['criterion.standard.program'])
            ->latest('assigned_date')
            ->limit(10)
            ->get()
            ->map(function ($assignment) {
                $assignedDate = 'N/A';
                if ($assignment->assigned_date) {
                    $date = $assignment->assigned_date;
                    if ($date instanceof Carbon) {
                        $assignedDate = $date->format('d M Y');
                    } else {
                        $assignedDate = Carbon::parse($date)->format('d M Y');
                    }
                }

                return [
                    'assessor_name' => 'Asesor #' . $assignment->assessor_id, // TODO: Get from User model
                    'program_name' => $assignment->criterion?->standard?->program?->name ?? 'N/A',
                    'criteria_name' => $assignment->criterion?->name ?? 'N/A',
                    'assigned_date' => $assignedDate,
                    'status' => $assignment->status->value,
                ];
            });

        // Get unit progress
        $unitProgress = Unit::query()
            ->where('is_active', true)
            ->limit(5)
            ->get()
            ->map(function ($unit) {
                // Calculate progress based on standards/criteria completion
                // This is a placeholder - adjust based on your business logic
                $progress = rand(40, 95); // Placeholder
    
                return [
                    'name' => $unit->name,
                    'type' => $unit->type->value ?? 'unit',
                    'progress' => $progress,
                ];
            });

        // Problem documents (placeholder - implement based on your document system)
        $problemDocuments = [];

        // Get summary statistics
        $totalFakultas = Unit::where('type', UnitType::Fakultas)
            ->where('is_active', true)
            ->count();
        $totalProdi = Program::count();
        $totalUnits = Unit::where('is_active', true)->count();

        // Calculate readiness status distribution
        $readinessStatus = $this->calculateReadinessStatus();

        // Get progress chart data (last 7 days)
        $progressChartData = $this->getProgressChartData();

        // Get document completeness pie chart data
        $documentCompleteness = $this->getDocumentCompletenessData();

        // Get status per Fakultas
        $facultyStatus = $this->getFacultyStatus();

        // Get status per Prodi
        $programStatus = $this->getProgramStatus();

        return Inertia::render('Dashboard/AdminLPMPP/Index', [
            'stats' => [
                'totalPrograms' => $totalPrograms,
                'inProgress' => $inProgress,
                'inProgressChange' => 12.5, // Placeholder
                'assessorsAssigned' => $assessorsAssigned,
                'problemDocuments' => count($problemDocuments),
                'totalFakultas' => $totalFakultas,
                'totalProdi' => $totalProdi,
                'totalUnits' => $totalUnits,
            ],
            'readinessStatus' => $readinessStatus,
            'progressChartData' => $progressChartData,
            'documentCompleteness' => $documentCompleteness,
            'facultyStatus' => $facultyStatus,
            'programStatus' => $programStatus,
            'recentAssignments' => $recentAssignments,
            'unitProgress' => $unitProgress,
            'problemDocuments' => $problemDocuments,
        ]);
    }

    /**
     * Calculate readiness status distribution.
     *
     * @return array<string, int>
     */
    private function calculateReadinessStatus(): array
    {
        // Placeholder logic - adjust based on your business rules
        // This should calculate based on document completeness and criteria fulfillment
        $programs = Program::with(['standards.criteria.assignments'])->get();

        $unggul = 0;
        $sangatBaik = 0;
        $baik = 0;
        $kurang = 0;

        foreach ($programs as $program) {
            $totalCriteria = $program->standards->sum(fn($standard) => $standard->criteria->count());
            $completedCriteria = $program->standards->sum(function ($standard) {
                return $standard->criteria->sum(function ($criterion) {
                    return $criterion->assignments->where('status', 'completed')->count();
                });
            });

            if ($totalCriteria === 0) {
                continue;
            }

            $completionRate = ($completedCriteria / $totalCriteria) * 100;

            if ($completionRate >= 90) {
                $unggul++;
            } elseif ($completionRate >= 75) {
                $sangatBaik++;
            } elseif ($completionRate >= 50) {
                $baik++;
            } else {
                $kurang++;
            }
        }

        return [
            'unggul' => $unggul,
            'sangat_baik' => $sangatBaik,
            'baik' => $baik,
            'kurang' => $kurang,
        ];
    }

    /**
     * Get progress chart data for the last 7 days.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getProgressChartData(): array
    {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();

            // Count assignments created on this day
            $assignmentsCount = Assignment::whereBetween('created_at', [$dayStart, $dayEnd])->count();

            $data[] = [
                'date' => $date->format('d M'),
                'count' => $assignmentsCount,
            ];
        }

        return $data;
    }

    /**
     * Get document completeness data for pie chart.
     *
     * @return array<string, int>
     */
    private function getDocumentCompletenessData(): array
    {
        // Placeholder - implement based on your document system
        // This should query actual document statuses
        $totalCriteria = Criterion::count();
        $completedAssignments = Assignment::where('status', 'completed')->count();
        $inProgressAssignments = Assignment::where('status', 'in_progress')->count();
        $pendingAssignments = Assignment::where('status', 'pending')->count();

        return [
            'lengkap' => $completedAssignments,
            'belum_lengkap' => $inProgressAssignments + $pendingAssignments,
            'salah_format' => 0, // Placeholder
            'expired' => 0, // Placeholder
        ];
    }

    /**
     * Get status per Fakultas.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getFacultyStatus(): array
    {
        $fakultas = Unit::where('type', UnitType::Fakultas)
            ->where('is_active', true)
            ->with([
                'children' => function ($query) {
                    $query->where('type', UnitType::Prodi)->where('is_active', true);
                },
            ])
            ->get();

        return $fakultas->map(function ($fakultas) {
            // Get programs for this fakultas (based on program.fakultas field)
            $programs = Program::where('fakultas', $fakultas->name)->get();

            $totalCriteria = 0;
            $completedCriteria = 0;

            foreach ($programs as $program) {
                $program->load(['standards.criteria.assignments']);
                $totalCriteria += $program->standards->sum(fn($standard) => $standard->criteria->count());
                $completedCriteria += $program->standards->sum(function ($standard) {
                    return $standard->criteria->sum(function ($criterion) {
                        return $criterion->assignments->where('status', 'completed')->count();
                    });
                });
            }

            $completionRate = $totalCriteria > 0 ? ($completedCriteria / $totalCriteria) * 100 : 0;
            $pendingDocuments = $totalCriteria - $completedCriteria;

            // Determine status color
            $statusColor = 'red';
            if ($completionRate >= 90) {
                $statusColor = 'green';
            } elseif ($completionRate >= 75) {
                $statusColor = 'yellow';
            } elseif ($completionRate >= 50) {
                $statusColor = 'orange';
            }

            return [
                'name' => $fakultas->name,
                'completion_percentage' => round($completionRate, 1),
                'status_color' => $statusColor,
                'criteria_fulfilled' => $completedCriteria,
                'total_criteria' => $totalCriteria,
                'pending_documents' => $pendingDocuments,
                'rejected_documents' => 0, // Placeholder
            ];
        })->toArray();
    }

    /**
     * Get status per Prodi with detailed information.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getProgramStatus(): array
    {
        $programs = Program::with(['standards.criteria.assignments'])->get();

        return $programs->map(function ($program) {
            $totalCriteria = $program->standards->sum(fn($standard) => $standard->criteria->count());
            $completedCriteria = $program->standards->sum(function ($standard) {
                return $standard->criteria->sum(function ($criterion) {
                    return $criterion->assignments->where('status', 'completed')->count();
                });
            });

            $completionRate = $totalCriteria > 0 ? ($completedCriteria / $totalCriteria) * 100 : 0;

            // Calculate simulated score (placeholder - adjust based on your scoring system)
            $simulatedScore = $completionRate * 0.4; // Placeholder calculation
            $simulatedPoints = round($simulatedScore, 2);

            // Get nearest deadline (placeholder - implement based on your deadline system)
            $nearestDeadline = null; // Placeholder

            // Get PIC Prodi (placeholder - implement based on your user assignment system)
            $picName = 'Belum ditentukan'; // Placeholder

            // Check for issues/notifications
            $hasIssues = $completionRate < 50 || $totalCriteria - $completedCriteria > 5;

            return [
                'id' => $program->id,
                'name' => $program->name,
                'fakultas' => $program->fakultas,
                'jenjang' => $program->jenjang,
                'progress_percentage' => round($completionRate, 1),
                'simulated_score' => $simulatedPoints,
                'nearest_deadline' => $nearestDeadline,
                'pic_name' => $picName,
                'has_issues' => $hasIssues,
                'completed_criteria' => $completedCriteria,
                'total_criteria' => $totalCriteria,
            ];
        })->toArray();
    }

    /**
     * Display progress summary per Fakultas/Prodi/Unit.
     */
    public function progressSummary(Request $request): Response
    {
        $filter = $request->get('filter', 'fakultas'); // fakultas, prodi, unit
        $unitId = $request->get('unit_id');
        $programId = $request->get('program_id');
        $fakultas = $request->get('fakultas');

        $data = match ($filter) {
            'fakultas' => $this->getFacultyStatus(),
            'prodi' => $this->getProgramStatus(),
            'unit' => $this->getUnitProgress($unitId),
            default => $this->getFacultyStatus(),
        };

        return Inertia::render('Dashboard/AdminLPMPP/ProgressSummary/Index', [
            'filter' => $filter,
            'data' => $data,
            'filters' => [
                'unit_id' => $unitId,
                'program_id' => $programId,
                'fakultas' => $fakultas,
            ],
        ]);
    }

    /**
     * Get unit progress data.
     */
    private function getUnitProgress(?string $unitId = null): array
    {
        $query = Unit::query()->where('is_active', true);

        if ($unitId) {
            $query->where('id', $unitId);
        }

        $units = $query->with([
            'assignments' => function ($q) {
                $q->whereNull('unassigned_at');
            },
        ])->get();

        return $units->map(function ($unit) {
            $totalAssignments = $unit->assignments->count();
            $completedAssignments = $unit->assignments->where('status', AssignmentStatus::Completed)->count();
            $progress = $totalAssignments > 0 ? ($completedAssignments / $totalAssignments) * 100 : 0;

            return [
                'id' => $unit->id,
                'name' => $unit->name,
                'type' => $unit->type->value ?? 'unit',
                'progress' => round($progress, 1),
                'total_assignments' => $totalAssignments,
                'completed_assignments' => $completedAssignments,
            ];
        })->toArray();
    }

    /**
     * List all assignments.
     */
    public function assignments(Request $request): Response
    {
        $query = Assignment::query()
            ->with(['criterion.standard.program', 'prodi.fakultas', 'assessor'])
            ->whereNull('unassigned_at');

        // Filters
        if ($request->has('criteria_id')) {
            $query->where('criteria_id', $request->get('criteria_id'));
        }

        if ($request->has('prodi_id')) {
            $query->where('prodi_id', $request->get('prodi_id'));
        }

        if ($request->has('assessor_id')) {
            $query->where('assessor_id', $request->get('assessor_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $assignments = $query->latest('assigned_date')->paginate(15);

        // Map assignments to include readable names
        $assignments->getCollection()->transform(function ($assignment) {
            return [
                'id' => $assignment->id,
                'criteria_name' => $assignment->criterion?->name ?? 'N/A',
                'program_name' => $assignment->criterion?->standard?->program?->name ?? 'N/A',
                'fakultas_name' => $assignment->prodi?->fakultas?->name ?? 'N/A',
                'prodi_name' => $assignment->prodi?->name ?? 'N/A',
                'assessor_name' => $assignment->assessor?->name ?? null,
                'status' => $assignment->status->value ?? $assignment->status,
                'assigned_date' => $assignment->assigned_date?->format('Y-m-d') ?? null,
                'deadline' => $assignment->deadline?->format('Y-m-d') ?? null,
            ];
        });

        return Inertia::render('Dashboard/AdminLPMPP/Assignments/Index', [
            'assignments' => $assignments,
            'filters' => $request->only(['criteria_id', 'prodi_id', 'assessor_id', 'status']),
        ]);
    }

    /**
     * Show form to create assignment.
     */
    public function createAssignment(): Response
    {
        $criteria = Criterion::with(['standard.program'])->get()->map(function ($criterion) {
            return [
                'id' => $criterion->id,
                'name' => $criterion->name,
                'standard' => [
                    'program' => [
                        'name' => $criterion->standard?->program?->name ?? 'N/A',
                    ],
                ],
            ];
        });

        $fakultas = Fakultas::where('is_active', true)
            ->with('prodis')
            ->get()
            ->map(function ($fakultas) {
                return [
                    'id' => $fakultas->id,
                    'name' => $fakultas->name,
                    'prodis' => $fakultas->prodis->where('is_active', true)->map(function ($prodi) {
                        return [
                            'id' => $prodi->id,
                            'name' => $prodi->name,
                        ];
                    }),
                ];
            });

        $assessors = User::whereHas('roles', function ($q) {
            $q->where('name', 'Asesor Internal');
        })->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
            ];
        });

        return Inertia::render('Dashboard/AdminLPMPP/Assignments/Create', [
            'criteria' => $criteria,
            'fakultas' => $fakultas,
            'assessors' => $assessors,
        ]);
    }

    /**
     * Store new assignment.
     */
    public function storeAssignment(StoreAssignmentRequest $request): RedirectResponse
    {
        $assignment = Assignment::create([
            'criteria_id' => $request->criteria_id,
            'prodi_id' => $request->prodi_id,
            'assessor_id' => $request->assessor_id,
            'assigned_date' => $request->assigned_date,
            'deadline' => $request->deadline,
            'access_level' => AssessorAccessLevel::from($request->access_level),
            'status' => $request->assessor_id ? AssignmentStatus::Pending : AssignmentStatus::Pending,
            'notes' => $request->notes,
        ]);

        $this->logActivity('created', 'assignment', $assignment->id, 'Membuat penugasan baru');

        return redirect()->route('admin-lpmpp.assignments.index')
            ->with('success', 'Penugasan berhasil dibuat.');
    }

    /**
     * Show form to edit assignment.
     */
    public function editAssignment(string $id): Response
    {
        $assignment = Assignment::with(['criterion.standard.program', 'unit', 'assessor'])->findOrFail($id);
        $criteria = Criterion::with('standard.program')->get();
        $units = Unit::where('is_active', true)->get();
        $assessors = User::whereHas('roles', function ($q) {
            $q->where('name', 'Asesor Internal');
        })->get();

        return Inertia::render('Dashboard/AdminLPMPP/Assignments/Edit', [
            'assignment' => $assignment,
            'criteria' => $criteria,
            'units' => $units,
            'assessors' => $assessors,
        ]);
    }

    /**
     * Update assignment.
     */
    public function updateAssignment(UpdateAssignmentRequest $request, string $id): RedirectResponse
    {
        $assignment = Assignment::findOrFail($id);

        $assignment->update($request->only([
            'criteria_id',
            'unit_id',
            'assessor_id',
            'assigned_date',
            'deadline',
            'access_level',
            'status',
            'notes',
        ]));

        if ($request->has('access_level')) {
            $assignment->access_level = AssessorAccessLevel::from($request->access_level);
        }

        if ($request->has('status')) {
            $assignment->status = AssignmentStatus::from($request->status);
        }

        $assignment->save();

        $this->logActivity('updated', 'assignment', $assignment->id, 'Memperbarui penugasan');

        return redirect()->route('admin-lpmpp.assignments.index')
            ->with('success', 'Penugasan berhasil diperbarui.');
    }

    /**
     * Assign assessor to assignment.
     */
    public function assignAssessor(AssignAssessorRequest $request, string $id): RedirectResponse
    {
        $assignment = Assignment::findOrFail($id);

        $assignment->update([
            'assessor_id' => $request->assessor_id,
            'assigned_date' => $request->assigned_date,
            'deadline' => $request->deadline,
            'access_level' => AssessorAccessLevel::from($request->access_level),
            'status' => AssignmentStatus::Pending,
        ]);

        $this->logActivity('assigned', 'assignment', $assignment->id, 'Menugaskan asesor ke penugasan');

        return redirect()->back()->with('success', 'Asesor berhasil ditugaskan.');
    }

    /**
     * Unassign assessor from assignment.
     */
    public function unassignAssessor(UnassignAssessorRequest $request, string $id): RedirectResponse
    {
        $assignment = Assignment::findOrFail($id);

        $assignment->update([
            'unassigned_at' => now(),
            'unassigned_by' => Auth::id(),
        ]);

        $this->logActivity('unassigned', 'assignment', $assignment->id, 'Membatalkan penugasan asesor');

        return redirect()->back()->with('success', 'Penugasan asesor berhasil dibatalkan.');
    }

    /**
     * Hapus penugasan asesor secara permanen.
     */
    public function destroyAssignment(string $id): RedirectResponse
    {
        $assignment = Assignment::findOrFail($id);

        $this->logActivity('deleted', 'assignment', $assignment->id, 'Menghapus penugasan asesor');

        $assignment->delete();

        return redirect()->route('admin-lpmpp.assignments.index')
            ->with('success', 'Penugasan berhasil dihapus.');
    }

    /**
     * Approve assessor assignment request.
     */
    public function approveAssessorRequest(string $id, NotificationService $notificationService): RedirectResponse
    {
        $requestModel = AssessorAssignmentRequest::findOrFail($id);

        $assessor = null;
        if ($requestModel->preferred_assessor_email) {
            $assessor = User::where('email', $requestModel->preferred_assessor_email)->first();
            if (!$assessor) {
                $assessor = User::create([
                    'name' => preg_replace('/@.*/', '', $requestModel->preferred_assessor_email),
                    'email' => $requestModel->preferred_assessor_email,
                    'is_active' => true,
                    'password' => str()->random(12),
                ]);
            } else {
                if (!$assessor->is_active) {
                    $assessor->update(['is_active' => true]);
                }
            }

            $role = Role::where('name', 'Asesor Internal')->first();
            if ($role && !$assessor->roles()->where('roles.id', $role->id)->exists()) {
                $assessor->roles()->attach($role->id);
            }
        }

        $assignment = Assignment::create([
            'criteria_id' => $requestModel->criteria_id,
            'prodi_id' => $requestModel->prodi_id,
            'assessor_id' => $assessor?->id,
            'assigned_date' => Carbon::today(),
            'deadline' => Carbon::today()->addDays(30),
            'access_level' => AssessorAccessLevel::ReadWrite,
            'status' => AssignmentStatus::Pending,
            'notes' => $requestModel->notes,
        ]);

        if ($requestModel->scope_category) {
            Document::where('prodi_id', $requestModel->prodi_id)
                ->where('category', $requestModel->scope_category)
                ->update(['assignment_id' => $assignment->id]);
        }

        $requestModel->update([
            'status' => 'approved',
            'processed_by' => Auth::id(),
            'processed_at' => now(),
        ]);

        if ($assessor) {
            $notificationService->sendToUser(
                $assessor,
                NotificationType::PolicyUpdate,
                'Penugasan Asesor',
                'Anda ditugaskan untuk melakukan penilaian pada kriteria/LKPS.',
                [
                    'assignment_id' => $assignment->id,
                    'criteria_id' => $assignment->criteria_id,
                ]
            );
        }

        if ($requestModel->requester) {
            $notificationService->sendToUser(
                $requestModel->requester,
                NotificationType::PolicyUpdate,
                'Permintaan Disetujui',
                'Permintaan penunjukan asesor Anda telah disetujui.',
                [
                    'assessor_request_id' => $requestModel->id,
                    'assignment_id' => $assignment->id,
                ]
            );
        }

        $this->logActivity('approved', 'assessor_request', $requestModel->id, 'Menyetujui permintaan penunjukan asesor');

        return redirect()->back()->with('success', 'Permintaan penunjukan asesor disetujui.');
    }

    /**
     * Reject assessor assignment request.
     */
    public function rejectAssessorRequest(string $id): RedirectResponse
    {
        $requestModel = AssessorAssignmentRequest::findOrFail($id);

        $requestModel->update([
            'status' => 'rejected',
            'processed_by' => Auth::id(),
            'processed_at' => now(),
        ]);

        $this->logActivity('rejected', 'assessor_request', $requestModel->id, 'Menolak permintaan penunjukan asesor');

        return redirect()->back()->with('success', 'Permintaan penunjukan asesor ditolak.');
    }

    /**
     * Display statistics.
     */
    public function statistics(Request $request): Response
    {
        $programId = $request->get('program_id');
        $unitId = $request->get('unit_id');

        // Status distribution
        $readinessStatus = $this->calculateReadinessStatus();

        // Progress chart data
        $progressChartData = $this->getProgressChartData();

        // Document completeness
        $documentCompleteness = $this->getDocumentCompletenessData();

        // Points summary
        $pointsSummary = $this->getPointsSummary($programId, $unitId);

        return Inertia::render('Dashboard/AdminLPMPP/Statistics/Index', [
            'readinessStatus' => $readinessStatus,
            'progressChartData' => $progressChartData,
            'documentCompleteness' => $documentCompleteness,
            'pointsSummary' => $pointsSummary,
            'filters' => [
                'program_id' => $programId,
                'unit_id' => $unitId,
            ],
        ]);
    }

    /**
     * Display latest accreditation simulations across Prodi.
     */
    public function simulations(Request $request): Response
    {
        $query = AccreditationSimulation::query()
            ->with(['accreditationCycle.prodi', 'accreditationCycle.lam', 'creator'])
            ->latest('created_at');

        if ($request->filled('prodi_id')) {
            $query->whereHas('accreditationCycle.prodi', function ($q) use ($request) {
                $q->where('id', $request->string('prodi_id')->toString());
            });
        }

        if ($request->filled('lam_id')) {
            $query->whereHas('accreditationCycle.lam', function ($q) use ($request) {
                $q->where('id', $request->integer('lam_id'));
            });
        }

        if ($request->filled('cycle_id')) {
            $query->where('accreditation_cycle_id', $request->string('cycle_id')->toString());
        }

        $simulations = $query->paginate(15)->withQueryString()->through(function ($sim) {
            return [
                'id' => $sim->id,
                'cycle' => [
                    'id' => $sim->accreditationCycle?->id,
                    'name' => $sim->accreditationCycle?->cycle_name,
                    'prodi' => $sim->accreditationCycle?->prodi?->name,
                    'lam' => $sim->accreditationCycle?->lam?->code,
                ],
                'total_score' => $sim->total_score,
                'predicted_result' => $sim->predicted_result,
                'created_at' => $sim->created_at?->format('Y-m-d H:i'),
                'created_by' => $sim->creator?->name ?? 'N/A',
            ];
        });

        $lams = LAM::orderBy('name')->get(['id', 'name', 'code']);
        $prodis = Prodi::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Dashboard/AdminLPMPP/Simulations/Index', [
            'simulations' => $simulations,
            'lams' => $lams,
            'prodis' => $prodis,
            'filters' => $request->only(['prodi_id', 'lam_id', 'cycle_id']),
        ]);
    }

    /**
     * Get points summary.
     */
    private function getPointsSummary(?string $programId = null, ?string $unitId = null): array
    {
        $query = Evaluation::query()
            ->with(['assignment.criterion.standard.program', 'assignment.unit', 'criteriaPoint']);

        if ($programId) {
            $query->whereHas('assignment.criterion.standard', fn($q) => $q->where('program_id', $programId));
        }

        if ($unitId) {
            $query->whereHas('assignment', fn($q) => $q->where('unit_id', $unitId));
        }

        $evaluations = $query->get();

        $totalPoints = $evaluations->sum('score');
        $averagePoints = $evaluations->avg('score') ?? 0;

        $pointsByCriteria = $evaluations->groupBy('assignment.criterion.name')->map(function ($group) {
            return [
                'criteria' => $group->first()->assignment->criterion->name ?? 'N/A',
                'total_points' => $group->sum('score'),
                'average_points' => $group->avg('score') ?? 0,
                'count' => $group->count(),
            ];
        })->values();

        $pointsByStandard = $evaluations->groupBy('assignment.criterion.standard.name')->map(function ($group) {
            return [
                'standard' => $group->first()->assignment->criterion->standard->name ?? 'N/A',
                'total_points' => $group->sum('score'),
                'average_points' => $group->avg('score') ?? 0,
                'count' => $group->count(),
            ];
        })->values();

        return [
            'total_points' => round($totalPoints, 2),
            'average_points' => round($averagePoints, 2),
            'points_by_criteria' => $pointsByCriteria,
            'points_by_standard' => $pointsByStandard,
        ];
    }

    /**
     * List all employees.
     */
    public function employees(Request $request): Response
    {
        $query = Employee::query()->with(['unit', 'homebaseUnit']);

        // Filters
        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->get('unit_id'));
        }

        if ($request->has('employment_status')) {
            $query->where('employment_status', $request->get('employment_status'));
        }

        if ($request->has('employment_type')) {
            $query->where('employment_type', $request->get('employment_type'));
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nip_nip3k_nik', 'like', "%{$search}%");
            });
        }

        $employees = $query->latest()->paginate(15);

        $units = Unit::where('is_active', true)->get();

        return Inertia::render('Dashboard/AdminLPMPP/Employees/Index', [
            'employees' => $employees,
            'units' => $units,
            'filters' => $request->only(['unit_id', 'employment_status', 'employment_type', 'search']),
        ]);
    }

    /**
     * Show employee detail.
     */
    public function showEmployee(string $id): Response
    {
        $employee = Employee::with(['unit', 'homebaseUnit', 'user', 'roleAssignments'])->findOrFail($id);

        return Inertia::render('Dashboard/AdminLPMPP/Employees/Show', [
            'employee' => $employee,
        ]);
    }

    /**
     * Show form to create employee.
     */
    public function createEmployee(): Response
    {
        $units = Unit::where('is_active', true)->get();

        return Inertia::render('Dashboard/AdminLPMPP/Employees/Create', [
            'units' => $units,
        ]);
    }

    /**
     * Store new employee.
     */
    public function storeEmployee(StoreEmployeeRequest $request): RedirectResponse
    {
        $employee = Employee::create($request->validated());

        $this->logActivity('created', 'employee', $employee->id, 'Membuat data pegawai baru');

        return redirect()->route('admin-lpmpp.employees.index')
            ->with('success', 'Data pegawai berhasil dibuat.');
    }

    /**
     * Show form to edit employee.
     */
    public function editEmployee(string $id): Response
    {
        $employee = Employee::with(['unit', 'homebaseUnit'])->findOrFail($id);
        $units = Unit::where('is_active', true)->get();

        return Inertia::render('Dashboard/AdminLPMPP/Employees/Edit', [
            'employee' => $employee,
            'units' => $units,
        ]);
    }

    /**
     * Update employee.
     */
    public function updateEmployee(UpdateEmployeeRequest $request, string $id): RedirectResponse
    {
        $employee = Employee::findOrFail($id);
        $employee->update($request->validated());

        $this->logActivity('updated', 'employee', $employee->id, 'Memperbarui data pegawai');

        return redirect()->route('admin-lpmpp.employees.index')
            ->with('success', 'Data pegawai berhasil diperbarui.');
    }

    /**
     * Sync employees from external source.
     */
    public function syncEmployees(SyncEmployeesRequest $request): RedirectResponse
    {
        $source = $request->source;
        $unitId = $request->unit_id;
        $forceUpdate = $request->boolean('force_update', false);

        // TODO: Implement sync logic based on source (siasn, api, manual)
        // For now, return placeholder
        $created = 0;
        $updated = 0;
        $errors = [];

        $this->logActivity('synced', 'employee', null, "Sinkronisasi data pegawai dari {$source}");

        return redirect()->route('admin-lpmpp.employees.index')
            ->with('success', "Sinkronisasi selesai. Created: {$created}, Updated: {$updated}, Errors: " . count($errors));
    }

    /**
     * List all reports.
     */
    public function reports(Request $request): Response
    {
        $reports = Report::with(['program', 'generatedBy'])->latest()->paginate(15);

        // Add file_url to each report
        $reports->getCollection()->transform(function ($report) {
            $report->file_url = Storage::url($report->file_path);

            return $report;
        });

        return Inertia::render('Dashboard/AdminLPMPP/Reports/Index', [
            'reports' => $reports,
        ]);
    }

    /**
     * Generate report.
     */
    public function generateReport(GenerateReportRequest $request, ReportService $reportService): RedirectResponse
    {
        $type = $request->type;
        $programId = $request->program_id ?: null;
        $unitId = $request->unit_id ?: null;
        $format = $request->input('format');

        Log::info('Starting report generation', [
            'type' => $type,
            'format' => $format,
            'program_id' => $programId,
            'unit_id' => $unitId,
        ]);

        try {
            // Ensure reports directory exists
            $reportsDir = storage_path('app/public/reports');
            if (!is_dir($reportsDir)) {
                File::makeDirectory($reportsDir, 0755, true);
            }

            $filePath = match ($type) {
                'completeness' => $reportService->generateDocumentCompletenessReport('unit', $programId, $unitId, null, $format),
                'evaluation' => $reportService->generateAssessorEvaluationReport(null, $programId, $format),
                'executive' => $reportService->generateExecutiveReport($programId, $format),
                default => throw new \InvalidArgumentException("Type {$type} tidak didukung"),
            };

            if (empty($filePath)) {
                throw new \RuntimeException('File path kosong. Generate laporan gagal.');
            }

            // Verify file was created
            $fullPath = storage_path('app/public/' . $filePath);
            if (!file_exists($fullPath)) {
                throw new \RuntimeException("File tidak ditemukan di path: {$filePath}");
            }

            Log::info('Report file created', ['file_path' => $filePath, 'full_path' => $fullPath]);

            $reportData = [
                'file_path' => $filePath,
                'generated_by' => Auth::id(),
            ];

            // Only add program_id if it's not null
            if ($programId !== null) {
                $reportData['program_id'] = $programId;
            }

            $report = Report::create($reportData);

            $this->logActivity('generated', 'report', $report->id, "Membuat laporan {$type} format {$format}");

            $downloadUrl = Storage::url($filePath);

            Log::info('Report generated successfully', [
                'report_id' => $report->id,
                'download_url' => $downloadUrl,
            ]);

            return redirect()->route('admin-lpmpp.reports.index')
                ->with('success', 'Laporan berhasil dibuat. Silakan download dari daftar laporan.')
                ->with('download_url', $downloadUrl)
                ->with('report_id', $report->id);
        } catch (\InvalidArgumentException $e) {
            Log::warning('Invalid argument in report generation', [
                'error' => $e->getMessage(),
                'type' => $type,
                'format' => $format,
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat laporan: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Error generating report: ' . $e->getMessage(), [
                'type' => $type,
                'format' => $format,
                'program_id' => $programId,
                'unit_id' => $unitId,
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal membuat laporan: ' . $e->getMessage() . '. Silakan coba lagi atau hubungi administrator.');
        }
    }

    /**
     * Download report file.
     */
    public function downloadReport(string $id): BinaryFileResponse|RedirectResponse
    {
        $report = Report::findOrFail($id);

        $filePath = storage_path('app/public/' . $report->file_path);

        if (!file_exists($filePath)) {
            return redirect()->route('admin-lpmpp.reports.index')
                ->with('error', 'File laporan tidak ditemukan.');
        }

        // Determine MIME type based on file extension
        $extension = strtolower(pathinfo($report->file_path, PATHINFO_EXTENSION));
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls' => 'application/vnd.ms-excel',
            'csv' => 'text/csv',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc' => 'application/msword',
            'txt' => 'text/plain',
        ];

        $mimeType = $mimeTypes[$extension] ?? mime_content_type($filePath);
        $disposition = in_array($extension, ['pdf']) ? 'inline' : 'attachment';

        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => $disposition . '; filename="' . basename($report->file_path) . '"',
        ]);
    }

    /**
     * Preview report data.
     */
    public function previewReport(Request $request, ReportService $reportService): Response
    {
        $type = $request->get('type', 'completeness');
        $programId = $request->get('program_id');
        $unitId = $request->get('unit_id');

        $data = match ($type) {
            'completeness' => $reportService->getDocumentCompletenessData('unit', $programId, $unitId),
            default => [],
        };

        return Inertia::render('Dashboard/AdminLPMPP/Reports/Preview', [
            'type' => $type,
            'data' => $data,
        ]);
    }

    /**
     * List all notifications.
     */
    public function notifications(Request $request): Response
    {
        $query = Notification::query()->with(['user', 'unit']);

        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->get('type'));
        }

        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->get('unit_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $notifications = $query->latest('created_at')->paginate(15);

        return Inertia::render('Dashboard/AdminLPMPP/Notifications/Index', [
            'notifications' => $notifications,
            'filters' => $request->only(['type', 'unit_id', 'status']),
        ]);
    }

    /**
     * Send deadline reminder.
     */
    public function sendReminder(SendReminderRequest $request, NotificationService $notificationService): RedirectResponse
    {
        $assignmentId = $request->assignment_id;
        $unitId = $request->unit_id;
        $daysBefore = $request->days_before;
        $message = $request->message;

        if ($assignmentId) {
            $assignment = Assignment::with(['assessor', 'unit', 'criterion'])->findOrFail($assignmentId);
            $user = $assignment->assessor;

            if ($user && $assignment->deadline) {
                $daysUntilDeadline = now()->diffInDays($assignment->deadline, false);
                $deadlineDate = $assignment->deadline instanceof Carbon
                    ? $assignment->deadline->format('d F Y')
                    : Carbon::parse($assignment->deadline)->format('d F Y');
                $documentName = $assignment->criterion->name ?? 'Dokumen';

                $notificationService->sendDeadlineReminder(
                    $user,
                    $daysUntilDeadline,
                    $deadlineDate,
                    $documentName,
                    $assignment->unit->name ?? null,
                    $assignment->id
                );
            }
        } elseif ($unitId) {
            $unit = Unit::findOrFail($unitId);
            $assignments = Assignment::where('unit_id', $unitId)
                ->whereNotNull('deadline')
                ->whereNotNull('assessor_id')
                ->with(['assessor', 'criterion'])
                ->get();

            foreach ($assignments as $assignment) {
                if ($assignment->assessor && $assignment->deadline) {
                    $daysUntilDeadline = now()->diffInDays($assignment->deadline, false);
                    $deadlineDate = $assignment->deadline instanceof Carbon
                        ? $assignment->deadline->format('d F Y')
                        : Carbon::parse($assignment->deadline)->format('d F Y');
                    $documentName = $assignment->criterion->name ?? 'Dokumen';

                    if ($daysUntilDeadline <= $daysBefore) {
                        $notificationService->sendDeadlineReminder(
                            $assignment->assessor,
                            $daysUntilDeadline,
                            $deadlineDate,
                            $documentName,
                            $unit->name,
                            $assignment->id
                        );
                    }
                }
            }
        }

        $this->logActivity('sent', 'notification', null, 'Mengirim pengingat deadline');

        return redirect()->back()->with('success', 'Pengingat berhasil dikirim.');
    }

    /**
     * Send broadcast notification.
     */
    public function sendBroadcast(SendBroadcastRequest $request, NotificationService $notificationService): RedirectResponse
    {
        $unitIds = $request->unit_ids;
        $type = NotificationType::from($request->type);
        $title = $request->title;
        $message = $request->message;
        $channels = array_map(fn($ch) => NotificationChannel::from($ch), $request->channels);

        $units = Unit::whereIn('id', $unitIds)->get();

        $notificationService->sendBroadcast($units, $type, $title, $message, [
            'channels' => $request->channels,
        ]);

        $this->logActivity('sent', 'notification', null, 'Mengirim broadcast notifikasi');

        return redirect()->back()->with('success', 'Broadcast notifikasi berhasil dikirim.');
    }

    /**
     * List problem documents.
     */
    public function problemDocuments(Request $request): Response
    {
        $query = Document::query()
            ->with(['program', 'unit', 'assignment', 'uploadedBy', 'validatedBy'])
            ->where(function ($q) {
                $q->whereNotNull('expired_at')
                    ->where('expired_at', '<', now())
                    ->orWhere(function ($q2) {
                        $q2->whereNull('validated_at');
                    });
            });

        // Filter by issue type
        if ($request->has('issue_type')) {
            $issueType = $request->get('issue_type');
            match ($issueType) {
                'expired' => $query->whereNotNull('expired_at')->where('expired_at', '<', now()),
                'not_validated' => $query->whereNull('validated_at'),
                'wrong_format' => $query->whereRaw('1=1'), // Will filter in collection
                default => null,
            };
        }

        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->get('unit_id'));
        }

        if ($request->has('program_id')) {
            $query->where('program_id', $request->get('program_id'));
        }

        $documents = $query->latest()->get();

        // Filter wrong format in collection
        if ($request->has('issue_type') && $request->get('issue_type') === 'wrong_format') {
            $documents = $documents->filter(fn($doc) => $doc->hasWrongFormat());
        }

        // Set issue_type for each document
        $documents = $documents->map(function ($doc) {
            if ($doc->isExpired()) {
                $doc->issue_type = 'expired';
            } elseif ($doc->hasWrongFormat()) {
                $doc->issue_type = 'wrong_format';
            } elseif (!$doc->validated_at) {
                $doc->issue_type = 'not_validated';
            } else {
                $doc->issue_type = 'other';
            }

            return $doc;
        });

        // Group by issue type
        $grouped = $documents->groupBy('issue_type');

        return Inertia::render('Dashboard/AdminLPMPP/ProblemDocuments/Index', [
            'documents' => $documents->values(),
            'grouped' => $grouped->map(fn($group) => $group->values())->toArray(),
            'filters' => $request->only(['issue_type', 'unit_id', 'program_id']),
        ]);
    }

    /**
     * List assessor assignment requests.
     */
    public function assessorRequests(Request $request): Response
    {
        $query = AssessorAssignmentRequest::query()
            ->with(['prodi.fakultas', 'criterion.standard.program', 'requester']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->latest()->paginate(15)->withQueryString()->through(function ($req) {
            return [
                'id' => $req->id,
                'prodi' => $req->prodi?->name ?? 'N/A',
                'fakultas' => $req->prodi?->fakultas?->name ?? 'N/A',
                'criterion' => $req->criterion?->name ?? 'N/A',
                'program' => $req->criterion?->standard?->program?->name ?? 'N/A',
                'scope_category' => $req->scope_category,
                'preferred_assessor_email' => $req->preferred_assessor_email,
                'requested_by' => $req->requester?->name ?? 'N/A',
                'status' => $req->status,
                'created_at' => $req->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        return Inertia::render('Dashboard/AdminLPMPP/AssessorRequests/Index', [
            'requests' => $requests,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Display accreditation assessor assignments page.
     */
    public function accreditationAssessorAssignments(Request $request): Response
    {
        $query = \App\Models\AccreditationAssessorAssignment::query()
            ->with(['accreditationCycle.prodi.fakultas', 'accreditationCycle.lam', 'assessor', 'assignedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('cycle_id')) {
            $query->where('accreditation_cycle_id', $request->cycle_id);
        }

        $assignments = $query->latest('assigned_date')->paginate(20);

        // Get all accreditation cycles for filter
        $cycles = \App\Models\AccreditationCycle::with(['prodi', 'lam'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get users with Assessor External role
        $externalAssessors = User::whereHas('roles', function ($q) {
            $q->where('name', 'Asesor Eksternal');
        })->get(['id', 'name', 'email']);

        return Inertia::render('Dashboard/AdminLPMPP/AccreditationAssessorAssignments/Index', [
            'assignments' => $assignments,
            'cycles' => $cycles,
            'externalAssessors' => $externalAssessors,
            'filters' => $request->only(['status', 'cycle_id']),
        ]);
    }

    /**
     * Assign external assessor to accreditation cycle.
     */
    public function assignAccreditationAssessor(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'accreditation_cycle_id' => 'required|uuid|exists:accreditation_cycles,id',
            'assessor_id' => 'required|uuid|exists:users,id',
            'deadline' => 'nullable|date|after_or_equal:today',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if assessor has External Assessor role
        $assessor = User::findOrFail($validated['assessor_id']);
        if (!$assessor->roles->contains('name', 'Asesor Eksternal')) {
            return redirect()->back()->with('error', 'User yang dipilih bukan Asesor Eksternal');
        }

        // Check if assignment already exists
        $existing = \App\Models\AccreditationAssessorAssignment::where('accreditation_cycle_id', $validated['accreditation_cycle_id'])
            ->where('assessor_id', $validated['assessor_id'])
            ->where('status', '!=', 'cancelled')
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Asesor sudah di-assign ke siklus akreditasi ini');
        }

        \App\Models\AccreditationAssessorAssignment::create([
            'accreditation_cycle_id' => $validated['accreditation_cycle_id'],
            'assessor_id' => $validated['assessor_id'],
            'assigned_by' => Auth::id(),
            'assigned_date' => now(),
            'deadline' => $validated['deadline'] ?? null,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Send notification to assessor
        $cycle = \App\Models\AccreditationCycle::with('prodi')->findOrFail($validated['accreditation_cycle_id']);
        $this->notificationService->sendToUser(
            $assessor,
            NotificationType::AssessorAssignment,
            'Penugasan Asesor Eksternal',
            "Anda telah di-assign sebagai Asesor Eksternal untuk siklus akreditasi: {$cycle->cycle_name} - {$cycle->prodi->name}",
            [
                'accreditation_cycle_id' => $cycle->id,
                'cycle_name' => $cycle->cycle_name,
            ],
            [NotificationChannel::Email, NotificationChannel::InApp]
        );

        return redirect()->back()->with('success', 'Asesor eksternal berhasil di-assign');
    }

    /**
     * Kelola LAM - daftar LAM aktif.
     */
    public function lamIndex(Request $request): Response
    {
        $lams = LAM::orderBy('name')
            ->get(['id', 'name', 'code', 'description', 'is_active']);

        return Inertia::render('Dashboard/AdminLPMPP/LAM/Index', [
            'lams' => $lams->map(function ($lam) {
                return [
                    'id' => $lam->id,
                    'name' => $lam->name,
                    'code' => $lam->code,
                    'description' => $lam->description,
                    'is_active' => $lam->is_active,
                ];
            }),
        ]);
    }

    /**
     * Form tambah LAM baru.
     */
    public function lamCreate(): Response
    {
        return Inertia::render('Dashboard/AdminLPMPP/LAM/Create', [
            'defaults' => [
                'min_score_scale' => 1,
                'max_score_scale' => 4,
                'is_active' => true,
                'accreditation_levels' => ['Unggul', 'Baik Sekali', 'Baik', 'Tidak Terakreditasi'],
            ],
        ]);
    }

    /**
     * Simpan LAM baru.
     */
    public function lamStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:lams,name'],
            'code' => ['required', 'string', 'max:50', 'unique:lams,code'],
            'description' => ['nullable', 'string'],
            'min_score_scale' => ['required', 'integer', 'min:0', 'max:10'],
            'max_score_scale' => ['required', 'integer', 'min:1', 'max:10'],
            'is_active' => ['sometimes', 'boolean'],
            'accreditation_levels' => ['nullable'],
        ]);

        if ((int) $validated['max_score_scale'] < (int) $validated['min_score_scale']) {
            return redirect()->back()
                ->withErrors(['max_score_scale' => 'Maksimal skala harus ≥ minimal skala'])
                ->withInput();
        }

        $levels = null;
        if ($request->has('accreditation_levels') && $request->accreditation_levels !== null) {
            if (is_array($request->accreditation_levels)) {
                $levels = array_values(array_filter(array_map(fn ($v) => is_string($v) ? trim($v) : $v, $request->accreditation_levels), fn ($v) => (string) $v !== ''));
            } else {
                $levels = collect(explode(',', (string) $request->accreditation_levels))
                    ->map(fn ($v) => trim($v))
                    ->filter(fn ($v) => $v !== '')
                    ->values()
                    ->all();
            }
        }

        $lam = LAM::create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'] ?? null,
            'min_score_scale' => (int) $validated['min_score_scale'],
            'max_score_scale' => (int) $validated['max_score_scale'],
            'accreditation_levels' => $levels,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        $this->logActivity('created', 'LAM', (string) $lam->id, "Menambahkan LAM baru: {$lam->code} - {$lam->name}");

        return redirect()->route('admin-lpmpp.lam.edit', $lam->id)
            ->with('success', 'LAM baru berhasil dibuat. Silakan susun struktur standar, elemen, indikator, dan rubrik.');
    }

    /**
     * Edit struktur LAM: standar, elemen, indikator, rubrik.
     */
    public function lamEdit(string $id): Response
    {
        $lam = LAM::with([
            'standards' => function ($q) {
                $q->orderBy('order_index');
            },
            'standards.elements' => function ($q) {
                $q->orderBy('order_index');
            },
            'standards.elements.indicators' => function ($q) {
                $q->orderBy('order_index');
            },
            'standards.elements.indicators.rubrics' => function ($q) {
                $q->orderBy('score', 'desc');
            },
        ])->findOrFail($id);

        return Inertia::render('Dashboard/AdminLPMPP/LAM/Edit', [
            'lam' => [
                'id' => $lam->id,
                'name' => $lam->name,
                'code' => $lam->code,
                'description' => $lam->description,
                'min_score_scale' => $lam->min_score_scale,
                'max_score_scale' => $lam->max_score_scale,
                'accreditation_levels' => $lam->accreditation_levels,
            ],
            'standards' => $lam->standards->map(function ($standard) {
                return [
                    'id' => $standard->id,
                    'code' => $standard->code,
                    'name' => $standard->name,
                    'description' => $standard->description,
                    'weight' => $standard->weight,
                    'order_index' => $standard->order_index,
                    'elements' => $standard->elements->map(function ($element) {
                        return [
                            'id' => $element->id,
                            'code' => $element->code,
                            'name' => $element->name,
                            'description' => $element->description,
                            'weight' => $element->weight,
                            'order_index' => $element->order_index,
                            'indicators' => $element->indicators->map(function ($indicator) {
                                return [
                                    'id' => $indicator->id,
                                    'code' => $indicator->code,
                                    'name' => $indicator->name,
                                    'description' => $indicator->description,
                                    'document_requirements' => $indicator->document_requirements,
                                    'weight' => $indicator->weight,
                                    'order_index' => $indicator->order_index,
                                    'is_auto_scorable' => $indicator->is_auto_scorable,
                                    'auto_scoring_rules' => $indicator->auto_scoring_rules,
                                    'rubrics' => $indicator->rubrics->map(function ($rubric) {
                                        return [
                                            'id' => $rubric->id,
                                            'score' => $rubric->score,
                                            'label' => $rubric->label,
                                            'description' => $rubric->description,
                                            'order_index' => $rubric->order_index,
                                        ];
                                    }),
                                ];
                            }),
                        ];
                    }),
                ];
            }),
        ]);
    }

    /**
     * Update struktur LAM dari input Admin LPMPP.
     */
    public function updateLAMStructure(Request $request, string $lamId): RedirectResponse
    {
        $lam = LAM::findOrFail($lamId);

        $validated = $request->validate([
            'standards' => 'required|array',
            'standards.*.id' => 'nullable|integer|exists:lam_standards,id',
            'standards.*.code' => 'required|string|max:20',
            'standards.*.name' => 'required|string|max:255',
            'standards.*.description' => 'nullable|string',
            'standards.*.weight' => 'nullable|numeric|min:0|max:100',
            'standards.*.order_index' => 'nullable|integer|min:1',
            'standards.*.elements' => 'array',
            'standards.*.elements.*.id' => 'nullable|integer|exists:lam_elements,id',
            'standards.*.elements.*.code' => 'required|string|max:20',
            'standards.*.elements.*.name' => 'required|string|max:255',
            'standards.*.elements.*.description' => 'nullable|string',
            'standards.*.elements.*.weight' => 'nullable|numeric|min:0|max:400',
            'standards.*.elements.*.order_index' => 'nullable|integer|min:1',
            'standards.*.elements.*.indicators' => 'array',
            'standards.*.elements.*.indicators.*.id' => 'nullable|integer|exists:lam_indicators,id',
            'standards.*.elements.*.indicators.*.code' => 'required|string|max:20',
            'standards.*.elements.*.indicators.*.name' => 'required|string|max:255',
            'standards.*.elements.*.indicators.*.description' => 'nullable|string',
            'standards.*.elements.*.indicators.*.document_requirements' => 'nullable|array',
            'standards.*.elements.*.indicators.*.weight' => 'nullable|numeric|min:0|max:100',
            'standards.*.elements.*.indicators.*.order_index' => 'nullable|integer|min:1',
            'standards.*.elements.*.indicators.*.is_auto_scorable' => 'nullable|boolean',
            'standards.*.elements.*.indicators.*.auto_scoring_rules' => 'nullable|array',
            'standards.*.elements.*.indicators.*.rubrics' => 'array',
            'standards.*.elements.*.indicators.*.rubrics.*.id' => 'nullable|integer|exists:lam_rubrics,id',
            'standards.*.elements.*.indicators.*.rubrics.*.score' => 'required|integer|min:1',
            'standards.*.elements.*.indicators.*.rubrics.*.label' => 'nullable|string|max:100',
            'standards.*.elements.*.indicators.*.rubrics.*.description' => 'required|string',
            'standards.*.elements.*.indicators.*.rubrics.*.order_index' => 'nullable|integer|min:1',
        ]);

        $this->persistLamStructure($lam, $validated['standards']);

        $this->logActivity('lam_structure_updated', 'LAM', $lam->id, "Struktur LAM {$lam->code} diperbarui oleh Admin LPMPP");

        return redirect()->route('admin-lpmpp.lam.edit', $lam->id)->with('success', 'Struktur LAM berhasil diperbarui.');
    }

    /**
     * Persist nested LAM structure (standards → elements → indicators → rubrics).
     */
    private function persistLamStructure(LAM $lam, array $standards): void
    {
        foreach ($standards as $sIndex => $standardData) {
            $standard = LAMStandard::updateOrCreate(
                [
                    'id' => $standardData['id'] ?? null,
                ],
                [
                    'lam_id' => $lam->id,
                    'code' => $standardData['code'],
                    'name' => $standardData['name'],
                    'description' => $standardData['description'] ?? null,
                    'weight' => $standardData['weight'] ?? 0,
                    'order_index' => $standardData['order_index'] ?? ($sIndex + 1),
                ]
            );

            foreach (($standardData['elements'] ?? []) as $eIndex => $elementData) {
                $element = LAMElement::updateOrCreate(
                    [
                        'id' => $elementData['id'] ?? null,
                    ],
                    [
                        'lam_standard_id' => $standard->id,
                        'code' => $elementData['code'],
                        'name' => $elementData['name'],
                        'description' => $elementData['description'] ?? null,
                        'weight' => $elementData['weight'] ?? 0,
                        'order_index' => $elementData['order_index'] ?? ($eIndex + 1),
                    ]
                );

                foreach (($elementData['indicators'] ?? []) as $iIndex => $indicatorData) {
                    $indicator = LAMIndicator::updateOrCreate(
                        [
                            'id' => $indicatorData['id'] ?? null,
                        ],
                        [
                            'lam_element_id' => $element->id,
                            'code' => $indicatorData['code'],
                            'name' => $indicatorData['name'],
                            'description' => $indicatorData['description'] ?? null,
                            'document_requirements' => $indicatorData['document_requirements'] ?? [],
                            'weight' => $indicatorData['weight'] ?? 0,
                            'order_index' => $indicatorData['order_index'] ?? ($iIndex + 1),
                            'is_auto_scorable' => $indicatorData['is_auto_scorable'] ?? false,
                            'auto_scoring_rules' => $indicatorData['auto_scoring_rules'] ?? null,
                        ]
                    );

                    // Ensure 4 rubrics for scores 1..4 if not provided
                    $rubrics = $indicatorData['rubrics'] ?? [];
                    if (empty($rubrics)) {
                        $rubrics = [
                            ['score' => 4, 'label' => 'Sangat Baik', 'description' => ''],
                            ['score' => 3, 'label' => 'Baik', 'description' => ''],
                            ['score' => 2, 'label' => 'Cukup', 'description' => ''],
                            ['score' => 1, 'label' => 'Kurang', 'description' => ''],
                        ];
                    }

                    foreach ($rubrics as $rIndex => $rubricData) {
                        LAMRubric::updateOrCreate(
                            [
                                'id' => $rubricData['id'] ?? null,
                            ],
                            [
                                'lam_indicator_id' => $indicator->id,
                                'score' => $rubricData['score'],
                                'label' => $rubricData['label'] ?? null,
                                'description' => $rubricData['description'] ?? '',
                                'order_index' => $rubricData['order_index'] ?? ($rIndex + 1),
                            ]
                        );
                    }
                }
            }
        }
    }

    /**
     * Daftar Asesor Eksternal.
     */
    public function externalAssessors(Request $request): Response
    {
        $query = User::query()
            ->select(['id', 'name', 'email', 'is_active'])
            ->whereHas('roles', function ($q) {
                $q->where('name', 'Asesor Eksternal');
            });

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->string('status')->toString();
            if (in_array($status, ['active', 'inactive'])) {
                $query->where('is_active', $status === 'active');
            }
        }

        $assessors = $query->latest('created_at')->paginate(15)->withQueryString();

        return Inertia::render('Dashboard/AdminLPMPP/ExternalAssessors/Index', [
            'assessors' => $assessors,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Form buat Asesor Eksternal.
     */
    public function createExternalAssessor(): Response
    {
        return Inertia::render('Dashboard/AdminLPMPP/ExternalAssessors/Create', []);
    }

    /**
     * Simpan Asesor Eksternal baru.
     */
    public function storeExternalAssessor(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $plainPassword = $validated['password'] ?? Str::random(16);
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($plainPassword),
            'is_active' => true,
        ]);

        $role = Role::where('name', 'Asesor Eksternal')->first();
        if (!$role) {
            $role = Role::firstOrCreate(
                ['name' => 'Asesor Eksternal'],
                ['description' => 'Asesor akreditasi eksternal']
            );
        }

        $user->roles()->syncWithoutDetaching([$role->id]);

        $this->logActivity('created', 'external_assessor', $user->id, 'Membuat akun Asesor Eksternal');

        return redirect()->route('admin-lpmpp.external-assessors.index')
            ->with('success', 'Asesor Eksternal berhasil dibuat.');
    }

    /**
     * Form edit Asesor Eksternal.
     */
    public function editExternalAssessor(string $id): Response
    {
        $assessor = User::select(['id', 'name', 'email', 'is_active'])->findOrFail($id);

        return Inertia::render('Dashboard/AdminLPMPP/ExternalAssessors/Edit', [
            'assessor' => $assessor,
        ]);
    }

    /**
     * Perbarui Asesor Eksternal.
     */
    public function updateExternalAssessor(Request $request, string $id): RedirectResponse
    {
        $assessor = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $assessor->id],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $assessor->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' => $validated['is_active'] ?? $assessor->is_active,
        ]);

        $this->logActivity('updated', 'external_assessor', $assessor->id, 'Memperbarui akun Asesor Eksternal');

        return redirect()->route('admin-lpmpp.external-assessors.index')
            ->with('success', 'Asesor Eksternal berhasil diperbarui.');
    }

    /**
     * Nonaktifkan/hapus Asesor Eksternal.
     */
    public function destroyExternalAssessor(string $id): RedirectResponse
    {
        $assessor = User::findOrFail($id);

        $role = Role::where('name', 'Asesor Eksternal')->first();
        if ($role) {
            $assessor->roles()->detach($role->id);
        }

        $assessor->update(['is_active' => false]);

        $this->logActivity('deleted', 'external_assessor', $assessor->id, 'Menonaktifkan akun Asesor Eksternal');

        return redirect()->route('admin-lpmpp.external-assessors.index')
            ->with('success', 'Asesor Eksternal telah dinonaktifkan.');
    }

    /**
     * Log activity.
     */
    private function logActivity(string $action, string $entityType, ?string $entityId, string $description): void
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'unit_id' => Auth::user()?->unit_id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);
    }
}
