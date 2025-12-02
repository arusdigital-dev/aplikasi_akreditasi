<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssessorInternal\StoreEvaluationNoteRequest;
use App\Http\Requests\AssessorInternal\StoreEvaluationRequest;
use App\Http\Requests\AssessorInternal\UpdateEvaluationNoteRequest;
use App\Http\Requests\AssessorInternal\UpdateEvaluationRequest;
use App\Models\AkreditasiTarget;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\EvaluationNote;
use App\Models\EvaluationNoteHistory;
use App\Models\Program;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AssessorInternalController extends Controller
{
    /**
     * Display the assessor internal dashboard overview.
     */
    public function dashboard(Request $request): Response
    {
        $user = Auth::user();

        // Get statistics for documents assigned to this assessor
        $totalDocuments = Document::whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->count();

        $pendingEvaluations = Document::whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->whereDoesntHave('assignment.evaluationNotes', function ($q) use ($user) {
                $q->where('assessor_id', $user->id);
            })
            ->count();

        $completedEvaluations = Document::whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->whereHas('assignment.evaluationNotes', function ($q) use ($user) {
                $q->where('assessor_id', $user->id);
            })
            ->count();

        // Get recent assignments
        $recentAssignments = Assignment::where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->with(['criterion.standard.program', 'unit'])
            ->latest('assigned_date')
            ->limit(5)
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'criterion_name' => $assignment->criterion?->name ?? 'N/A',
                    'program_name' => $assignment->criterion?->standard?->program?->name ?? 'N/A',
                    'unit_name' => $assignment->unit?->name ?? 'N/A',
                    'assigned_date' => $assignment->assigned_date?->format('Y-m-d') ?? 'N/A',
                    'deadline' => $assignment->deadline?->format('Y-m-d') ?? null,
                ];
            });

        // Get recent evaluation notes
        $recentEvaluationNotes = EvaluationNote::where('assessor_id', $user->id)
            ->with(['document', 'assignment.criterion'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'document_name' => $note->document?->file_name ?? 'N/A',
                    'criterion_name' => $note->assignment?->criterion?->name ?? 'N/A',
                    'status' => $note->status,
                    'created_at' => $note->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get evaluation statistics by status
        $evaluationStatusStats = [
            'valid' => EvaluationNote::where('assessor_id', $user->id)
                ->where('status', 'valid')
                ->count(),
            'invalid' => EvaluationNote::where('assessor_id', $user->id)
                ->where('status', 'invalid')
                ->count(),
            'minor_revision' => EvaluationNote::where('assessor_id', $user->id)
                ->where('status', 'minor_revision')
                ->count(),
            'major_revision' => EvaluationNote::where('assessor_id', $user->id)
                ->where('status', 'major_revision')
                ->count(),
        ];

        return Inertia::render('Dashboard/AssessorInternal/Index', [
            'stats' => [
                'total_documents' => $totalDocuments,
                'pending_evaluations' => $pendingEvaluations,
                'completed_evaluations' => $completedEvaluations,
            ],
            'evaluationStatusStats' => $evaluationStatusStats,
            'recentAssignments' => $recentAssignments,
            'recentEvaluationNotes' => $recentEvaluationNotes,
        ]);
    }

    /**
     * Display the list of evaluation documents.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Get documents that are ready for evaluation
        // Documents must be:
        // 1. Already collected by Prodi (exists in database)
        // 2. Already converted to LPMPP standard format (validated_at is not null)
        // 3. Waiting for assessor evaluation (has assignment with assessor_id = current user, or no evaluation yet)
        $query = Document::query()
            ->with([
                'assignment.criterion.standard.program',
                'assignment.assessor',
                'assignment.unit',
                'program',
                'unit',
                'uploadedBy',
            ])
            ->whereNotNull('validated_at') // Already converted to LPMPP standard format
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at'); // Active assignment
            });

        // Filter by program
        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        // Filter by unit
        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by year
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        // Filter by evaluation status
        if ($request->filled('evaluation_status')) {
            match ($request->evaluation_status) {
                'pending' => $query->whereDoesntHave('assignment.evaluations', function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                }),
                'completed' => $query->whereHas('assignment.evaluations', function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                }),
                default => null,
            };
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('file_name', 'like', '%'.$request->search.'%')
                    ->orWhere('category', 'like', '%'.$request->search.'%')
                    ->orWhereHas('assignment.criterion', function ($subQ) use ($request) {
                        $subQ->where('name', 'like', '%'.$request->search.'%');
                    });
            });
        }

        $documents = $query->latest('created_at')
            ->paginate($request->get('per_page', 15))
            ->withQueryString();

        // Load evaluations for assignments in current page to check status efficiently
        $assignmentIds = $documents->pluck('assignment_id')->unique();
        $evaluatedAssignments = Evaluation::whereIn('assignment_id', $assignmentIds)
            ->where('assessor_id', $user->id)
            ->pluck('assignment_id')
            ->unique();

        $documents->through(function ($document) use ($evaluatedAssignments) {
            // Determine evaluation status
            $evaluationStatus = $evaluatedAssignments->contains($document->assignment_id) ? 'completed' : 'pending';

            return [
                'id' => $document->id,
                'file_name' => $document->file_name,
                'category' => $document->category,
                'year' => $document->year,
                'uploaded_at' => $document->created_at->format('Y-m-d H:i:s'),
                'criterion' => $document->assignment->criterion?->name ?? 'N/A',
                'unit' => $document->unit?->name ?? $document->assignment->unit?->name ?? 'N/A',
                'program' => $document->program?->name ?? $document->assignment->criterion?->standard?->program?->name ?? 'N/A',
                'evaluation_status' => $evaluationStatus,
                'assignment_id' => $document->assignment_id,
            ];
        });

        // Get filter options
        $programs = Program::orderBy('name')->get(['id', 'name']);
        $units = Unit::where('is_active', true)->orderBy('name')->get(['id', 'name', 'type']);

        $categories = Document::whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        $years = Document::whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->distinct()
            ->pluck('year')
            ->filter()
            ->sortDesc()
            ->values();

        // Statistics
        $totalDocuments = Document::whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->count();

        $pendingEvaluations = Document::whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->whereDoesntHave('assignment.evaluations', function ($q) use ($user) {
                $q->where('assessor_id', $user->id);
            })
            ->count();

        $completedEvaluations = Document::whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->whereHas('assignment.evaluations', function ($q) use ($user) {
                $q->where('assessor_id', $user->id);
            })
            ->count();

        return Inertia::render('Dashboard/AssessorInternal/EvaluationDocuments/Index', [
            'documents' => $documents,
            'programs' => $programs,
            'units' => $units,
            'categories' => $categories,
            'years' => $years,
            'stats' => [
                'total' => $totalDocuments,
                'pending' => $pendingEvaluations,
                'completed' => $completedEvaluations,
            ],
            'filters' => $request->only(['program_id', 'unit_id', 'category', 'year', 'evaluation_status', 'search']),
        ]);
    }

    /**
     * Show the form for creating/editing evaluation note for a document.
     */
    public function showEvaluation(string $documentId): Response
    {
        $user = Auth::user();

        $document = Document::with([
            'assignment.criterion.standard.program',
            'assignment.criterion.criteriaPoints',
            'assignment.unit',
            'program',
            'unit',
            'uploadedBy',
        ])
            ->whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->findOrFail($documentId);

        // Get existing evaluation note if any
        $evaluationNote = EvaluationNote::where('assignment_id', $document->assignment_id)
            ->where('assessor_id', $user->id)
            ->where('document_id', $documentId)
            ->first();

        // Get criteria for specific notes (all criteria from the same standard)
        $standard = $document->assignment->criterion->standard;
        $criteria = $standard ? $standard->criteria()->orderBy('order_index')->get() : collect();

        return Inertia::render('Dashboard/AssessorInternal/EvaluationDocuments/Show', [
            'document' => [
                'id' => $document->id,
                'file_name' => $document->file_name,
                'category' => $document->category,
                'year' => $document->year,
                'uploaded_at' => $document->created_at->format('Y-m-d H:i:s'),
                'criterion' => $document->assignment->criterion?->name ?? 'N/A',
                'unit' => $document->unit?->name ?? $document->assignment->unit?->name ?? 'N/A',
                'program' => $document->program?->name ?? $document->assignment->criterion?->standard?->program?->name ?? 'N/A',
                'assignment_id' => $document->assignment_id,
            ],
            'criteria' => $criteria->map(function ($criterion) {
                return [
                    'id' => $criterion->id,
                    'name' => $criterion->name,
                ];
            }),
            'evaluationNote' => $evaluationNote ? [
                'id' => $evaluationNote->id,
                'short_assessment' => $evaluationNote->short_assessment,
                'general_notes' => $evaluationNote->general_notes,
                'specific_notes' => $evaluationNote->specific_notes,
                'status' => $evaluationNote->status,
                'evaluation_file_name' => $evaluationNote->evaluation_file_name,
                'recommendation_file_name' => $evaluationNote->recommendation_file_name,
                'attachments' => $evaluationNote->attachments,
            ] : null,
        ]);
    }

    /**
     * Store a newly created evaluation note.
     */
    public function storeEvaluation(StoreEvaluationNoteRequest $request): RedirectResponse
    {
        $user = Auth::user();

        // Verify assignment belongs to user
        $assignment = Assignment::where('id', $request->assignment_id)
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->firstOrFail();

        // Verify document if provided
        if ($request->document_id) {
            $document = Document::where('id', $request->document_id)
                ->where('assignment_id', $assignment->id)
                ->whereNotNull('validated_at')
                ->firstOrFail();
        }

        $data = [
            'assignment_id' => $request->assignment_id,
            'document_id' => $request->document_id,
            'assessor_id' => $user->id,
            'short_assessment' => $request->short_assessment,
            'general_notes' => $request->general_notes,
            'specific_notes' => $request->specific_notes,
            'status' => $request->status,
        ];

        // Handle evaluation file (PDF)
        if ($request->hasFile('evaluation_file')) {
            $file = $request->file('evaluation_file');
            $fileName = time().'_'.str()->slug($file->getClientOriginalName());
            $filePath = "evaluation-notes/{$user->id}/{$request->assignment_id}/evaluation_{$fileName}";
            Storage::disk('local')->put($filePath, file_get_contents($file->getRealPath()));
            $data['evaluation_file_path'] = $filePath;
            $data['evaluation_file_name'] = $file->getClientOriginalName();
        }

        // Handle recommendation file (Word)
        if ($request->hasFile('recommendation_file')) {
            $file = $request->file('recommendation_file');
            $fileName = time().'_'.str()->slug($file->getClientOriginalName());
            $filePath = "evaluation-notes/{$user->id}/{$request->assignment_id}/recommendation_{$fileName}";
            Storage::disk('local')->put($filePath, file_get_contents($file->getRealPath()));
            $data['recommendation_file_path'] = $filePath;
            $data['recommendation_file_name'] = $file->getClientOriginalName();
        }

        // Handle attachments
        if ($request->hasFile('attachments')) {
            $attachments = [];
            foreach ($request->file('attachments') as $attachment) {
                $fileName = time().'_'.str()->slug($attachment->getClientOriginalName());
                $filePath = "evaluation-notes/{$user->id}/{$request->assignment_id}/attachments/{$fileName}";
                Storage::disk('local')->put($filePath, file_get_contents($attachment->getRealPath()));
                $attachments[] = [
                    'path' => $filePath,
                    'name' => $attachment->getClientOriginalName(),
                    'type' => $attachment->getMimeType(),
                ];
            }
            $data['attachments'] = $attachments;
        }

        $evaluationNote = EvaluationNote::create($data);

        // Create history record
        EvaluationNoteHistory::create([
            'evaluation_note_id' => $evaluationNote->id,
            'user_id' => $user->id,
            'action' => 'created',
            'notes' => 'Evaluasi baru dibuat',
            'version' => 'v1',
            'changes' => [
                'status' => $evaluationNote->status,
                'short_assessment' => $evaluationNote->short_assessment,
                'has_evaluation_file' => ! empty($evaluationNote->evaluation_file_path),
                'has_recommendation_file' => ! empty($evaluationNote->recommendation_file_path),
                'attachments_count' => count($evaluationNote->attachments ?? []),
            ],
        ]);

        return redirect()->route('assessor-internal.evaluation-documents.index')
            ->with('success', 'Catatan evaluasi berhasil disimpan.');
    }

    /**
     * Update the specified evaluation note.
     */
    public function updateEvaluation(UpdateEvaluationNoteRequest $request, string $id): RedirectResponse
    {
        $user = Auth::user();

        $evaluationNote = EvaluationNote::where('id', $id)
            ->where('assessor_id', $user->id)
            ->firstOrFail();

        $data = [
            'short_assessment' => $request->short_assessment,
            'general_notes' => $request->general_notes,
            'specific_notes' => $request->specific_notes,
            'status' => $request->status,
        ];

        // Handle evaluation file (PDF) - replace if new file uploaded
        if ($request->hasFile('evaluation_file')) {
            // Delete old file if exists
            if ($evaluationNote->evaluation_file_path) {
                Storage::disk('local')->delete($evaluationNote->evaluation_file_path);
            }

            $file = $request->file('evaluation_file');
            $fileName = time().'_'.str()->slug($file->getClientOriginalName());
            $filePath = "evaluation-notes/{$user->id}/{$evaluationNote->assignment_id}/evaluation_{$fileName}";
            Storage::disk('local')->put($filePath, file_get_contents($file->getRealPath()));
            $data['evaluation_file_path'] = $filePath;
            $data['evaluation_file_name'] = $file->getClientOriginalName();
        }

        // Handle recommendation file (Word) - replace if new file uploaded
        if ($request->hasFile('recommendation_file')) {
            // Delete old file if exists
            if ($evaluationNote->recommendation_file_path) {
                Storage::disk('local')->delete($evaluationNote->recommendation_file_path);
            }

            $file = $request->file('recommendation_file');
            $fileName = time().'_'.str()->slug($file->getClientOriginalName());
            $filePath = "evaluation-notes/{$user->id}/{$evaluationNote->assignment_id}/recommendation_{$fileName}";
            Storage::disk('local')->put($filePath, file_get_contents($file->getRealPath()));
            $data['recommendation_file_path'] = $filePath;
            $data['recommendation_file_name'] = $file->getClientOriginalName();
        }

        // Handle attachments - append new attachments
        if ($request->hasFile('attachments')) {
            $existingAttachments = $evaluationNote->attachments ?? [];
            $newAttachments = [];
            foreach ($request->file('attachments') as $attachment) {
                $fileName = time().'_'.str()->slug($attachment->getClientOriginalName());
                $filePath = "evaluation-notes/{$user->id}/{$evaluationNote->assignment_id}/attachments/{$fileName}";
                Storage::disk('local')->put($filePath, file_get_contents($attachment->getRealPath()));
                $newAttachments[] = [
                    'path' => $filePath,
                    'name' => $attachment->getClientOriginalName(),
                    'type' => $attachment->getMimeType(),
                ];
            }
            $data['attachments'] = array_merge($existingAttachments, $newAttachments);
        }

        // Track changes before update
        $oldData = $evaluationNote->toArray();
        $changes = [];

        foreach ($data as $key => $value) {
            if (isset($oldData[$key]) && $oldData[$key] != $value) {
                $changes[$key] = [
                    'old' => $oldData[$key],
                    'new' => $value,
                ];
            }
        }

        $evaluationNote->update($data);

        // Create history record if there are changes
        if (! empty($changes)) {
            $version = EvaluationNoteHistory::where('evaluation_note_id', $evaluationNote->id)
                ->count() + 1;

            $action = 'updated';
            if (isset($changes['status'])) {
                $action = 'status_changed';
            } elseif (isset($changes['evaluation_file_path']) || isset($changes['recommendation_file_path']) || isset($changes['attachments'])) {
                $action = 'file_uploaded';
            }

            EvaluationNoteHistory::create([
                'evaluation_note_id' => $evaluationNote->id,
                'user_id' => $user->id,
                'action' => $action,
                'notes' => 'Evaluasi diperbarui',
                'version' => "v{$version}",
                'changes' => $changes,
            ]);
        }

        return redirect()->route('assessor-internal.evaluation-documents.index')
            ->with('success', 'Catatan evaluasi berhasil diperbarui.');
    }

    /**
     * Download evaluation file.
     */
    public function downloadEvaluationFile(string $id, string $type): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $user = Auth::user();

        $evaluationNote = EvaluationNote::where('id', $id)
            ->where('assessor_id', $user->id)
            ->firstOrFail();

        $filePath = match ($type) {
            'evaluation' => $evaluationNote->evaluation_file_path,
            'recommendation' => $evaluationNote->recommendation_file_path,
            default => null,
        };

        if (! $filePath || ! Storage::disk('local')->exists($filePath)) {
            abort(404, 'File tidak ditemukan.');
        }

        return response()->download(Storage::disk('local')->path($filePath));
    }

    /**
     * Show evaluation history for a document.
     */
    public function showHistory(string $documentId): Response|RedirectResponse
    {
        $user = Auth::user();

        $document = Document::with([
            'assignment.criterion.standard.program',
            'assignment.unit',
            'program',
            'unit',
        ])
            ->whereNotNull('validated_at')
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->findOrFail($documentId);

        // Get evaluation note for this document
        $evaluationNote = EvaluationNote::where('assignment_id', $document->assignment_id)
            ->where('assessor_id', $user->id)
            ->where('document_id', $documentId)
            ->with(['histories.user', 'prodiCommentBy'])
            ->first();

        if (! $evaluationNote) {
            return redirect()->route('assessor-internal.evaluation-documents.index')
                ->with('error', 'Evaluasi belum dibuat untuk dokumen ini.');
        }

        // Get all histories ordered by version/created_at
        $histories = $evaluationNote->histories()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($history) {
                return [
                    'id' => $history->id,
                    'action' => $history->action,
                    'action_label' => $this->getActionLabel($history->action),
                    'version' => $history->version,
                    'notes' => $history->notes,
                    'changes' => $history->changes,
                    'user' => $history->user ? [
                        'id' => $history->user->id,
                        'name' => $history->user->name,
                        'email' => $history->user->email,
                    ] : null,
                    'created_at' => $history->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $history->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard/AssessorInternal/EvaluationDocuments/History', [
            'document' => [
                'id' => $document->id,
                'file_name' => $document->file_name,
                'category' => $document->category,
                'year' => $document->year,
                'criterion' => $document->assignment->criterion?->name ?? 'N/A',
                'unit' => $document->unit?->name ?? $document->assignment->unit?->name ?? 'N/A',
                'program' => $document->program?->name ?? $document->assignment->criterion?->standard?->program?->name ?? 'N/A',
            ],
            'evaluationNote' => [
                'id' => $evaluationNote->id,
                'status' => $evaluationNote->status,
                'short_assessment' => $evaluationNote->short_assessment,
                'general_notes' => $evaluationNote->general_notes,
                'prodi_comment' => $evaluationNote->prodi_comment,
                'prodi_comment_by' => $evaluationNote->prodiCommentBy ? [
                    'name' => $evaluationNote->prodiCommentBy->name,
                    'email' => $evaluationNote->prodiCommentBy->email,
                ] : null,
                'prodi_comment_at' => $evaluationNote->prodi_comment_at?->format('Y-m-d H:i:s'),
                'created_at' => $evaluationNote->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $evaluationNote->updated_at->format('Y-m-d H:i:s'),
            ],
            'histories' => $histories,
        ]);
    }

    /**
     * Get action label for history.
     */
    private function getActionLabel(string $action): string
    {
        return match ($action) {
            'created' => 'Evaluasi Dibuat',
            'updated' => 'Evaluasi Diperbarui',
            'status_changed' => 'Status Diubah',
            'file_uploaded' => 'File Diunggah',
            'commented' => 'Komentar Ditambahkan',
            default => ucfirst(str_replace('_', ' ', $action)),
        };
    }

    /**
     * Display list of assessment assignments.
     */
    public function assignments(Request $request): Response
    {
        $user = Auth::user();

        $query = Assignment::query()
            ->with([
                'criterion.standard.program',
                'criterion.criteriaPoints',
                'unit',
                'evaluations.criteriaPoint',
                'lockedBy',
            ])
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at');

        // Filter by status
        if ($request->filled('status')) {
            match ($request->status) {
                'not_started' => $query->whereDoesntHave('evaluations', function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                }),
                'in_progress' => $query->whereHas('evaluations', function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                })->whereDoesntHave('evaluations', function ($q) use ($user) {
                    $q->where('assessor_id', $user->id)
                        ->whereNotNull('evaluation_status');
                }),
                'completed' => $query->whereHas('evaluations', function ($q) use ($user) {
                    $q->where('assessor_id', $user->id)
                        ->whereNotNull('evaluation_status');
                }),
                default => null,
            };
        }

        // Filter by unit
        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        // Filter by program
        if ($request->filled('program_id')) {
            $query->whereHas('criterion.standard.program', function ($q) use ($request) {
                $q->where('programs.id', $request->program_id);
            });
        }

        $assignments = $query->latest('assigned_date')
            ->paginate($request->get('per_page', 15))
            ->withQueryString()
            ->through(function ($assignment) use ($user) {
                // Determine status
                $hasEvaluations = $assignment->evaluations()
                    ->where('assessor_id', $user->id)
                    ->exists();

                $hasCompletedEvaluations = $assignment->evaluations()
                    ->where('assessor_id', $user->id)
                    ->whereNotNull('evaluation_status')
                    ->exists();

                $status = 'not_started';
                if ($hasCompletedEvaluations) {
                    $status = 'completed';
                } elseif ($hasEvaluations) {
                    $status = 'in_progress';
                }

                // Calculate weight (sum of criteria points max_score)
                $weight = $assignment->criterion->criteriaPoints->sum('max_score');

                return [
                    'id' => $assignment->id,
                    'unit' => $assignment->unit?->name ?? 'N/A',
                    'criterion' => $assignment->criterion?->name ?? 'N/A',
                    'program' => $assignment->criterion?->standard?->program?->name ?? 'N/A',
                    'weight' => $weight,
                    'status' => $status,
                    'deadline' => $assignment->deadline?->format('Y-m-d') ?? null,
                    'assigned_date' => $assignment->assigned_date->format('Y-m-d'),
                    'is_locked' => $assignment->isLocked(),
                    'locked_at' => $assignment->locked_at?->format('Y-m-d H:i:s'),
                    'locked_by' => $assignment->lockedBy?->name ?? null,
                ];
            });

        // Get filter options
        $units = Unit::where('is_active', true)
            ->whereHas('assignments', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        $programs = Program::whereHas('standards.criteria.assignments', function ($q) use ($user) {
            $q->where('assessor_id', $user->id)
                ->whereNull('unassigned_at');
        })
            ->orderBy('name')
            ->get(['id', 'name']);

        // Statistics
        $totalAssignments = Assignment::where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->count();

        $notStarted = Assignment::where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->whereDoesntHave('evaluations', function ($q) use ($user) {
                $q->where('assessor_id', $user->id);
            })
            ->count();

        $inProgress = Assignment::where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->whereHas('evaluations', function ($q) use ($user) {
                $q->where('assessor_id', $user->id);
            })
            ->whereDoesntHave('evaluations', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNotNull('evaluation_status');
            })
            ->count();

        $completed = Assignment::where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->whereHas('evaluations', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNotNull('evaluation_status');
            })
            ->count();

        return Inertia::render('Dashboard/AssessorInternal/Assignments/Index', [
            'assignments' => $assignments,
            'units' => $units,
            'programs' => $programs,
            'stats' => [
                'total' => $totalAssignments,
                'not_started' => $notStarted,
                'in_progress' => $inProgress,
                'completed' => $completed,
            ],
            'filters' => $request->only(['status', 'unit_id', 'program_id']),
        ]);
    }

    /**
     * Show form for inputting/editing evaluation scores.
     */
    public function showAssignmentEvaluation(int $assignmentId): Response|RedirectResponse
    {
        $user = Auth::user();

        $assignment = Assignment::with([
            'criterion.standard.program',
            'criterion.criteriaPoints' => function ($q) {
                $q->orderBy('id');
            },
            'unit',
            'evaluations' => function ($q) use ($user) {
                $q->where('assessor_id', $user->id);
            },
            'lockedBy',
        ])
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->findOrFail($assignmentId);

        // Check if assignment is locked
        if ($assignment->isLocked()) {
            return redirect()->route('assessor-internal.assignments.index')
                ->with('error', 'Penilaian ini sudah dikunci dan tidak dapat diubah.');
        }

        // Get all criteria points for this criterion
        $criteriaPoints = $assignment->criterion->criteriaPoints;

        // Get existing evaluations
        $existingEvaluations = $assignment->evaluations()
            ->where('assessor_id', $user->id)
            ->get()
            ->keyBy('criteria_point_id');

        // Check if all documents are validated
        $documents = Document::where('assignment_id', $assignment->id)
            ->get();

        $allDocumentsValidated = $documents->count() > 0 && $documents->every(function ($doc) {
            return $doc->validated_at !== null;
        });

        $warnings = [];
        if ($documents->count() === 0) {
            $warnings[] = 'Belum ada dokumen yang diunggah untuk penugasan ini.';
        } elseif (! $allDocumentsValidated) {
            $warnings[] = 'Beberapa dokumen belum divalidasi. Pastikan semua dokumen sudah divalidasi sebelum menyimpan penilaian.';
        }

        return Inertia::render('Dashboard/AssessorInternal/Assignments/Evaluate', [
            'assignment' => [
                'id' => $assignment->id,
                'unit' => $assignment->unit?->name ?? 'N/A',
                'criterion' => $assignment->criterion?->name ?? 'N/A',
                'program' => $assignment->criterion?->standard?->program?->name ?? 'N/A',
                'deadline' => $assignment->deadline instanceof \Carbon\Carbon ? $assignment->deadline->format('Y-m-d') : ($assignment->deadline ? (string) $assignment->deadline : null),
                'assigned_date' => $assignment->assigned_date instanceof \Carbon\Carbon ? $assignment->assigned_date->format('Y-m-d') : ($assignment->assigned_date ? (string) $assignment->assigned_date : null),
                'is_locked' => $assignment->isLocked(),
            ],
            'criteriaPoints' => $criteriaPoints->map(function ($point) use ($existingEvaluations) {
                $evaluation = $existingEvaluations->get($point->id);

                return [
                    'id' => $point->id,
                    'title' => $point->title,
                    'description' => $point->description,
                    'max_score' => $point->max_score,
                    'evaluation' => $evaluation ? [
                        'id' => $evaluation->id,
                        'score' => $evaluation->score,
                        'notes' => $evaluation->notes,
                        'descriptive_narrative' => $evaluation->descriptive_narrative,
                        'improvement_suggestion' => $evaluation->improvement_suggestion,
                        'evaluation_status' => $evaluation->evaluation_status,
                    ] : null,
                ];
            }),
            'warnings' => $warnings,
            'allDocumentsValidated' => $allDocumentsValidated,
        ]);
    }

    /**
     * Store evaluation scores for assignment.
     */
    public function storeAssignmentEvaluation(StoreEvaluationRequest $request, int $assignmentId): RedirectResponse
    {
        $user = Auth::user();

        $assignment = Assignment::where('id', $request->assignment_id)
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->firstOrFail();

        // Check if assignment is locked
        if ($assignment->isLocked()) {
            return back()->withErrors(['assignment' => 'Penilaian ini sudah dikunci dan tidak dapat diubah.']);
        }

        // Validate all documents are validated
        $documents = Document::where('assignment_id', $assignment->id)->get();
        if ($documents->count() > 0 && ! $documents->every(fn ($doc) => $doc->validated_at !== null)) {
            return back()->withErrors(['documents' => 'Semua dokumen harus divalidasi sebelum menyimpan penilaian.']);
        }

        // Store/update evaluations
        foreach ($request->evaluations as $evalData) {
            Evaluation::updateOrCreate(
                [
                    'assignment_id' => $assignment->id,
                    'assessor_id' => $user->id,
                    'criteria_point_id' => $evalData['criteria_point_id'],
                ],
                [
                    'score' => $evalData['score'],
                    'notes' => $evalData['notes'] ?? null,
                    'descriptive_narrative' => $evalData['descriptive_narrative'] ?? null,
                    'improvement_suggestion' => $evalData['improvement_suggestion'] ?? null,
                    'evaluation_status' => $evalData['evaluation_status'] ?? null,
                ]
            );
        }

        // Update assignment status
        $assignment->update([
            'status' => \App\Models\AssignmentStatus::InProgress,
        ]);

        return redirect()->route('assessor-internal.assignments.index')
            ->with('success', 'Penilaian berhasil disimpan.');
    }

    /**
     * Update evaluation scores for assignment.
     */
    public function updateAssignmentEvaluation(UpdateEvaluationRequest $request, int $assignmentId): RedirectResponse
    {
        $user = Auth::user();

        $assignment = Assignment::where('id', $assignmentId)
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->firstOrFail();

        // Check if assignment is locked
        if ($assignment->isLocked()) {
            return back()->withErrors(['assignment' => 'Penilaian ini sudah dikunci dan tidak dapat diubah.']);
        }

        // Validate all documents are validated
        $documents = Document::where('assignment_id', $assignment->id)->get();
        if ($documents->count() > 0 && ! $documents->every(fn ($doc) => $doc->validated_at !== null)) {
            return back()->withErrors(['documents' => 'Semua dokumen harus divalidasi sebelum menyimpan penilaian.']);
        }

        // Track changes for logging
        $changes = [];

        // Update evaluations
        foreach ($request->evaluations as $evalData) {
            $existing = Evaluation::where('assignment_id', $assignment->id)
                ->where('assessor_id', $user->id)
                ->where('criteria_point_id', $evalData['criteria_point_id'])
                ->first();

            $oldScore = $existing?->score;
            $newScore = $evalData['score'];

            if ($oldScore != $newScore) {
                $changes[] = [
                    'criteria_point_id' => $evalData['criteria_point_id'],
                    'old_score' => $oldScore,
                    'new_score' => $newScore,
                ];
            }

            Evaluation::updateOrCreate(
                [
                    'assignment_id' => $assignment->id,
                    'assessor_id' => $user->id,
                    'criteria_point_id' => $evalData['criteria_point_id'],
                ],
                [
                    'score' => $evalData['score'],
                    'notes' => $evalData['notes'] ?? null,
                    'descriptive_narrative' => $evalData['descriptive_narrative'] ?? null,
                    'improvement_suggestion' => $evalData['improvement_suggestion'] ?? null,
                    'evaluation_status' => $evalData['evaluation_status'] ?? null,
                ]
            );
        }

        // Log changes if any
        if (! empty($changes)) {
            // You can create an activity log or evaluation history here
            // For now, we'll just update the assignment status
        }

        // Update assignment status
        $allEvaluationsHaveStatus = Evaluation::where('assignment_id', $assignment->id)
            ->where('assessor_id', $user->id)
            ->whereNotNull('evaluation_status')
            ->count() === count($request->evaluations);

        if ($allEvaluationsHaveStatus) {
            $assignment->update([
                'status' => \App\Models\AssignmentStatus::Completed,
            ]);
        } else {
            $assignment->update([
                'status' => \App\Models\AssignmentStatus::InProgress,
            ]);
        }

        return redirect()->route('assessor-internal.assignments.index')
            ->with('success', 'Penilaian berhasil diperbarui.');
    }

    /**
     * Display statistics per program/unit.
     */
    public function statisticsPerProgram(Request $request): Response
    {
        $user = Auth::user();

        $query = Assignment::query()
            ->with([
                'criterion.standard.program',
                'unit',
                'evaluations' => function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                },
            ])
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at');

        // Filter by program if provided
        $programId = $request->get('program_id');
        if ($programId) {
            $query->whereHas('criterion.standard.program', function ($q) use ($programId) {
                $q->where('programs.id', $programId);
            });
        }

        $assignments = $query->get();

        // Group by program/unit
        $programStats = [];
        foreach ($assignments as $assignment) {
            $programName = $assignment->criterion?->standard?->program?->name ?? 'N/A';
            $unitName = $assignment->unit?->name ?? 'N/A';
            $key = "{$programName} - {$unitName}";

            if (! isset($programStats[$key])) {
                $programStats[$key] = [
                    'program' => $programName,
                    'unit' => $unitName,
                    'total_criteria' => 0,
                    'evaluated_criteria' => 0,
                    'total_score' => 0,
                    'average_score' => 0,
                    'criteria_details' => [],
                ];
            }

            $programStats[$key]['total_criteria']++;
            $evaluations = $assignment->evaluations;
            if ($evaluations->isNotEmpty()) {
                $programStats[$key]['evaluated_criteria']++;
                $avgScore = $evaluations->avg('score');
                $programStats[$key]['total_score'] += $avgScore;
                $programStats[$key]['criteria_details'][] = [
                    'criterion' => $assignment->criterion?->name ?? 'N/A',
                    'score' => $avgScore,
                    'status' => $evaluations->first()?->evaluation_status ?? null,
                ];
            }
        }

        // Calculate averages and progress
        $statistics = [];
        foreach ($programStats as $key => $stats) {
            $progress = $stats['total_criteria'] > 0
                ? ($stats['evaluated_criteria'] / $stats['total_criteria']) * 100
                : 0;
            $average = $stats['evaluated_criteria'] > 0
                ? $stats['total_score'] / $stats['evaluated_criteria']
                : 0;

            // Categorize criteria (weak/strong)
            $weakCriteria = array_filter($stats['criteria_details'], fn ($c) => $c['score'] < 2.5);
            $strongCriteria = array_filter($stats['criteria_details'], fn ($c) => $c['score'] >= 3.5);

            // Radar chart data (Input, Process, Output, Impact)
            // This is simplified - you may need to map criteria to these categories
            $radarData = [
                'input' => $average * 0.25, // Simplified calculation
                'process' => $average * 0.25,
                'output' => $average * 0.25,
                'impact' => $average * 0.25,
            ];

            $statistics[] = [
                'program' => $stats['program'],
                'unit' => $stats['unit'],
                'total_criteria' => $stats['total_criteria'],
                'evaluated_criteria' => $stats['evaluated_criteria'],
                'progress' => round($progress, 2),
                'average_score' => round($average, 2),
                'weak_criteria' => count($weakCriteria),
                'strong_criteria' => count($strongCriteria),
                'radar_data' => $radarData,
                'criteria_details' => $stats['criteria_details'],
            ];
        }

        // Get programs for filter
        $programs = Program::whereHas('standards.criteria.assignments', function ($q) use ($user) {
            $q->where('assessor_id', $user->id)
                ->whereNull('unassigned_at');
        })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Dashboard/AssessorInternal/Statistics/PerProgram', [
            'statistics' => $statistics,
            'programs' => $programs,
            'filters' => $request->only(['program_id']),
        ]);
    }

    /**
     * Display statistics per criterion.
     */
    public function statisticsPerCriterion(Request $request): Response
    {
        $user = Auth::user();

        $query = Assignment::query()
            ->with([
                'criterion.standard.program',
                'unit',
                'evaluations' => function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                },
            ])
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at');

        $assignments = $query->get();

        // Group by criterion
        $criterionStats = [];
        foreach ($assignments as $assignment) {
            $criterionName = $assignment->criterion?->name ?? 'N/A';
            $criterionId = $assignment->criteria_id;

            if (! isset($criterionStats[$criterionId])) {
                $criterionStats[$criterionId] = [
                    'criterion_id' => $criterionId,
                    'criterion_name' => $criterionName,
                    'units' => [],
                    'scores' => [],
                    'problem_count' => 0,
                ];
            }

            $evaluations = $assignment->evaluations;
            if ($evaluations->isNotEmpty()) {
                $avgScore = $evaluations->avg('score');
                $unitName = $assignment->unit?->name ?? 'N/A';
                $criterionStats[$criterionId]['units'][] = [
                    'unit' => $unitName,
                    'score' => round($avgScore, 2),
                ];
                $criterionStats[$criterionId]['scores'][] = $avgScore;

                // Count problems (score < 2.5 or status inadequate/needs_improvement)
                if ($avgScore < 2.5 || in_array($evaluations->first()?->evaluation_status, ['inadequate', 'needs_improvement'])) {
                    $criterionStats[$criterionId]['problem_count']++;
                }
            }
        }

        // Calculate statistics
        $statistics = [];
        foreach ($criterionStats as $stats) {
            $scores = $stats['scores'];
            if (count($scores) > 0) {
                // Distribution by BAN-PT scale
                $distribution = [
                    'A' => count(array_filter($scores, fn ($s) => $s >= 3.5)),
                    'B' => count(array_filter($scores, fn ($s) => $s >= 2.5 && $s < 3.5)),
                    'C' => count(array_filter($scores, fn ($s) => $s >= 1.5 && $s < 2.5)),
                    'D' => count(array_filter($scores, fn ($s) => $s < 1.5)),
                ];

                $statistics[] = [
                    'criterion_id' => $stats['criterion_id'],
                    'criterion_name' => $stats['criterion_name'],
                    'total_units' => count($stats['units']),
                    'average_score' => round(array_sum($scores) / count($scores), 2),
                    'min_score' => round(min($scores), 2),
                    'max_score' => round(max($scores), 2),
                    'distribution' => $distribution,
                    'units' => $stats['units'],
                    'problem_count' => $stats['problem_count'],
                    'is_problematic' => $stats['problem_count'] > count($stats['units']) * 0.5, // >50% have problems
                ];
            }
        }

        // Sort by problem count (most problematic first)
        usort($statistics, fn ($a, $b) => $b['problem_count'] <=> $a['problem_count']);

        return Inertia::render('Dashboard/AssessorInternal/Statistics/PerCriterion', [
            'statistics' => $statistics,
        ]);
    }

    /**
     * Display individual progress statistics.
     */
    public function statisticsProgress(Request $request): Response
    {
        $user = Auth::user();

        $assignments = Assignment::query()
            ->with([
                'criterion.standard.program',
                'unit',
                'evaluations' => function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                },
            ])
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at')
            ->get();

        $totalCriteria = $assignments->count();
        $evaluatedCriteria = $assignments->filter(function ($assignment) {
            return $assignment->evaluations->isNotEmpty();
        })->count();
        $pendingCriteria = $totalCriteria - $evaluatedCriteria;

        // Get upcoming deadlines (next 7 days)
        $upcomingDeadlines = $assignments
            ->filter(function ($assignment) {
                if (! $assignment->deadline) {
                    return false;
                }
                $daysUntilDeadline = now()->diffInDays($assignment->deadline, false);

                return $daysUntilDeadline >= 0 && $daysUntilDeadline <= 7;
            })
            ->sortBy('deadline')
            ->take(10)
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'criterion' => $assignment->criterion?->name ?? 'N/A',
                    'unit' => $assignment->unit?->name ?? 'N/A',
                    'program' => $assignment->criterion?->standard?->program?->name ?? 'N/A',
                    'deadline' => $assignment->deadline instanceof \Carbon\Carbon ? $assignment->deadline->format('Y-m-d') : (string) $assignment->deadline,
                    'days_remaining' => now()->diffInDays($assignment->deadline, false),
                    'is_evaluated' => $assignment->evaluations->isNotEmpty(),
                ];
            })
            ->values();

        // Get pending assignments
        $pendingAssignments = $assignments
            ->filter(function ($assignment) {
                return $assignment->evaluations->isEmpty();
            })
            ->sortBy('deadline')
            ->take(10)
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'criterion' => $assignment->criterion?->name ?? 'N/A',
                    'unit' => $assignment->unit?->name ?? 'N/A',
                    'program' => $assignment->criterion?->standard?->program?->name ?? 'N/A',
                    'deadline' => $assignment->deadline instanceof \Carbon\Carbon ? $assignment->deadline->format('Y-m-d') : null,
                    'assigned_date' => $assignment->assigned_date instanceof \Carbon\Carbon ? $assignment->assigned_date->format('Y-m-d') : (string) $assignment->assigned_date,
                ];
            })
            ->values();

        // Progress by status
        $statusBreakdown = [
            'not_started' => $assignments->filter(function ($assignment) {
                return $assignment->evaluations->isEmpty();
            })->count(),
            'in_progress' => $assignments->filter(function ($assignment) {
                $evaluations = $assignment->evaluations;

                return $evaluations->isNotEmpty() && $evaluations->whereNotNull('evaluation_status')->isEmpty();
            })->count(),
            'completed' => $assignments->filter(function ($assignment) {
                $evaluations = $assignment->evaluations;

                return $evaluations->isNotEmpty() && $evaluations->whereNotNull('evaluation_status')->isNotEmpty();
            })->count(),
        ];

        return Inertia::render('Dashboard/AssessorInternal/Statistics/Progress', [
            'total_criteria' => $totalCriteria,
            'evaluated_criteria' => $evaluatedCriteria,
            'pending_criteria' => $pendingCriteria,
            'progress_percentage' => $totalCriteria > 0 ? round(($evaluatedCriteria / $totalCriteria) * 100, 2) : 0,
            'status_breakdown' => $statusBreakdown,
            'upcoming_deadlines' => $upcomingDeadlines,
            'pending_assignments' => $pendingAssignments,
        ]);
    }

    /**
     * Display accreditation simulation.
     */
    public function simulation(Request $request): Response
    {
        $user = Auth::user();

        // Get filter parameters
        $programId = $request->get('program_id');
        $unitId = $request->get('unit_id');

        $query = Assignment::query()
            ->with([
                'criterion.standard.program',
                'criterion.criteriaPoints',
                'unit',
                'evaluations' => function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                },
                'evaluationNotes' => function ($q) use ($user) {
                    $q->where('assessor_id', $user->id);
                },
            ])
            ->where('assessor_id', $user->id)
            ->whereNull('unassigned_at');

        // Apply filters
        if ($programId) {
            $query->whereHas('criterion.standard.program', function ($q) use ($programId) {
                $q->where('programs.id', $programId);
            });
        }

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $assignments = $query->get();

        // Group by program/unit
        $simulations = [];
        foreach ($assignments->groupBy(function ($assignment) {
            $programName = $assignment->criterion?->standard?->program?->name ?? 'N/A';
            $unitName = $assignment->unit?->name ?? 'N/A';

            return "{$programName}|{$unitName}";
        }) as $key => $groupedAssignments) {
            [$programName, $unitName] = explode('|', $key);
            $program = $groupedAssignments->first()->criterion?->standard?->program;

            // Calculate total score
            $totalScore = 0;
            $totalWeight = 0;
            $criteriaBreakdown = [];

            foreach ($groupedAssignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 0;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;

                    // Get evaluation note
                    $evaluationNote = $assignment->evaluationNotes->first();

                    // Map criterion to category (simplified - using standard name or criterion name)
                    $category = $this->mapCriterionToCategory($assignment->criterion?->name ?? 'Lainnya');

                    if (! isset($criteriaBreakdown[$category])) {
                        $criteriaBreakdown[$category] = [];
                    }

                    $criteriaBreakdown[$category][] = [
                        'criterion_id' => $assignment->criteria_id,
                        'criterion_name' => $assignment->criterion?->name ?? 'N/A',
                        'score' => round($avgScore, 2),
                        'weight' => $weight,
                        'weighted_score' => round($avgScore * $weight, 2),
                        'status' => $evaluations->first()?->evaluation_status ?? null,
                        'notes' => $evaluationNote?->general_notes ?? null,
                        'evaluation_file' => $evaluationNote ? [
                            'name' => $evaluationNote->evaluation_file_name,
                            'path' => $evaluationNote->evaluation_file_path,
                        ] : null,
                        'indicators' => $this->getIndicatorsStatus($evaluations),
                    ];
                }
            }

            $finalScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;
            $finalGrade = $this->convertToGrade($finalScore);
            $banptGrade = $this->convertToBANPTGrade($finalScore);

            // Get target if exists
            $target = null;
            if ($program) {
                $akreditasiTarget = AkreditasiTarget::where('program_id', $program->id)
                    ->orderBy('year', 'desc')
                    ->first();

                if ($akreditasiTarget) {
                    $target = [
                        'target_score' => $akreditasiTarget->target_score,
                        'target_grade' => $akreditasiTarget->target_grade,
                        'year' => $akreditasiTarget->year,
                        'gap' => round($finalScore - $akreditasiTarget->target_score, 2),
                    ];
                }
            }

            // Gap analysis
            $gapAnalysis = $this->analyzeGaps($criteriaBreakdown);

            $simulations[] = [
                'program' => $programName,
                'unit' => $unitName,
                'program_id' => $program?->id,
                'unit_id' => $groupedAssignments->first()->unit_id,
                'final_score' => round($finalScore, 2),
                'final_grade' => $finalGrade,
                'banpt_grade' => $banptGrade,
                'total_weight' => $totalWeight,
                'criteria_count' => count($criteriaBreakdown),
                'target' => $target,
                'criteria_breakdown' => $criteriaBreakdown,
                'gap_analysis' => $gapAnalysis,
            ];
        }

        // Get filter options
        $programs = Program::whereHas('standards.criteria.assignments', function ($q) use ($user) {
            $q->where('assessor_id', $user->id)
                ->whereNull('unassigned_at');
        })
            ->orderBy('name')
            ->get(['id', 'name']);

        $units = Unit::where('is_active', true)
            ->whereHas('assignments', function ($q) use ($user) {
                $q->where('assessor_id', $user->id)
                    ->whereNull('unassigned_at');
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Dashboard/AssessorInternal/Simulation/Index', [
            'simulations' => $simulations,
            'programs' => $programs,
            'units' => $units,
            'filters' => $request->only(['program_id', 'unit_id']),
        ]);
    }

    /**
     * Export simulation as PDF.
     */
    public function exportSimulationPDF(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $programId = $request->get('program_id');
        $unitId = $request->get('unit_id');

        // Get simulation data (similar to simulation method)
        // For now, redirect to simulation page with export parameter
        // Full implementation would generate PDF using DomPDF

        return redirect()->route('assessor-internal.simulation', [
            'program_id' => $programId,
            'unit_id' => $unitId,
            'export' => 'pdf',
        ]);
    }

    /**
     * Export simulation as Excel.
     */
    public function exportSimulationExcel(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $programId = $request->get('program_id');
        $unitId = $request->get('unit_id');

        // Get simulation data and export as Excel
        // Full implementation would use Laravel Excel

        return redirect()->route('assessor-internal.simulation', [
            'program_id' => $programId,
            'unit_id' => $unitId,
            'export' => 'excel',
        ]);
    }

    /**
     * Map criterion name to category.
     */
    private function mapCriterionToCategory(string $criterionName): string
    {
        $name = strtolower($criterionName);

        if (str_contains($name, 'visi') || str_contains($name, 'misi')) {
            return 'Visi Misi';
        }
        if (str_contains($name, 'tata pamong') || str_contains($name, 'pamong')) {
            return 'Tata Pamong';
        }
        if (str_contains($name, 'sdm') || str_contains($name, 'dosen') || str_contains($name, 'tenaga')) {
            return 'SDM Dosen';
        }
        if (str_contains($name, 'mahasiswa') || str_contains($name, 'student')) {
            return 'Mahasiswa';
        }
        if (str_contains($name, 'penelitian') || str_contains($name, 'research')) {
            return 'Penelitian';
        }
        if (str_contains($name, 'pengabdian') || str_contains($name, 'masyarakat') || str_contains($name, 'community')) {
            return 'Pengabdian Masyarakat';
        }
        if (str_contains($name, 'kerjasama') || str_contains($name, 'cooperation') || str_contains($name, 'partnership')) {
            return 'Kerjasama';
        }
        if (str_contains($name, 'luaran') || str_contains($name, 'dampak') || str_contains($name, 'outcome') || str_contains($name, 'impact')) {
            return 'Luaran & Dampak';
        }

        return 'Lainnya';
    }

    /**
     * Get indicators status from evaluations.
     */
    private function getIndicatorsStatus($evaluations): array
    {
        $indicators = [
            'fulfilled' => 0,
            'not_fulfilled' => 0,
            'total' => $evaluations->count(),
        ];

        foreach ($evaluations as $evaluation) {
            if ($evaluation->evaluation_status === 'passed' || ($evaluation->score ?? 0) >= 2.5) {
                $indicators['fulfilled']++;
            } else {
                $indicators['not_fulfilled']++;
            }
        }

        return $indicators;
    }

    /**
     * Convert score to grade.
     */
    private function convertToGrade(float $score): string
    {
        if ($score >= 3.5) {
            return 'Unggul';
        }
        if ($score >= 3.0) {
            return 'Baik Sekali';
        }
        if ($score >= 2.5) {
            return 'Baik';
        }
        if ($score >= 2.0) {
            return 'Cukup';
        }

        return 'Kurang';
    }

    /**
     * Convert score to BAN-PT grade.
     */
    private function convertToBANPTGrade(float $score): string
    {
        if ($score >= 3.5) {
            return 'A';
        }
        if ($score >= 2.5) {
            return 'B';
        }
        if ($score >= 1.5) {
            return 'C';
        }

        return 'D';
    }

    /**
     * Analyze gaps in criteria.
     */
    private function analyzeGaps(array $criteriaBreakdown): array
    {
        $lowScores = [];
        $largeGaps = [];
        $improvementOpportunities = [];

        foreach ($criteriaBreakdown as $category => $criteria) {
            foreach ($criteria as $criterion) {
                // Low scores (< 2.5)
                if ($criterion['score'] < 2.5) {
                    $lowScores[] = [
                        'category' => $category,
                        'criterion' => $criterion['criterion_name'],
                        'score' => $criterion['score'],
                    ];
                }

                // Large gaps (score < 3.0 but weight is high)
                if ($criterion['score'] < 3.0 && $criterion['weight'] > 0.1) {
                    $largeGaps[] = [
                        'category' => $category,
                        'criterion' => $criterion['criterion_name'],
                        'score' => $criterion['score'],
                        'weight' => $criterion['weight'],
                        'potential_improvement' => round(3.5 - $criterion['score'], 2),
                    ];
                }

                // Improvement opportunities (score between 2.5-3.5)
                if ($criterion['score'] >= 2.5 && $criterion['score'] < 3.5) {
                    $improvementOpportunities[] = [
                        'category' => $category,
                        'criterion' => $criterion['criterion_name'],
                        'score' => $criterion['score'],
                        'potential_improvement' => round(3.5 - $criterion['score'], 2),
                    ];
                }
            }
        }

        return [
            'low_scores' => $lowScores,
            'large_gaps' => $largeGaps,
            'improvement_opportunities' => $improvementOpportunities,
        ];
    }
}
