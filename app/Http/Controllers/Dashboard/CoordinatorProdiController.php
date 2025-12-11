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
use App\Models\AssessorAssignmentRequest;
use App\Models\AkreditasiTarget;
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
     * Display the coordinator prodi dashboard.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $year = $request->get('year', Carbon::now()->year);

        // Validate that user has prodi_id
        if (! $user->prodi_id) {
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
     * Show the form for creating a new document.
     */
    public function createDocument(Request $request): Response
    {
        $user = Auth::user();

        // Load prodi and fakultas relationships
        $user->load(['prodi.fakultas']);

        // Get user's prodi
        $prodi = $user->prodi;

        // If prodi_id is null, try to find prodi by name from user's name or unit
        if (!$prodi && $user->name) {
            // Extract prodi name from user name (e.g., "Koordinator Teknik Informatika" -> "Teknik Informatika")
            $prodiName = str_replace('Koordinator ', '', $user->name);
            $prodi = \App\Models\Prodi::where('name', $prodiName)->first();

            // If found, update user's prodi_id
            if ($prodi) {
                $user->update(['prodi_id' => $prodi->id]);
                $user->load(['prodi.fakultas']);
                $prodi = $user->prodi;
            }
        }

        return Inertia::render('Dashboard/CoordinatorProdi/Documents/Create', [
            'prodi' => $prodi ? [
                'id' => $prodi->id,
                'name' => $prodi->name,
                'fakultas_name' => $prodi->fakultas?->name ?? 'N/A',
            ] : null,
        ]);
    }

    /**
     * Display documents list with filters.
     */
    public function documents(Request $request): Response
    {
        $user = Auth::user();

        $query = Document::where('prodi_id', $user->prodi_id)
            ->with(['program', 'prodi', 'uploadedBy', 'validatedBy', 'rejectedBy']);

        // Filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('status')) {
            match ($request->status) {
                'validated' => $query->whereNotNull('validated_at'),
                'pending' => $query->whereNull('validated_at')->whereNull('rejected_by'),
                'rejected' => $query->whereNotNull('rejected_by'),
                'expired' => $query->where('expired_at', '<', Carbon::now()),
                default => null,
            };
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('search')) {
            $query->where('file_name', 'like', '%' . $request->search . '%');
        }

        $documents = $query->latest('created_at')
            ->paginate($request->get('per_page', 15))
            ->withQueryString();

        // Get filter options
        $categories = Document::where('prodi_id', $user->prodi_id)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        $years = Document::where('prodi_id', $user->prodi_id)
            ->distinct()
            ->pluck('year')
            ->filter()
            ->sortDesc()
            ->values();

        // Statistics
        $stats = [
            'total' => Document::where('prodi_id', $user->prodi_id)->count(),
            'validated' => Document::where('prodi_id', $user->prodi_id)->whereNotNull('validated_at')->count(),
            'pending' => Document::where('prodi_id', $user->prodi_id)->whereNull('validated_at')->whereNull('rejected_by')->count(),
            'rejected' => Document::where('prodi_id', $user->prodi_id)->whereNotNull('rejected_by')->count(),
        ];

        return Inertia::render('Dashboard/CoordinatorProdi/Documents/Index', [
            'documents' => $documents,
            'categories' => $categories,
            'years' => $years,
            'stats' => $stats,
            'filters' => $request->only(['category', 'status', 'year', 'search']),
        ]);
    }

    /**
     * Store a new document.
     */
    public function storeDocument(StoreDocumentRequest $request): RedirectResponse
    {
        $user = Auth::user();
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

        return redirect()->route('coordinator-prodi.documents.index')
            ->with('success', 'Dokumen berhasil diupload.');
    }

    /**
     * Update document metadata.
     */
    public function updateDocument(UpdateDocumentRequest $request, string $id): RedirectResponse
    {
        $user = Auth::user();
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
        $user = Auth::user();
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
        $user = Auth::user();
        $document = Document::where('prodi_id', $user->prodi_id)->findOrFail($id);

        $filePath = Storage::disk('local')->path($document->file_path);

        return response()->download($filePath, $document->file_name);
    }

    /**
     * Display document completeness report.
     */
    public function documentCompleteness(Request $request): Response
    {
        $user = Auth::user();
        $programId = $request->get('program_id');
        $year = $request->get('year', Carbon::now()->year);

        $programs = $user->accessiblePrograms();
        if ($programId) {
            $programs = $programs->where('id', $programId);
        }
        $programs = $programs->with(['standards.criteria.criteriaPoints'])->get();

        $completenessData = [];

        foreach ($programs as $program) {
            $programData = [
                'program_id' => $program->id,
                'program_name' => $program->name,
                'standards' => [],
            ];

            foreach ($program->standards as $standard) {
                $standardData = [
                    'standard_id' => $standard->id,
                    'standard_name' => $standard->name,
                    'total_criteria' => $standard->criteria->count(),
                    'completed_criteria' => 0,
                    'criteria' => [],
                ];

                foreach ($standard->criteria as $criterion) {
                    // Check if documents exist for this criterion
                    $documentsCount = Document::where('prodi_id', $user->prodi_id)
                        ->where('program_id', $program->id)
                        ->where('year', $year)
                        ->whereHas('assignment', function ($q) use ($criterion) {
                            $q->where('criteria_id', $criterion->id);
                        })
                        ->whereNotNull('validated_at')
                        ->count();

                    $isComplete = $documentsCount > 0;

                    if ($isComplete) {
                        $standardData['completed_criteria']++;
                    }

                    $standardData['criteria'][] = [
                        'criteria_id' => $criterion->id,
                        'criteria_name' => $criterion->name,
                        'documents_required' => 1, // Placeholder
                        'documents_available' => $documentsCount,
                        'status' => $isComplete ? 'lengkap' : 'belum_lengkap',
                        'missing_documents' => $isComplete ? [] : ['Dokumen untuk kriteria ini belum diupload'],
                    ];
                }

                $standardData['completion_percentage'] = $standardData['total_criteria'] > 0
                    ? round(($standardData['completed_criteria'] / $standardData['total_criteria']) * 100, 2)
                    : 0;

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

            $completenessData[] = $programData;
        }

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
     * Send reminder notification to dosen/tendik.
     */
    public function sendReminder(SendReminderRequest $request): RedirectResponse
    {
        $user = Auth::user();
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
        $user = Auth::user();

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
        $user = Auth::user();
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
            }
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

        $criteriaPoints = $query->orderBy('id')->paginate(15);

        // Get all criteria for filter dropdown
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
        $user = Auth::user();

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
        $criterion = Criterion::create([
            'standard_id' => $request->standard_id,
            'name' => $request->name,
            'description' => $request->description,
            'weight' => $request->weight,
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
        $user = Auth::user();
        $programs = $user->accessiblePrograms()->get(['id', 'name']);
        $criteria = Criterion::with(['standard.program'])->get();

        return Inertia::render('Dashboard/CoordinatorProdi/AssessorRequests/Create', [
            'programs' => $programs,
            'criteria' => $criteria,
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

        $user = Auth::user();

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
                \App\Models\NotificationType::PolicyUpdate,
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
        $criteriaPoint = CriteriaPoint::create([
            'criteria_id' => $request->criteria_id,
            'title' => $request->title,
            'description' => $request->description,
            'max_score' => $request->max_score,
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

        return redirect('/coordinator-prodi/criteria-points')
            ->with('success', 'Poin kriteria berhasil dibuat.');
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

        $criteriaPoint->update([
            'criteria_id' => $request->criteria_id,
            'title' => $request->title,
            'description' => $request->description,
            'max_score' => $request->max_score,
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
        $user = Auth::user();
        $programs = $user->accessiblePrograms()->get(['id', 'name']);

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

        $program->load(['standards.criteria']);

        return Inertia::render('Dashboard/CoordinatorProdi/Standards/Index', [
            'program' => $program,
            'programs' => $programs,
        ]);
    }

    /**
     * Display score recap.
     */
    public function scoreRecap(Request $request): Response
    {
        $user = Auth::user();
        $programs = $user->accessiblePrograms()->get(['id', 'name']);

        // If no program_id provided, use first accessible program or show selection
        if (!$request->filled('program_id')) {
            if ($programs->isEmpty()) {
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

        $programId = $program->id;
        $year = $request->year ?? Carbon::now()->year;

        $program->load(['standards.criteria.criteriaPoints']);

        $recapData = [
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
                'total_score' => 0,
                'max_score' => 0,
            ];

            foreach ($standard->criteria as $criterion) {
                $maxScore = $criterion->criteriaPoints->sum('max_score') ?? 0;

                // Get evaluations for this criterion
                $evaluations = Evaluation::whereHas('assignment', function ($q) use ($criterion, $user) {
                    $q->where('criteria_id', $criterion->id)
                        ->where('prodi_id', $user->prodi_id);
                })->get();

                $score = $evaluations->isNotEmpty() ? $evaluations->avg('score') : 0;
                $lastEvaluationDate = $evaluations->isNotEmpty() ? $evaluations->latest('created_at')->first()->created_at : null;

                $criteriaData = [
                    'criteria_id' => $criterion->id,
                    'criteria_name' => $criterion->name,
                    'weight' => $criterion->weight,
                    'score' => round($score, 2),
                    'max_score' => $maxScore,
                    'percentage' => $maxScore > 0 ? round(($score / $maxScore) * 100, 2) : 0,
                    'evaluations_count' => $evaluations->count(),
                    'last_evaluation_date' => $lastEvaluationDate?->format('Y-m-d H:i:s'),
                ];

                // Calculate weighted score
                $weightedScore = $maxScore > 0 ? ($score / $maxScore) * $criterion->weight : 0;
                $standardData['total_score'] += $weightedScore;
                $standardData['max_score'] += $criterion->weight;

                $standardData['criteria'][] = $criteriaData;
            }

            $standardData['percentage'] = $standardData['max_score'] > 0
                ? round(($standardData['total_score'] / $standardData['max_score']) * 100, 2)
                : 0;

            $recapData['standards'][] = $standardData;
            $recapData['total_score'] += $standardData['total_score'];
            $recapData['max_possible_score'] += $standardData['max_score'];
        }

        $recapData['total_percentage'] = $recapData['max_possible_score'] > 0
            ? round(($recapData['total_score'] / $recapData['max_possible_score']) * 100, 2)
            : 0;

        $recapData['grade'] = $this->calculateGrade($recapData['total_score']);

        // Chart data
        $scorePerCriteria = collect($recapData['standards'])
            ->flatMap(fn($std) => $std['criteria'])
            ->map(fn($crit) => [
                'name' => $crit['criteria_name'],
                'score' => $crit['score'],
                'max_score' => $crit['max_score'],
            ])
            ->toArray();

        $scorePerStandard = collect($recapData['standards'])
            ->map(fn($std) => [
                'name' => $std['standard_name'],
                'score' => $std['total_score'],
                'max_score' => $std['max_score'],
            ])
            ->toArray();

        return Inertia::render('Dashboard/CoordinatorProdi/ScoreRecap/Index', [
            'recapData' => $recapData,
            'scorePerCriteria' => $scorePerCriteria,
            'scorePerStandard' => $scorePerStandard,
            'programs' => $user->accessiblePrograms()->get(['id', 'name']),
            'filters' => $request->only(['program_id', 'year', 'standard_id']),
        ]);
    }

    /**
     * Get targets.
     */
    public function getTargets(Request $request): Response
    {
        $user = Auth::user();
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
        $user = Auth::user();
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
        $user = Auth::user();

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
        $user = Auth::user();
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
        $user = Auth::user();
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
}
