<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\CoordinatorProdi\SendReminderRequest;
use App\Http\Requests\CoordinatorProdi\SetTargetRequest;
use App\Http\Requests\CoordinatorProdi\StoreCriteriaPointRequest;
use App\Http\Requests\CoordinatorProdi\StoreCriterionRequest;
use App\Http\Requests\CoordinatorProdi\StoreDocumentRequest;
use App\Http\Requests\CoordinatorProdi\UpdateCriteriaPointRequest;
use App\Http\Requests\CoordinatorProdi\UpdateCriterionRequest;
use App\Http\Requests\CoordinatorProdi\UpdateDocumentRequest;
use App\Models\ActivityLog;
use App\Models\AkreditasiTarget;
use App\Models\AssessorAssignmentRequest;
use App\Models\Assignment;
use App\Models\CriteriaPoint;
use App\Models\Criterion;
use App\Models\Document;
use App\Models\Employee;
use App\Models\Evaluation;
use App\Models\NotificationChannel;
use App\Models\NotificationType;
use App\Models\Program;
use App\Models\Standard;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CoordinatorProdiController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {
        //
    }

    /**
     * Get authenticated user with proper type hint.
     */
    private function getUser(): \App\Models\User
    {
        /** @var \App\Models\User */
        return Auth::user();
    }

    /**
     * Display the coordinator prodi dashboard.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $this->getUser();
        $year = $request->get('year', Carbon::now()->year);

        // Validate that user has prodi_id
        if (!$user->prodi_id) {
            return redirect()->route('home')
                ->with('error', 'Anda belum terhubung dengan Program Studi. Silakan hubungi administrator.');
        }

        // Get user's accessible programs
        $programs = $user->accessiblePrograms()->get();

        // Document statistics
        $documentsQuery = Document::where('prodi_id', $user->prodi_id)
            ->where('year', $year);

        $totalDocuments = $documentsQuery->count();
        $validatedDocuments = (clone $documentsQuery)->whereNotNull('validated_at')->count();
        $pendingDocuments = (clone $documentsQuery)->whereNull('validated_at')->whereNull('rejected_by')->count();
        $rejectedDocuments = (clone $documentsQuery)->whereNotNull('rejected_by')->count();
        $expiredDocuments = (clone $documentsQuery)->where('expired_at', '<', Carbon::now())->count();

        // Calculate completeness percentage
        $completenessPercentage = $totalDocuments > 0
            ? round(($validatedDocuments / $totalDocuments) * 100, 2)
            : 0;

        // Assessment statistics
        $assignments = Assignment::where('prodi_id', $user->prodi_id)
            ->with(['evaluations', 'criterion.standard.program'])
            ->get();

        $totalEvaluations = Evaluation::whereHas('assignment', function ($q) use ($user) {
            $q->where('prodi_id', $user->prodi_id);
        })->count();

        $averageScore = Evaluation::whereHas('assignment', function ($q) use ($user) {
            $q->where('prodi_id', $user->prodi_id);
        })->avg('score') ?? 0;

        // Get score recap per criteria
        $scoreRecap = $this->calculateScoreRecap($user, $year);

        // Get targets
        $targets = AkreditasiTarget::whereIn('program_id', $programs->pluck('id'))
            ->where('year', $year)
            ->with('program')
            ->get();

        // Recent notifications
        $recentNotifications = $user->notifications()
            ->latest()
            ->limit(5)
            ->get();

        // Progress chart data (last 7 days)
        $progressChartData = $this->getProgressChartData($user, $year);

        // Document status distribution
        $documentStatusDistribution = [
            'validated' => $validatedDocuments,
            'pending' => $pendingDocuments,
            'rejected' => $rejectedDocuments,
            'expired' => $expiredDocuments,
        ];

        return Inertia::render('Dashboard/CoordinatorProdi/Index', [
            'stats' => [
                'totalDocuments' => $totalDocuments,
                'validatedDocuments' => $validatedDocuments,
                'pendingDocuments' => $pendingDocuments,
                'rejectedDocuments' => $rejectedDocuments,
                'expiredDocuments' => $expiredDocuments,
                'completenessPercentage' => $completenessPercentage,
                'totalEvaluations' => $totalEvaluations,
                'averageScore' => round($averageScore, 2),
            ],
            'scoreRecap' => $scoreRecap,
            'targets' => $targets,
            'recentNotifications' => $recentNotifications,
            'progressChartData' => $progressChartData,
            'documentStatusDistribution' => $documentStatusDistribution,
            'year' => $year,
        ]);
    }

    /**
     * Store a new document.
     */
    public function storeDocument(StoreDocumentRequest $request): RedirectResponse
    {
        $user = $this->getUser();
        $file = $request->file('file');

        // Validate that user has prodi_id
        if (!$user->prodi_id) {
            return redirect()->back()->with('error', 'Anda belum terhubung dengan Program Studi.');
        }

        // Generate file path
        $year = $request->year ?? Carbon::now()->year;
        $fileName = time() . '_' . str()->slug($file->getClientOriginalName());
        $filePath = "documents/{$user->prodi_id}/{$year}/{$fileName}";

        // Store file
        Storage::disk('local')->put($filePath, file_get_contents($file->getRealPath()));

        // Create document record
        $documentData = [
            'prodi_id' => $user->prodi_id,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'category' => $request->category,
            'year' => $year,
            'metadata' => $request->metadata ?? [],
            'uploaded_by' => $user->id,
        ];

        // Only add assignment_id if it's not null
        if ($request->filled('assignment_id')) {
            $documentData['assignment_id'] = $request->assignment_id;
        }

        $document = Document::create($documentData);

        // Redirect back to LKPS or dashboard
        return redirect()->back()
            ->with('success', 'Dokumen berhasil diupload.');
    }

    /**
     * Update document metadata.
     */
    public function updateDocument(UpdateDocumentRequest $request, string $id): RedirectResponse
    {
        $user = $this->getUser();
        $document = Document::where('prodi_id', $user->prodi_id)->findOrFail($id);

        $updateData = [];

        if ($request->hasFile('file')) {
            // Delete old file
            if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
                Storage::disk('local')->delete($document->file_path);
            }

            // Store new file
            $file = $request->file('file');
            $fileName = time() . '_' . str()->slug($file->getClientOriginalName());
            $filePath = "documents/{$user->prodi_id}/{$document->year}/{$fileName}";

            Storage::disk('local')->put($filePath, file_get_contents($file->getRealPath()));

            $updateData = array_merge($updateData, [
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);
        }

        if ($request->filled('category')) {
            $updateData['category'] = $request->category;
        }

        if ($request->filled('year')) {
            $updateData['year'] = $request->year;
        }

        if ($request->has('metadata')) {
            $updateData['metadata'] = $request->metadata;
        }

        $document->update($updateData);

        return redirect()->route('coordinator-prodi.documents.index')
            ->with('success', 'Dokumen berhasil diperbarui.');
    }

    /**
     * Delete a document.
     */
    public function deleteDocument(string $id): RedirectResponse
    {
        $user = $this->getUser();
        $document = Document::where('prodi_id', $user->prodi_id)->findOrFail($id);

        // Delete file
        if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        $document->delete();

        return redirect()->route('coordinator-prodi.documents.index')
            ->with('success', 'Dokumen berhasil dihapus.');
    }

    /**
     * Download a document.
     */
    public function downloadDocument(string $id): BinaryFileResponse
    {
        $user = $this->getUser();
        $document = Document::where('prodi_id', $user->prodi_id)->findOrFail($id);

        $filePath = Storage::disk('local')->path($document->file_path);

        return response()->download($filePath, $document->file_name);
    }

    /**
     * Display document completeness report.
     */
    public function documentCompleteness(Request $request): Response
    {
        $user = $this->getUser();
        $programId = $request->get('program_id');
        $year = (int) $request->get('year', Carbon::now()->year);

        $programsQuery = $user->accessiblePrograms();
        if ($programId) {
            $programsQuery = $programsQuery->where('id', $programId);
        }
        $programs = $programsQuery->with(['standards.criteria.criteriaPoints'])->get();

        $completenessData = $this->buildCompletenessData($programs, $user->prodi_id, $year);

        return Inertia::render('Dashboard/CoordinatorProdi/Reports/Completeness', [
            'completenessData' => $completenessData,
            'programs' => $user->accessiblePrograms()->get(['id', 'name']),
            'filters' => [
                'program_id' => $programId,
                'year' => $year,
            ],
        ]);
    }

    /**
     * Build completeness data for programs.
     *
     * @param  \Illuminate\Database\Eloquent\Collection<int, Program>  $programs
     * @return array<int, array<string, mixed>>
     */
    private function buildCompletenessData($programs, string $prodiId, int $year): array
    {
        $completenessData = [];

        foreach ($programs as $program) {
            $programData = $this->buildProgramCompletenessData($program, $prodiId, $year);
            $completenessData[] = $programData;
        }

        return $completenessData;
    }

    /**
     * Build completeness data for a single program.
     *
     * @return array<string, mixed>
     */
    private function buildProgramCompletenessData(Program $program, string $prodiId, int $year): array
    {
        $programData = [
            'program_id' => $program->id,
            'program_name' => $program->name,
            'standards' => [],
        ];

        foreach ($program->standards as $standard) {
            $standardData = $this->buildStandardCompletenessData($standard, $program->id, $prodiId, $year);
            $programData['standards'][] = $standardData;
        }

        // Calculate program summary
        $totalCriteria = collect($programData['standards'])->sum('total_criteria');
        $completedCriteria = collect($programData['standards'])->sum('completed_criteria');
        $programData['total_criteria'] = $totalCriteria;
        $programData['completed_criteria'] = $completedCriteria;
        $programData['completion_percentage'] = $totalCriteria > 0
            ? round(($completedCriteria / $totalCriteria) * 100, 2)
            : 0;

        return $programData;
    }

    /**
     * Build completeness data for a single standard.
     *
     * @return array<string, mixed>
     */
    private function buildStandardCompletenessData(Standard $standard, string $programId, string $prodiId, int $year): array
    {
        $standardData = [
            'standard_id' => $standard->id,
            'standard_name' => $standard->name,
            'total_criteria' => $standard->criteria->count(),
            'completed_criteria' => 0,
            'criteria' => [],
        ];

        foreach ($standard->criteria as $criterion) {
            $criterionData = $this->buildCriterionCompletenessData($criterion, $programId, $prodiId, $year);
            $standardData['criteria'][] = $criterionData;

            if ($criterionData['status'] === 'lengkap') {
                $standardData['completed_criteria']++;
            }
        }

        $standardData['completion_percentage'] = $standardData['total_criteria'] > 0
            ? round(($standardData['completed_criteria'] / $standardData['total_criteria']) * 100, 2)
            : 0;

        return $standardData;
    }

    /**
     * Build completeness data for a single criterion.
     *
     * @return array<string, mixed>
     */
    private function buildCriterionCompletenessData(Criterion $criterion, string $programId, string $prodiId, int $year): array
    {
        $documentsCount = Document::where('prodi_id', $prodiId)
            ->where('program_id', $programId)
            ->where('year', $year)
            ->whereHas('assignment', function ($q) use ($criterion) {
                $q->where('criteria_id', $criterion->id);
            })
            ->whereNotNull('validated_at')
            ->count();

        $isComplete = $documentsCount > 0;

        return [
            'criteria_id' => $criterion->id,
            'criteria_name' => $criterion->name,
            'documents_required' => 1,
            'documents_available' => $documentsCount,
            'status' => $isComplete ? 'lengkap' : 'belum_lengkap',
            'missing_documents' => $isComplete ? [] : ['Dokumen untuk kriteria ini belum diupload'],
        ];
    }

    /**
     * Send reminder notification to dosen/tendik.
     */
    public function sendReminder(SendReminderRequest $request): RedirectResponse
    {
        $user = $this->getUser();
        $recipients = Employee::whereIn('id', $request->recipient_ids)->get();

        $channels = match ($request->channel ?? 'both') {
            'email' => [NotificationChannel::Email],
            'whatsapp' => [NotificationChannel::WhatsApp],
            default => [NotificationChannel::Email, NotificationChannel::WhatsApp],
        };

        $message = $request->message ?? 'Silakan lengkapi dokumen yang diperlukan untuk akreditasi.';

        foreach ($recipients as $employee) {
            // Find user associated with employee
            $employeeUser = $employee->user()->first();
            if ($employeeUser) {
                $this->notificationService->sendToUser(
                    $employeeUser,
                    NotificationType::DeadlineReminder7Days,
                    'Pengingat Dokumen Akreditasi',
                    $message,
                    [
                        'recipient_type' => $request->recipient_type,
                        'document_id' => $request->document_id,
                    ],
                    $channels
                );
            }
        }

        return redirect()->back()
            ->with('success', 'Notifikasi pengingat berhasil dikirim.');
    }

    /**
     * Display assessment statistics.
     */
    public function assessmentStatistics(Request $request): Response
    {
        $user = $this->getUser();

        $query = Evaluation::whereHas('assignment', function ($q) use ($user) {
            $q->where('prodi_id', $user->prodi_id);
        })->with(['assignment.criterion.standard.program', 'assignment.assessor', 'criteriaPoint']);

        if ($request->filled('program_id')) {
            $query->whereHas('assignment.criterion.standard', function ($q) use ($request) {
                $q->where('program_id', $request->program_id);
            });
        }

        if ($request->filled('criteria_id')) {
            $query->whereHas('assignment', function ($q) use ($request) {
                $q->where('criteria_id', $request->criteria_id);
            });
        }

        if ($request->filled('assessor_id')) {
            $query->whereHas('assignment', function ($q) use ($request) {
                $q->where('assessor_id', $request->assessor_id);
            });
        }

        if ($request->filled('year')) {
            $query->whereHas('assignment', function ($q) use ($request) {
                $q->whereYear('created_at', $request->year);
            });
        }

        $evaluations = $query->get();

        // Summary statistics
        $summary = [
            'total_evaluations' => $evaluations->count(),
            'average_score' => $evaluations->avg('score') ?? 0,
            'max_score' => $evaluations->max('score') ?? 0,
            'min_score' => $evaluations->min('score') ?? 0,
        ];

        // Per criteria statistics
        $perCriteria = $evaluations->groupBy(function ($eval) {
            return $eval->assignment->criterion->id;
        })->map(function ($group, $criteriaId) {
            $criterion = $group->first()->assignment->criterion;

            return [
                'criteria_id' => $criteriaId,
                'criteria_name' => $criterion->name,
                'total_evaluations' => $group->count(),
                'average_score' => $group->avg('score') ?? 0,
                'max_score' => $group->max('score') ?? 0,
            ];
        })->values();

        // Per assessor statistics
        $perAssessor = $evaluations->groupBy(function ($eval) {
            return $eval->assignment->assessor_id;
        })->map(function ($group, $assessorId) {
            $assessor = $group->first()->assignment->assessor;

            return [
                'assessor_id' => $assessorId,
                'assessor_name' => $assessor?->name ?? 'N/A',
                'total_evaluations' => $group->count(),
                'average_score' => $group->avg('score') ?? 0,
            ];
        })->values();

        // Chart data
        $scoreDistribution = $this->getScoreDistribution($evaluations);
        $progressPerCriteria = $perCriteria->toArray();
        $timelineEvaluations = $this->getTimelineEvaluations($evaluations);

        return Inertia::render('Dashboard/CoordinatorProdi/Statistics/Assessment', [
            'summary' => $summary,
            'perCriteria' => $perCriteria,
            'perAssessor' => $perAssessor,
            'scoreDistribution' => $scoreDistribution,
            'progressPerCriteria' => $progressPerCriteria,
            'timelineEvaluations' => $timelineEvaluations,
            'programs' => $user->accessiblePrograms()->get(['id', 'name']),
            'filters' => $request->only(['program_id', 'criteria_id', 'assessor_id', 'year']),
        ]);
    }

    /**
     * Display simulation results.
     */
    public function simulation(Request $request): Response
    {
        $user = $this->getUser();
        $programs = $user->accessiblePrograms()->get(['id', 'name']);

        // If no program_id provided, use first accessible program or show selection
        if (!$request->filled('program_id')) {
            if ($programs->isEmpty()) {
                return Inertia::render('Dashboard/CoordinatorProdi/Simulation/Index', [
                    'simulationData' => [
                        'program_id' => '',
                        'program_name' => '',
                        'year' => Carbon::now()->year,
                        'standards' => [],
                        'total_score' => 0,
                        'max_possible_score' => 0,
                        'total_percentage' => 0,
                        'grade' => '',
                    ],
                    'programs' => [],
                ]);
            }
            $program = $programs->first();
        } else {
            $request->validate([
                'program_id' => ['required', 'string', 'exists:programs,id'],
            ]);
            $program = $user->accessiblePrograms()->findOrFail($request->program_id);
        }

        $request->validate([
            'year' => ['nullable', 'integer', 'min:2020', 'max:2030'],
        ]);

        $programId = $program->id;
        $year = $request->year ?? Carbon::now()->year;

        $program->load([
            'standards.criteria.criteriaPoints',
            'akreditasiTargets' => function ($q) use ($year) {
                $q->where('year', $year);
            },
        ]);

        $simulationData = [
            'program_id' => $program->id,
            'program_name' => $program->name,
            'year' => $year,
            'standards' => [],
            'total_score' => 0,
            'max_possible_score' => 0,
        ];

        foreach ($program->standards as $standard) {
            $standardData = [
                'standard_id' => $standard->id,
                'standard_name' => $standard->name,
                'weight' => $standard->weight,
                'criteria' => [],
                'simulated_score' => 0,
                'max_score' => 0,
            ];

            foreach ($standard->criteria as $criterion) {
                $criteriaData = [
                    'criteria_id' => $criterion->id,
                    'criteria_name' => $criterion->name,
                    'weight' => $criterion->weight,
                    'criteria_points' => [],
                    'simulated_score' => 0,
                    'max_score' => 0,
                    'based_on' => 'default',
                ];

                $maxScore = $criterion->criteriaPoints->sum('max_score') ?? 0;
                $criteriaData['max_score'] = $maxScore;

                // Check if there are evaluations
                $evaluations = Evaluation::whereHas('assignment', function ($q) use ($criterion, $user) {
                    $q->where('criteria_id', $criterion->id)
                        ->where('prodi_id', $user->prodi_id);
                })->get();

                if ($evaluations->isNotEmpty()) {
                    // Use average score from evaluations
                    $avgScore = $evaluations->avg('score') ?? 0;
                    $criteriaData['simulated_score'] = $avgScore;
                    $criteriaData['based_on'] = 'evaluations';
                } else {
                    // Check document completeness
                    $documentsCount = Document::where('prodi_id', $user->prodi_id)
                        ->where('program_id', $programId)
                        ->where('year', $year)
                        ->whereHas('assignment', function ($q) use ($criterion) {
                            $q->where('criteria_id', $criterion->id);
                        })
                        ->whereNotNull('validated_at')
                        ->count();

                    if ($documentsCount > 0) {
                        // Documents complete, use 80% of max score
                        $criteriaData['simulated_score'] = $maxScore * 0.8;
                        $criteriaData['based_on'] = 'document_completeness';
                    } else {
                        $criteriaData['simulated_score'] = 0;
                        $criteriaData['based_on'] = 'default';
                    }
                }

                // Calculate percentage for criteria
                $criteriaData['percentage'] = $maxScore > 0
                    ? round(($criteriaData['simulated_score'] / $maxScore) * 100, 2)
                    : 0;

                // Calculate weighted score for this criteria
                $weightedScore = $maxScore > 0 ? ($criteriaData['simulated_score'] / $maxScore) * $criterion->weight : 0;
                $standardData['simulated_score'] += $weightedScore;
                $standardData['max_score'] += $criterion->weight;

                $standardData['criteria'][] = $criteriaData;
            }

            // Calculate percentage for standard
            $standardData['percentage'] = $standardData['max_score'] > 0
                ? round(($standardData['simulated_score'] / $standardData['max_score']) * 100, 2)
                : 0;

            $simulationData['standards'][] = $standardData;
            $simulationData['total_score'] += $standardData['simulated_score'];
            $simulationData['max_possible_score'] += $standardData['max_score'];
        }

        // Calculate total percentage and grade
        $simulationData['total_percentage'] = $simulationData['max_possible_score'] > 0
            ? round(($simulationData['total_score'] / $simulationData['max_possible_score']) * 100, 2)
            : 0;

        $simulationData['grade'] = $this->calculateGrade($simulationData['total_score']);

        // Compare with target
        $target = $program->akreditasiTargets->first();
        if ($target) {
            $simulationData['target'] = [
                'target_score' => $target->target_score,
                'target_grade' => $target->target_grade,
                'gap_score' => $simulationData['total_score'] - $target->target_score,
                'gap_percentage' => $simulationData['total_percentage'] - (($target->target_score / $simulationData['max_possible_score']) * 100),
            ];
        }

        return Inertia::render('Dashboard/CoordinatorProdi/Simulation/Index', [
            'simulationData' => $simulationData,
            'programs' => $user->accessiblePrograms()->get(['id', 'name']),
        ]);
    }

    /**
     * Display a listing of criteria points.
     */
    public function criteriaPoints(Request $request): Response
    {
        $filters = [
            'criteria_id' => $request->get('criteria_id'),
            'search' => $request->get('search'),
        ];

        $query = CriteriaPoint::query()
            ->with(['criterion.standard.program']);

        if ($filters['criteria_id']) {
            $query->where('criteria_id', $filters['criteria_id']);
        }

        if ($filters['search']) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        $criteriaPoints = $query->orderBy('order_index')->orderBy('id')->paginate(15);

        // Get all criteria for filter dropdown
        $criteria = Criterion::with(['standard.program'])
            ->orderBy('order_index')
            ->get()
            ->map(function ($criterion) {
                return [
                    'id' => $criterion->id,
                    'name' => $criterion->name,
                    'standard' => $criterion->standard?->name ?? 'N/A',
                    'standard_id' => $criterion->standard?->id ?? null,
                    'program' => $criterion->standard?->program?->name ?? 'N/A',
                    'program_id' => $criterion->standard?->program?->id ?? null,
                    'program_base_scale' => $criterion->standard?->program?->criteria_points_base_scale ?? 400,
                ];
            });

        return Inertia::render('Dashboard/CoordinatorProdi/CriteriaPoints/Index', [
            'criteriaPoints' => $criteriaPoints,
            'criteria' => $criteria,
            'filters' => $filters,
        ]);
    }

    /**
     * Display a listing of criteria for a program/standard.
     */
    public function criteria(Request $request): Response
    {
        $user = $this->getUser();

        $programId = $request->get('program_id');
        $standardId = $request->get('standard_id');

        $query = Criterion::query()->with(['standard.program']);

        if ($programId) {
            $query->whereHas('standard', function ($q) use ($programId) {
                $q->where('program_id', $programId);
            });
        }

        if ($standardId) {
            $query->where('standard_id', $standardId);
        }

        $criteria = $query->orderBy('order_index')->paginate(15)->withQueryString();

        $programs = $user->accessiblePrograms()->get(['id', 'name']);

        return Inertia::render('Dashboard/CoordinatorProdi/Criteria/Index', [
            'criteria' => $criteria,
            'programs' => $programs,
            'filters' => $request->only(['program_id', 'standard_id']),
        ]);
    }

    /**
     * Show form to create a new criterion.
     */
    public function createCriterion(Request $request): Response
    {
        $programId = $request->get('program_id');

        $standards = Standard::query()
            ->when($programId, function ($q) use ($programId) {
                $q->where('program_id', $programId);
            })
            ->get(['id', 'name', 'program_id']);

        $programs = Program::get(['id', 'name']);

        return Inertia::render('Dashboard/CoordinatorProdi/Criteria/Create', [
            'standards' => $standards,
            'programs' => $programs,
            'selectedProgramId' => $programId,
        ]);
    }

    /**
     * Store a new criterion.
     */
    public function storeCriterion(StoreCriterionRequest $request): RedirectResponse
    {
        $standardId = $request->standard_id;
        $program = null;
        if (!$standardId) {
            $user = $this->getUser();
            $program = $user->accessiblePrograms()->findOrFail($request->program_id);
            $nextOrder = (Standard::where('program_id', $program->id)->max('order_index') ?? 0) + 1;
            $defaultStandard = Standard::firstOrCreate(
                ['program_id' => $program->id, 'name' => 'Standar Default'],
                ['description' => null, 'weight' => 0, 'order_index' => $nextOrder]
            );
            $standardId = $defaultStandard->id;
        } else {
            $standard = Standard::findOrFail($standardId);
            $program = Program::find($standard->program_id);
        }

        if ($program && $request->filled('lam_name')) {
            $program->update(['lam_name' => $request->lam_name]);
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'entity_type' => Program::class,
                'entity_id' => (string) $program->id,
                'description' => "Memperbarui nama LAM: {$request->lam_name}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        $criterion = Criterion::create([
            'standard_id' => $standardId,
            'name' => $request->name,
            'description' => $request->description,
            'weight' => $request->weight ?? 0,
            'order_index' => $request->order_index,
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'create',
            'entity_type' => Criterion::class,
            'entity_id' => (string) $criterion->id,
            'description' => "Membuat kriteria: {$criterion->name}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('coordinator-prodi.standards')
            ->with('success', 'Kriteria berhasil dibuat.');
    }

    /**
     * Show form to edit an existing criterion.
     */
    public function editCriterion(string $id): Response
    {
        $criterion = Criterion::with('standard.program')->findOrFail($id);
        $standards = Standard::get(['id', 'name', 'program_id']);
        $programs = Program::get(['id', 'name']);

        return Inertia::render('Dashboard/CoordinatorProdi/Criteria/Edit', [
            'criterion' => $criterion,
            'standards' => $standards,
            'programs' => $programs,
        ]);
    }

    /**
     * Update an existing criterion.
     */
    public function updateCriterion(UpdateCriterionRequest $request, string $id): RedirectResponse
    {
        $criterion = Criterion::findOrFail($id);

        $criterion->update($request->only(['standard_id', 'name', 'description', 'weight', 'order_index']));

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'update',
            'entity_type' => Criterion::class,
            'entity_id' => (string) $criterion->id,
            'description' => "Memperbarui kriteria: {$criterion->name}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('coordinator-prodi.standards')
            ->with('success', 'Kriteria berhasil diperbarui.');
    }

    /**
     * Delete a criterion.
     */
    public function destroyCriterion(string $id): RedirectResponse
    {
        $criterion = Criterion::findOrFail($id);

        $criterion->delete();

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'delete',
            'entity_type' => Criterion::class,
            'entity_id' => (string) $criterion->id,
            'description' => "Menghapus kriteria: {$criterion->name}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('coordinator-prodi.standards')
            ->with('success', 'Kriteria berhasil dihapus.');
    }

    /**
     * Show form to request assessor assignment.
     */
    public function createAssessorRequest(Request $request): Response
    {
        $user = $this->getUser();
        $programs = $user->accessiblePrograms()->get(['id', 'name']);
        $criteria = Criterion::with(['standard.program'])->get();
        $cycles = \App\Models\AccreditationCycle::where('prodi_id', $user->prodi_id)
            ->with([
                'lam:id,name,code',
                'prodi:id,name,fakultas_id',
                'prodi.fakultas:id,name',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cycle) {
                return [
                    'id' => $cycle->id,
                    'cycle_name' => $cycle->cycle_name,
                    'lam' => $cycle->lam ? [
                        'id' => $cycle->lam->id,
                        'name' => $cycle->lam->name,
                        'code' => $cycle->lam->code,
                    ] : null,
                    'prodi' => $cycle->prodi ? [
                        'id' => $cycle->prodi->id,
                        'name' => $cycle->prodi->name,
                    ] : null,
                    'fakultas' => $cycle->prodi && $cycle->prodi->fakultas ? [
                        'id' => $cycle->prodi->fakultas->id,
                        'name' => $cycle->prodi->fakultas->name,
                    ] : null,
                ];
            });

        return Inertia::render('Dashboard/CoordinatorProdi/AssessorRequests/Create', [
            'programs' => $programs,
            'criteria' => $criteria,
            'cycles' => $cycles,
        ]);
    }

    /**
     * Store assessor assignment request.
     */
    public function storeAssessorRequest(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'criteria_id' => ['required', 'integer', 'exists:criteria,id'],
            'scope_category' => ['nullable', 'string', 'max:255'],
            'preferred_assessor_email' => ['nullable', 'email'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $this->getUser();

        $assessorRequest = AssessorAssignmentRequest::create([
            'prodi_id' => $user->prodi_id,
            'criteria_id' => $validated['criteria_id'],
            'scope_category' => $validated['scope_category'] ?? null,
            'preferred_assessor_email' => $validated['preferred_assessor_email'] ?? null,
            'requested_by' => $user->id,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        $admins = \App\Models\User::whereHas('roles', function ($q) {
            $q->where('name', 'Admin LPMPP');
        })->get();

        foreach ($admins as $admin) {
            $this->notificationService->sendToUser(
                $admin,
                NotificationType::PolicyUpdate,
                'Permintaan Penunjukan Asesor',
                'Koordinator Prodi mengajukan penunjukan asesor untuk kriteria atau LKPS.',
                [
                    'assessor_request_id' => $assessorRequest->id,
                    'criteria_id' => $assessorRequest->criteria_id,
                    'scope_category' => $assessorRequest->scope_category,
                    'preferred_assessor_email' => $assessorRequest->preferred_assessor_email,
                    'prodi_id' => $assessorRequest->prodi_id,
                ]
            );
        }

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'create',
            'entity_type' => AssessorAssignmentRequest::class,
            'entity_id' => (string) $assessorRequest->id,
            'description' => 'Mengajukan permintaan penunjukan asesor',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Permintaan penunjukan asesor dikirim ke Admin LPMPP.');
    }

    /**
     * Show the form for creating a new criteria point.
     */
    public function createCriteriaPoint(Request $request): Response
    {
        $criteria = Criterion::with(['standard.program'])
            ->orderBy('order_index')
            ->get()
            ->map(function ($criterion) {
                return [
                    'id' => $criterion->id,
                    'name' => $criterion->name,
                    'standard' => $criterion->standard?->name ?? 'N/A',
                    'program' => $criterion->standard?->program?->name ?? 'N/A',
                ];
            });

        return Inertia::render('Dashboard/CoordinatorProdi/CriteriaPoints/Create', [
            'criteria' => $criteria,
            'selectedCriteriaId' => $request->get('criteria_id'),
        ]);
    }

    /**
     * Store a newly created criteria point.
     */
    public function storeCriteriaPoint(StoreCriteriaPointRequest $request): RedirectResponse
    {
        $rubrics = [];
        foreach ([4, 3, 2, 1] as $score) {
            $key = 'rubric_' . $score;
            if ($request->filled($key)) {
                $rubrics[] = [
                    'score' => $score,
                    'description' => $request->get($key),
                ];
            }
        }

        $criteriaPoint = CriteriaPoint::create([
            'criteria_id' => $request->criteria_id,
            'title' => $request->title,
            'description' => $request->description,
            'max_score' => $request->max_score,
            'order_index' => $request->order_index,
            'rubrics' => !empty($rubrics) ? $rubrics : null,
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'create',
            'entity_type' => CriteriaPoint::class,
            'entity_id' => (string) $criteriaPoint->id,
            'description' => "Membuat poin kriteria: {$criteriaPoint->title}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);

        if ($request->get('return_to') === 'standards' && $request->filled('program_id')) {
            return redirect()->route('coordinator-prodi.standards', ['program_id' => $request->get('program_id')])
                ->with('success', 'Poin kriteria berhasil dibuat.');
        }

        return redirect('/coordinator-prodi/criteria-points')->with('success', 'Poin kriteria berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified criteria point.
     */
    public function editCriteriaPoint(int $id): Response
    {
        $criteriaPoint = CriteriaPoint::with(['criterion.standard.program'])->findOrFail($id);

        $criteria = Criterion::with(['standard.program'])
            ->orderBy('order_index')
            ->get()
            ->map(function ($criterion) {
                return [
                    'id' => $criterion->id,
                    'name' => $criterion->name,
                    'standard' => $criterion->standard?->name ?? 'N/A',
                    'program' => $criterion->standard?->program?->name ?? 'N/A',
                ];
            });

        return Inertia::render('Dashboard/CoordinatorProdi/CriteriaPoints/Edit', [
            'criteriaPoint' => [
                'id' => $criteriaPoint->id,
                'criteria_id' => $criteriaPoint->criteria_id,
                'title' => $criteriaPoint->title,
                'description' => $criteriaPoint->description,
                'max_score' => $criteriaPoint->max_score,
                'order_index' => $criteriaPoint->order_index,
                'rubrics' => $criteriaPoint->rubrics,
                'criterion' => [
                    'name' => $criteriaPoint->criterion?->name ?? 'N/A',
                    'standard' => $criteriaPoint->criterion?->standard?->name ?? 'N/A',
                    'program' => $criteriaPoint->criterion?->standard?->program?->name ?? 'N/A',
                ],
            ],
            'criteria' => $criteria,
        ]);
    }

    /**
     * Update the specified criteria point.
     */
    public function updateCriteriaPoint(UpdateCriteriaPointRequest $request, int $id): RedirectResponse
    {
        $criteriaPoint = CriteriaPoint::findOrFail($id);

        $rubrics = [];
        foreach ([4, 3, 2, 1] as $score) {
            $key = 'rubric_' . $score;
            if ($request->filled($key)) {
                $rubrics[] = [
                    'score' => $score,
                    'description' => $request->get($key),
                ];
            }
        }

        $criteriaPoint->update([
            'criteria_id' => $request->criteria_id,
            'title' => $request->title,
            'description' => $request->description,
            'max_score' => $request->max_score,
            'order_index' => $request->order_index,
            'rubrics' => !empty($rubrics) ? $rubrics : null,
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'update',
            'entity_type' => CriteriaPoint::class,
            'entity_id' => (string) $criteriaPoint->id,
            'description' => "Memperbarui poin kriteria: {$criteriaPoint->title}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);

        return redirect('/coordinator-prodi/criteria-points')
            ->with('success', 'Poin kriteria berhasil diperbarui.');
    }

    /**
     * Remove the specified criteria point.
     */
    public function destroyCriteriaPoint(int $id): RedirectResponse
    {
        $criteriaPoint = CriteriaPoint::findOrFail($id);
        $title = $criteriaPoint->title;

        // Check if criteria point has evaluations
        if ($criteriaPoint->evaluations()->count() > 0) {
            return redirect('/coordinator-prodi/criteria-points')
                ->with('error', 'Poin kriteria tidak dapat dihapus karena sudah memiliki penilaian.');
        }

        $criteriaPoint->delete();

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'delete',
            'entity_type' => CriteriaPoint::class,
            'entity_id' => (string) $id,
            'description' => "Menghapus poin kriteria: {$title}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);

        return redirect('/coordinator-prodi/criteria-points')
            ->with('success', 'Poin kriteria berhasil dihapus.');
    }

    /**
     * Display standards (read-only).
     */
    public function standards(Request $request): Response
    {
        $user = $this->getUser();
        $programs = $user->accessiblePrograms()->get();

        // If no program_id provided, use first accessible program or show selection
        if (!$request->filled('program_id')) {
            if ($programs->isEmpty()) {
                return Inertia::render('Dashboard/CoordinatorProdi/Standards/Index', [
                    'program' => null,
                    'programs' => [],
                ]);
            }
            $program = $programs->first();
        } else {
            $request->validate([
                'program_id' => ['required', 'string', 'exists:programs,id'],
            ]);
            $program = $user->accessiblePrograms()->findOrFail($request->program_id);
        }

        $programId = $program->id;

        $program->load(['standards.criteria.criteriaPoints']);

        return Inertia::render('Dashboard/CoordinatorProdi/Standards/Index', [
            'program' => $program,
            'programs' => $programs,
        ]);
    }

    public function storeStandard(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'program_id' => ['required', 'string', 'exists:programs,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'weight' => ['required', 'numeric', 'min:0'],
            'order_index' => ['required', 'integer', 'min:1'],
        ]);

        $standard = Standard::create([
            'program_id' => $validated['program_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'weight' => $validated['weight'],
            'order_index' => $validated['order_index'],
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'create',
            'entity_type' => Standard::class,
            'entity_id' => (string) $standard->id,
            'description' => "Membuat standar: {$standard->name}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('coordinator-prodi.standards', ['program_id' => $validated['program_id']])
            ->with('success', 'Standar berhasil dibuat.');
    }

    public function storeProgram(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'jenjang' => ['required', 'string', 'max:10'],
            'fakultas' => ['required', 'string', 'max:255'],
        ]);

        $program = Program::create([
            'name' => $validated['name'],
            'jenjang' => $validated['jenjang'],
            'fakultas' => $validated['fakultas'],
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'create',
            'entity_type' => Program::class,
            'entity_id' => (string) $program->id,
            'description' => "Membuat program studi: {$program->name}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('coordinator-prodi.standards', ['program_id' => $program->id])
            ->with('success', 'Program studi berhasil dibuat.');
    }

    public function updateCriteriaPointsBaseScale(Request $request, int $id): RedirectResponse
    {
        $user = $this->getUser();
        $program = $user->accessiblePrograms()->findOrFail($id);

        $validated = $request->validate([
            'criteria_points_base_scale' => ['required', 'integer', 'min:1'],
        ]);

        $program->update([
            'criteria_points_base_scale' => $validated['criteria_points_base_scale'],
        ]);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'update',
            'entity_type' => Program::class,
            'entity_id' => (string) $program->id,
            'description' => "Memperbarui skala bobot kriteria poin: {$program->criteria_points_base_scale}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return back()->with('success', 'Skala bobot poin kriteria berhasil diperbarui.');
    }

    public function updateLamName(Request $request, int $id): RedirectResponse
    {
        $user = $this->getUser();
        $program = $user->accessiblePrograms()->findOrFail($id);

        $validated = $request->validate([
            'lam_name' => ['required', 'string', 'max:255'],
        ]);

        $name = trim($validated['lam_name']);
        $program->update(['lam_name' => $name]);

        $prodi = $user->prodi;
        $inputNormalized = preg_replace('/[\s\-_]+/', '', mb_strtolower($name));
        $lam = \App\Models\LAM::where('is_active', true)->get()->first(function ($l) use ($name, $inputNormalized) {
            $nNormalized = preg_replace('/[\s\-_]+/', '', mb_strtolower($l->name));
            $cNormalized = preg_replace('/[\s\-_]+/', '', mb_strtolower($l->code));
            if (strcasecmp($l->name, $name) === 0 || strcasecmp($l->code, $name) === 0) {
                return true;
            }
            return $nNormalized === $inputNormalized || $cNormalized === $inputNormalized;
        });
        if ($prodi && $lam) {
            $prodi->update(['lam_id' => $lam->id]);
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => 'update',
                'entity_type' => \App\Models\Prodi::class,
                'entity_id' => (string) $prodi->id,
                'description' => "Mengaitkan prodi dengan LAM: {$lam->code} - {$lam->name}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        }

        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => 'update',
            'entity_type' => Program::class,
            'entity_id' => (string) $program->id,
            'description' => "Memperbarui nama LAM: {$program->lam_name}",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->route('coordinator-prodi.standards', ['program_id' => $program->id])
            ->with('success', 'Nama LAM berhasil diperbarui.');
    }

    /**
     * Display score recap.
     */
    public function scoreRecap(Request $request): Response
    {
        $user = $this->getUser();
        $programs = $user->accessiblePrograms()->get(['id', 'name']);

        // If no program_id provided, use first accessible program or show selection
        if (!$request->filled('program_id')) {
            if ($programs->isEmpty()) {
                return $this->renderEmptyScoreRecap();
            }
            $program = $programs->first();
        } else {
            $request->validate([
                'program_id' => ['required', 'string', 'exists:programs,id'],
            ]);
            $program = $user->accessiblePrograms()->findOrFail($request->program_id);
        }

        $request->validate([
            'year' => ['nullable', 'integer', 'min:2020', 'max:2030'],
            'standard_id' => ['nullable', 'string', 'exists:standards,id'],
        ]);

        $year = (int) ($request->year ?? Carbon::now()->year);
        $program->load(['standards.criteria.criteriaPoints']);

        $recapData = $this->buildScoreRecapData($program, $user->prodi_id, $year);
        $chartData = $this->buildScoreRecapChartData($recapData);

        return Inertia::render('Dashboard/CoordinatorProdi/ScoreRecap/Index', [
            'recapData' => $recapData,
            'scorePerCriteria' => $chartData['scorePerCriteria'],
            'scorePerStandard' => $chartData['scorePerStandard'],
            'programs' => $user->accessiblePrograms()->get(['id', 'name']),
            'filters' => $request->only(['program_id', 'year', 'standard_id']),
        ]);
    }

    /**
     * Render empty score recap page.
     */
    private function renderEmptyScoreRecap(): Response
    {
        return Inertia::render('Dashboard/CoordinatorProdi/ScoreRecap/Index', [
            'recapData' => [
                'program_id' => '',
                'program_name' => '',
                'year' => Carbon::now()->year,
                'standards' => [],
                'total_score' => 0,
                'max_possible_score' => 0,
                'total_percentage' => 0,
                'grade' => '',
            ],
            'scorePerCriteria' => [],
            'scorePerStandard' => [],
            'programs' => [],
            'filters' => [],
        ]);
    }

    /**
     * Build score recap data for a program.
     *
     * @return array<string, mixed>
     */
    private function buildScoreRecapData(Program $program, string $prodiId, int $year): array
    {
        $recapData = [
            'program_id' => $program->id,
            'program_name' => $program->name,
            'year' => $year,
            'standards' => [],
            'total_score' => 0.0,
            'max_possible_score' => 0.0,
        ];

        foreach ($program->standards as $standard) {
            $standardData = $this->buildStandardScoreRecapData($standard, $prodiId, $year);
            $recapData['standards'][] = $standardData;
            $recapData['total_score'] += $standardData['total_score'];
            $recapData['max_possible_score'] += $standardData['max_score'];
        }

        $recapData['total_percentage'] = $recapData['max_possible_score'] > 0
            ? round(($recapData['total_score'] / $recapData['max_possible_score']) * 100, 2)
            : 0.0;

        $recapData['grade'] = $this->calculateGrade($recapData['total_score']);

        return $recapData;
    }

    /**
     * Build score recap data for a standard.
     *
     * @return array<string, mixed>
     */
    private function buildStandardScoreRecapData(Standard $standard, string $prodiId, int $year): array
    {
        $standardData = [
            'standard_id' => $standard->id,
            'standard_name' => $standard->name,
            'weight' => $standard->weight,
            'criteria' => [],
            'total_score' => 0.0,
            'max_score' => 0.0,
        ];

        foreach ($standard->criteria as $criterion) {
            $criteriaData = $this->buildCriterionScoreRecapData($criterion, $prodiId, $year);
            $standardData['criteria'][] = $criteriaData;

            $weightedScore = $criteriaData['max_score'] > 0
                ? ($criteriaData['score'] / $criteriaData['max_score']) * $criterion->weight
                : 0.0;

            $standardData['total_score'] += $weightedScore;
            $standardData['max_score'] += $criterion->weight;
        }

        $standardData['percentage'] = $standardData['max_score'] > 0
            ? round(($standardData['total_score'] / $standardData['max_score']) * 100, 2)
            : 0.0;

        return $standardData;
    }

    /**
     * Build score recap data for a criterion.
     *
     * @return array<string, mixed>
     */
    private function buildCriterionScoreRecapData(Criterion $criterion, string $prodiId, int $year): array
    {
        $maxScore = (float) ($criterion->criteriaPoints->sum('max_score') ?? 0);

        $evaluations = Evaluation::whereHas('assignment', function ($q) use ($criterion, $prodiId, $year) {
            $q->where('criteria_id', $criterion->id)
                ->where('prodi_id', $prodiId)
                ->whereYear('created_at', $year);
        })->get();

        $score = $evaluations->isNotEmpty() ? (float) $evaluations->avg('score') : 0.0;
        $lastEvaluation = $evaluations->isNotEmpty() ? $evaluations->latest('created_at')->first() : null;

        return [
            'criteria_id' => $criterion->id,
            'criteria_name' => $criterion->name,
            'weight' => $criterion->weight,
            'score' => round($score, 2),
            'max_score' => $maxScore,
            'percentage' => $maxScore > 0 ? round(($score / $maxScore) * 100, 2) : 0.0,
            'evaluations_count' => $evaluations->count(),
            'last_evaluation_date' => $lastEvaluation?->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Build chart data for score recap.
     *
     * @param  array<string, mixed>  $recapData
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function buildScoreRecapChartData(array $recapData): array
    {
        $scorePerCriteria = collect($recapData['standards'])
            ->flatMap(fn($std) => $std['criteria'])
            ->map(fn($crit) => [
                'name' => $crit['criteria_name'],
                'score' => $crit['score'],
                'max_score' => $crit['max_score'],
            ])
            ->values()
            ->toArray();

        $scorePerStandard = collect($recapData['standards'])
            ->map(fn($std) => [
                'name' => $std['standard_name'],
                'score' => $std['total_score'],
                'max_score' => $std['max_score'],
            ])
            ->values()
            ->toArray();

        return [
            'scorePerCriteria' => $scorePerCriteria,
            'scorePerStandard' => $scorePerStandard,
        ];
    }

    /**
     * Get targets.
     */
    public function getTargets(Request $request): Response
    {
        $user = $this->getUser();
        $programs = $user->accessiblePrograms()->get();

        $targets = AkreditasiTarget::whereIn('program_id', $programs->pluck('id'))
            ->with('program')
            ->orderBy('year', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard/CoordinatorProdi/Targets/Index', [
            'targets' => $targets,
            'programs' => $programs,
        ]);
    }

    /**
     * Show the form for creating a new target.
     */
    public function createTarget(Request $request): Response
    {
        $user = $this->getUser();
        $programs = $user->accessiblePrograms()->get(['id', 'name']);

        return Inertia::render('Dashboard/CoordinatorProdi/Targets/Create', [
            'programs' => $programs,
        ]);
    }

    /**
     * Set target.
     */
    public function setTarget(SetTargetRequest $request): RedirectResponse
    {
        $user = $this->getUser();

        // Verify program is accessible
        $program = $user->accessiblePrograms()->findOrFail($request->program_id);

        // Check if target already exists for this program and year
        $existingTarget = AkreditasiTarget::where('program_id', $request->program_id)
            ->where('year', $request->year)
            ->first();

        if ($existingTarget) {
            $existingTarget->update([
                'target_score' => $request->target_score,
                'target_grade' => $request->target_grade,
            ]);
        } else {
            AkreditasiTarget::create([
                'program_id' => $request->program_id,
                'year' => $request->year,
                'target_score' => $request->target_score,
                'target_grade' => $request->target_grade,
            ]);
        }

        return redirect()->route('coordinator-prodi.targets.index')
            ->with('success', 'Target akreditasi berhasil disimpan.');
    }

    /**
     * Update target.
     */
    public function updateTarget(SetTargetRequest $request, string $id): RedirectResponse
    {
        $user = $this->getUser();
        $target = AkreditasiTarget::findOrFail($id);

        // Verify program is accessible
        $user->accessiblePrograms()->findOrFail($target->program_id);

        $target->update([
            'target_score' => $request->target_score,
            'target_grade' => $request->target_grade,
        ]);

        return redirect()->route('coordinator-prodi.targets.index')
            ->with('success', 'Target akreditasi berhasil diperbarui.');
    }

    /**
     * Delete target.
     */
    public function deleteTarget(string $id): RedirectResponse
    {
        $user = $this->getUser();
        $target = AkreditasiTarget::findOrFail($id);

        // Verify program is accessible
        $user->accessiblePrograms()->findOrFail($target->program_id);

        $target->delete();

        return redirect()->route('coordinator-prodi.targets.index')
            ->with('success', 'Target akreditasi berhasil dihapus.');
    }

    /**
     * Calculate score recap.
     */
    private function calculateScoreRecap($user, int $year): array
    {
        $programs = $user->accessiblePrograms()->with(['standards.criteria'])->get();

        $totalScore = 0;
        $maxPossibleScore = 0;

        foreach ($programs as $program) {
            foreach ($program->standards as $standard) {
                foreach ($standard->criteria as $criterion) {
                    $maxScore = $criterion->criteriaPoints->sum('max_score') ?? 0;
                    $maxPossibleScore += $maxScore;

                    $evaluations = Evaluation::whereHas('assignment', function ($q) use ($criterion, $user) {
                        $q->where('criteria_id', $criterion->id)
                            ->where('prodi_id', $user->prodi_id);
                    })->get();

                    if ($evaluations->isNotEmpty()) {
                        $totalScore += $evaluations->avg('score') ?? 0;
                    }
                }
            }
        }

        return [
            'total_score' => round($totalScore, 2),
            'max_possible_score' => round($maxPossibleScore, 2),
            'percentage' => $maxPossibleScore > 0 ? round(($totalScore / $maxPossibleScore) * 100, 2) : 0,
        ];
    }

    /**
     * Get progress chart data.
     */
    private function getProgressChartData($user, int $year): array
    {
        $data = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayStart = $date->copy()->startOfDay();
            $dayEnd = $date->copy()->endOfDay();

            $documentsCount = Document::where('prodi_id', $user->prodi_id)
                ->where('year', $year)
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->count();

            $data[] = [
                'date' => $date->format('d M'),
                'count' => $documentsCount,
            ];
        }

        return $data;
    }

    /**
     * Get score distribution.
     */
    private function getScoreDistribution($evaluations): array
    {
        $ranges = [
            '0-20' => 0,
            '21-40' => 0,
            '41-60' => 0,
            '61-80' => 0,
            '81-100' => 0,
        ];

        foreach ($evaluations as $eval) {
            $score = $eval->score;
            if ($score <= 20) {
                $ranges['0-20']++;
            } elseif ($score <= 40) {
                $ranges['21-40']++;
            } elseif ($score <= 60) {
                $ranges['41-60']++;
            } elseif ($score <= 80) {
                $ranges['61-80']++;
            } else {
                $ranges['81-100']++;
            }
        }

        return $ranges;
    }

    /**
     * Get timeline evaluations.
     */
    private function getTimelineEvaluations($evaluations): array
    {
        return $evaluations->groupBy(function ($eval) {
            return $eval->created_at->format('Y-m-d');
        })->map(function ($group, $date) {
            return [
                'date' => $date,
                'count' => $group->count(),
                'average_score' => round($group->avg('score') ?? 0, 2),
            ];
        })->values()->toArray();
    }

    /**
     * Calculate grade based on score.
     */
    private function calculateGrade(float $score): string
    {
        return match (true) {
            $score >= 361 => 'Unggul',
            $score >= 301 => 'Sangat Baik',
            $score >= 201 => 'Baik',
            default => 'Kurang',
        };
    }

    /**
     * Display accreditation cycles page.
     * Redirects to simulation page with cycles tab.
     */
    public function accreditationCycles(Request $request): Response|RedirectResponse
    {
        return redirect()->route('coordinator-prodi.accreditation.simulation');
    }

    /**
     * Store a new accreditation cycle.
     */
    public function storeAccreditationCycle(Request $request): RedirectResponse
    {
        $user = $this->getUser();
        $prodi = $user->prodi;

        if (!$prodi) {
            return redirect()->route('coordinator-prodi.index')
                ->with('error', 'Prodi tidak ditemukan');
        }

        $validated = $request->validate([
            'lam_id' => 'nullable|exists:lams,id',
            'cycle_name' => 'required|string|max:100',
            'start_date' => 'required|date',
            'target_submission_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $lamId = $validated['lam_id'] ?? $prodi->lam_id;
        if (!$lamId) {
            return redirect()->back()->with('error', 'LAM belum ditentukan untuk prodi ini');
        }

        $cycle = \App\Models\AccreditationCycle::create([
            'prodi_id' => $prodi->id,
            'lam_id' => $lamId,
            'cycle_name' => $validated['cycle_name'],
            'start_date' => $validated['start_date'],
            'target_submission_date' => $validated['target_submission_date'] ?? null,
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('coordinator-prodi.accreditation.simulation', $cycle->id)
            ->with('success', 'Siklus akreditasi berhasil dibuat');
    }

    /**
     * Display accreditation criteria and matrix page.
     */
    public function accreditationCriteria(Request $request, ?string $cycleId = null): Response|RedirectResponse
    {
        $user = $this->getUser();
        $prodi = $user->prodi;

        if (!$prodi) {
            return redirect()->route('coordinator-prodi.index')
                ->with('error', 'Prodi tidak ditemukan');
        }

        $cycle = null;
        if ($cycleId) {
            $cycle = \App\Models\AccreditationCycle::where('prodi_id', $prodi->id)
                ->with([
                    'lam' => function ($query) {
                        $query->with([
                            'standards' => function ($query) {
                                $query->orderBy('order_index');
                            },
                            'standards.elements' => function ($query) {
                                $query->orderBy('order_index');
                            },
                            'standards.elements.indicators' => function ($query) {
                                $query->orderBy('order_index');
                            },
                            'standards.elements.indicators.rubrics' => function ($query) {
                                $query->orderBy('score', 'desc');
                            },
                        ]);
                    },
                ])->find($cycleId);

            if (!$cycle) {
                return redirect()->route('coordinator-prodi.accreditation.cycles')
                    ->with('error', 'Siklus akreditasi tidak ditemukan atau tidak memiliki akses.');
            }
        } else {
            // Jika tidak ada cycleId, cari active cycle atau cycle terbaru
            $cycle = \App\Models\AccreditationCycle::where('prodi_id', $prodi->id)
                ->where('status', 'active')
                ->with([
                    'lam' => function ($query) {
                        $query->with([
                            'standards' => function ($query) {
                                $query->orderBy('order_index');
                            },
                            'standards.elements' => function ($query) {
                                $query->orderBy('order_index');
                            },
                            'standards.elements.indicators' => function ($query) {
                                $query->orderBy('order_index');
                            },
                            'standards.elements.indicators.rubrics' => function ($query) {
                                $query->orderBy('score', 'desc');
                            },
                        ]);
                    },
                ])
                ->first();

            // Jika tidak ada active cycle, ambil cycle terbaru
            if (!$cycle) {
                $cycle = \App\Models\AccreditationCycle::where('prodi_id', $prodi->id)
                    ->with([
                        'lam' => function ($query) {
                            $query->with([
                                'standards' => function ($query) {
                                    $query->orderBy('order_index');
                                },
                                'standards.elements' => function ($query) {
                                    $query->orderBy('order_index');
                                },
                                'standards.elements.indicators' => function ($query) {
                                    $query->orderBy('order_index');
                                },
                                'standards.elements.indicators.rubrics' => function ($query) {
                                    $query->orderBy('score', 'desc');
                                },
                            ]);
                        },
                    ])
                    ->orderBy('created_at', 'desc')
                    ->first();
            }
        }

        // Get indicator scores (jika cycle ada)
        $scores = [];
        if ($cycle) {
            $scores = \App\Models\ProdiIndicatorScore::where('accreditation_cycle_id', $cycle->id)
                ->get()
                ->keyBy('lam_indicator_id')
                ->map(function ($score) {
                    return [
                        'id' => $score->id,
                        'lam_indicator_id' => $score->lam_indicator_id,
                        'score' => $score->score,
                        'notes' => $score->notes,
                        'source' => $score->source,
                    ];
                })
                ->toArray();
        }

        // Format cycle data untuk frontend
        $cycleData = null;
        if ($cycle) {
            $cycleData = [
                'id' => $cycle->id,
                'cycle_name' => $cycle->cycle_name,
                'lam' => [
                    'id' => $cycle->lam->id,
                    'name' => $cycle->lam->name,
                    'standards' => $cycle->lam->standards->map(function ($standard) {
                        return [
                            'id' => $standard->id,
                            'code' => $standard->code,
                            'name' => $standard->name,
                            'description' => $standard->description,
                            'weight' => $standard->weight,
                            'elements' => $standard->elements->map(function ($element) {
                                return [
                                    'id' => $element->id,
                                    'code' => $element->code,
                                    'name' => $element->name,
                                    'description' => $element->description,
                                    'weight' => $element->weight,
                                    'indicators' => $element->indicators->map(function ($indicator) {
                                        return [
                                            'id' => $indicator->id,
                                            'code' => $indicator->code,
                                            'name' => $indicator->name,
                                            'description' => $indicator->description,
                                            'document_requirements' => $indicator->document_requirements,
                                            'weight' => $indicator->weight,
                                            'rubrics' => $indicator->rubrics->map(function ($rubric) {
                                                return [
                                                    'id' => $rubric->id,
                                                    'score' => $rubric->score,
                                                    'label' => $rubric->label,
                                                    'description' => $rubric->description,
                                                ];
                                            })->values()->all(),
                                        ];
                                    })->values()->all(),
                                ];
                            })->values()->all(),
                        ];
                    })->values()->all(),
                ],
            ];
        }

        // Redirect to simulation page with criteria tab
        if ($cycleId) {
            return redirect()->route('coordinator-prodi.accreditation.simulation', $cycleId);
        }

        return redirect()->route('coordinator-prodi.accreditation.simulation');
    }

    /**
     * Display accreditation simulation page.
     * This page now includes Cycles, Criteria, and Simulation features.
     */
    public function accreditationSimulation(Request $request, ?string $cycleId = null): Response|RedirectResponse
    {
        $user = $this->getUser();
        $prodi = $user->prodi;
        if ($prodi) {
            $prodi->load('lam:id,name,code');
        }

        if (!$prodi) {
            return redirect()->route('coordinator-prodi.index')
                ->with('error', 'Prodi tidak ditemukan');
        }

        // Get all cycles for Cycles tab
        $cycles = \App\Models\AccreditationCycle::where('prodi_id', $prodi->id)
            ->with('lam:id,name,code')
            ->orderBy('created_at', 'desc')
            ->get();

        $activeCycle = $cycles->firstWhere('status', 'active');
        $lams = \App\Models\LAM::where('is_active', true)->get(['id', 'name', 'code']);

        $programStandards = [];
        $program = $user->accessiblePrograms()->first();
        if ($program) {
            $program->load(['standards.criteria.criteriaPoints']);
            $programStandards = $program->standards->map(function ($std) {
                return [
                    'id' => $std->id,
                    'order_index' => $std->order_index,
                    'name' => $std->name,
                    'description' => $std->description,
                    'weight' => $std->weight,
                    'criteria' => $std->criteria->map(function ($crit) {
                        return [
                            'id' => $crit->id,
                            'order_index' => $crit->order_index,
                            'name' => $crit->name,
                            'description' => $crit->description,
                            'weight' => $crit->weight,
                            'criteriaPoints' => $crit->criteriaPoints->map(function ($cp) {
                                $rubrics = collect($cp->rubrics ?? [])->map(function ($r) {
                                    return [
                                        'score' => $r['score'] ?? null,
                                        'description' => $r['description'] ?? null,
                                    ];
                                })->values()->all();
                                return [
                                    'id' => $cp->id,
                                    'title' => $cp->title,
                                    'description' => $cp->description,
                                    'max_score' => $cp->max_score,
                                    'order_index' => $cp->order_index,
                                    'rubrics' => !empty($rubrics) ? $rubrics : null,
                                ];
                            })->values()->all(),
                        ];
                    })->values()->all(),
                ];
            })->values()->all();
        }

        // Get selected cycle
        $cycle = null;
        if ($cycleId) {
            $cycle = \App\Models\AccreditationCycle::where('prodi_id', $prodi->id)
                ->with('lam')
                ->find($cycleId);

            if (!$cycle) {
                return redirect()->route('coordinator-prodi.accreditation.simulation')
                    ->with('error', 'Siklus akreditasi tidak ditemukan atau tidak memiliki akses.');
            }
        } else {
            // Jika tidak ada cycleId, gunakan active cycle atau cycle terbaru
            $cycle = $activeCycle ?? $cycles->first();
        }

        // Get cycle data for Criteria tab (with LAM structure)
        $cycleData = null;
        $scores = [];
        if ($cycle) {
            $cycle->load([
                'lam' => function ($query) {
                    $query->with([
                        'standards' => function ($query) {
                            $query->orderBy('order_index');
                        },
                        'standards.elements' => function ($query) {
                            $query->orderBy('order_index');
                        },
                        'standards.elements.indicators' => function ($query) {
                            $query->orderBy('order_index');
                        },
                        'standards.elements.indicators.rubrics' => function ($query) {
                            $query->orderBy('score', 'desc');
                        },
                    ]);
                },
            ]);

            // Get indicator scores
            $scores = \App\Models\ProdiIndicatorScore::where('accreditation_cycle_id', $cycle->id)
                ->get()
                ->keyBy('lam_indicator_id')
                ->map(function ($score) {
                    return [
                        'id' => $score->id,
                        'lam_indicator_id' => $score->lam_indicator_id,
                        'score' => $score->score,
                        'notes' => $score->notes,
                        'source' => $score->source,
                    ];
                })
                ->toArray();

            // Format cycle data untuk frontend
            $cycleData = [
                'id' => $cycle->id,
                'cycle_name' => $cycle->cycle_name,
                'lam' => [
                    'id' => $cycle->lam->id,
                    'name' => $cycle->lam->name,
                    'standards' => $cycle->lam->standards->map(function ($standard) {
                        return [
                            'id' => $standard->id,
                            'code' => $standard->code,
                            'name' => $standard->name,
                            'description' => $standard->description,
                            'weight' => $standard->weight,
                            'elements' => $standard->elements->map(function ($element) {
                                return [
                                    'id' => $element->id,
                                    'code' => $element->code,
                                    'name' => $element->name,
                                    'description' => $element->description,
                                    'weight' => $element->weight,
                                    'indicators' => $element->indicators->map(function ($indicator) {
                                        return [
                                            'id' => $indicator->id,
                                            'code' => $indicator->code,
                                            'name' => $indicator->name,
                                            'description' => $indicator->description,
                                            'document_requirements' => $indicator->document_requirements,
                                            'weight' => $indicator->weight,
                                            'rubrics' => $indicator->rubrics->map(function ($rubric) {
                                                return [
                                                    'id' => $rubric->id,
                                                    'score' => $rubric->score,
                                                    'label' => $rubric->label,
                                                    'description' => $rubric->description,
                                                ];
                                            })->values()->all(),
                                        ];
                                    })->values()->all(),
                                ];
                            })->values()->all(),
                        ];
                    })->values()->all(),
                ],
            ];
        }

        // Get simulation history (jika cycle ada)
        $simulations = [];
        $currentScores = [];
        if ($cycle) {
            $simulations = \App\Models\AccreditationSimulation::where('accreditation_cycle_id', $cycle->id)
                ->with('creator:id,name')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($simulation) {
                    return [
                        'id' => $simulation->id,
                        'total_score' => $simulation->total_score,
                        'predicted_result' => $simulation->predicted_result,
                        'created_at' => $simulation->created_at,
                        'creator' => $simulation->creator ? [
                            'name' => $simulation->creator->name,
                        ] : null,
                    ];
                })
                ->toArray();

            // Get current scores
            $simulationService = app(\App\Services\SimulationService::class);
            $currentScores = $simulationService->getCurrentScores($cycle);
        }

        return Inertia::render('Dashboard/CoordinatorProdi/Accreditation/Simulation', [
            // Cycles tab data
            'cycles' => $cycles,
            'activeCycle' => $activeCycle,
            'lams' => $lams,
            'prodi' => $prodi,
            'programLamName' => $user->accessiblePrograms()->first()?->lam_name,
            'programStandards' => $programStandards,
            // Criteria tab data
            'cycleData' => $cycleData,
            'scores' => $scores,
            // Simulation tab data
            'cycle' => $cycle,
            'simulations' => $simulations,
            'currentScores' => $currentScores,
        ]);
    }

    /**
     * Display LKPS (Program Performance Report) page.
     */
    public function accreditationLKPS(Request $request, ?string $cycleId = null): Response|RedirectResponse
    {
        $user = $this->getUser();
        $prodi = $user->prodi;

        if (!$prodi) {
            return redirect()->route('coordinator-prodi.index')
                ->with('error', 'Prodi tidak ditemukan');
        }

        $cycle = null;
        if ($cycleId) {
            $cycle = \App\Models\AccreditationCycle::where('prodi_id', $prodi->id)
                ->with('lam')
                ->find($cycleId);

            if (!$cycle) {
                return redirect()->route('coordinator-prodi.accreditation.cycles')
                    ->with('error', 'Siklus akreditasi tidak ditemukan atau tidak memiliki akses.');
            }
        } else {
            // Jika tidak ada cycleId, cari active cycle atau cycle terbaru
            $cycle = \App\Models\AccreditationCycle::where('prodi_id', $prodi->id)
                ->where('status', 'active')
                ->with('lam')
                ->first();

            // Jika tidak ada active cycle, ambil cycle terbaru
            if (!$cycle) {
                $cycle = \App\Models\AccreditationCycle::where('prodi_id', $prodi->id)
                    ->with('lam')
                    ->orderBy('created_at', 'desc')
                    ->first();
            }
        }

        // Get documents for this prodi
        // Menampilkan dokumen yang memiliki cycle_id sesuai cycle yang dipilih,
        // atau dokumen prodi yang belum memiliki cycle_id (untuk memungkinkan user memilih cycle)
        $documentsQuery = Document::where('prodi_id', $prodi->id)
            ->with('uploadedBy:id,name');

        if ($cycle) {
            // Jika ada cycle yang dipilih, tampilkan dokumen dengan cycle_id tersebut
            // atau dokumen yang belum memiliki cycle_id
            $documentsQuery->where(function ($q) use ($cycle) {
                $q->where('accreditation_cycle_id', $cycle->id)
                    ->orWhereNull('accreditation_cycle_id');
            });
        } else {
            // Jika tidak ada cycle, tampilkan semua dokumen prodi
            $documentsQuery->whereNull('accreditation_cycle_id');
        }

        $documents = $documentsQuery
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($document) {
                return [
                    'id' => $document->id,
                    'file_name' => $document->file_name,
                    'file_type' => $document->file_type,
                    'file_size' => $document->file_size,
                    'category' => $document->category,
                    'year' => $document->year,
                    'accreditation_cycle_id' => $document->accreditation_cycle_id,
                    'uploaded_by' => $document->uploadedBy ? [
                        'name' => $document->uploadedBy->name,
                    ] : null,
                    'created_at' => $document->created_at,
                ];
            })
            ->toArray();

        // Format prodi data untuk frontend
        $prodiData = null;
        if ($prodi) {
            $prodiData = [
                'id' => $prodi->id,
                'name' => $prodi->name,
                'fakultas_name' => $prodi->fakultas?->name ?? '',
            ];
        }

        return Inertia::render('Dashboard/CoordinatorProdi/Accreditation/LKPS', [
            'cycle' => $cycle,
            'documents' => $documents,
            'prodi' => $prodiData,
        ]);
    }
}
