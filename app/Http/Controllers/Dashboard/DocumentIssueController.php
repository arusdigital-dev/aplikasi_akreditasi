<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentHistory;
use App\Models\Program;
use App\Models\Unit;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentIssueController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * Display the document issues index page.
     */
    public function index(Request $request): Response
    {
        $query = Document::query()
            ->with([
                'assignment.criterion.standard.program',
                'assignment.assessor',
                'assignment.unit',
                'program',
                'unit',
                'uploadedBy',
                'rejectedBy',
            ])
            ->where('issue_status', '!=', 'resolved');

        // Filters
        if ($request->filled('fakultas')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('program', fn ($subQ) => $subQ->where('fakultas', $request->fakultas))
                    ->orWhereHas('assignment.criterion.standard.program', fn ($subQ) => $subQ->where('fakultas', $request->fakultas));
            });
        }

        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('issue_type')) {
            $query->where('issue_type', $request->issue_type);
        }

        if ($request->filled('issue_status')) {
            $query->where('issue_status', $request->issue_status);
        }

        $documents = $query->latest()->paginate(20);

        $programs = Program::orderBy('name')->get(['id', 'name', 'fakultas']);
        $units = Unit::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $fakultas = Program::distinct()->pluck('fakultas')->filter()->sort()->values();

        // Get years from documents
        $years = Document::distinct()->pluck('year')->filter()->sortDesc()->values();

        return Inertia::render('Dashboard/Documents/Issues/Index', [
            'documents' => $documents,
            'programs' => $programs,
            'units' => $units,
            'fakultas' => $fakultas,
            'years' => $years,
            'filters' => $request->only(['fakultas', 'program_id', 'year', 'category', 'issue_type', 'issue_status']),
        ]);
    }

    /**
     * Show document detail.
     */
    public function show(string $id): Response
    {
        $document = Document::with([
            'assignment.criterion.standard.program',
            'assignment.assessor',
            'assignment.unit',
            'program',
            'unit',
            'uploadedBy',
            'rejectedBy',
            'validatedBy',
            'histories.user',
        ])->findOrFail($id);

        return Inertia::render('Dashboard/Documents/Issues/Show', [
            'document' => $document,
        ]);
    }

    /**
     * Send notification to Prodi/Dosen.
     */
    public function sendNotification(Request $request, string $id)
    {
        $document = Document::with(['assignment.unit.usersWithRoles', 'program'])->findOrFail($id);

        $validated = $request->validate([
            'message' => 'nullable|string|max:1000',
        ]);

        $message = $validated['message'] ?? "Dokumen {$document->file_name} memiliki masalah: {$document->issue_type}. Silakan perbaiki segera.";

        // Send to unit users
        if ($document->unit_id && $document->assignment?->unit) {
            $users = $document->assignment->unit->usersWithRoles()->get();
            foreach ($users as $user) {
                $this->notificationService->sendToUser(
                    user: $user,
                    type: \App\Models\NotificationType::DocumentIssue,
                    title: 'Dokumen Bermasalah',
                    message: $message,
                    data: [
                        'document_id' => $document->id,
                        'issue_type' => $document->issue_type,
                    ]
                );
            }
        }

        // Log history
        DocumentHistory::create([
            'document_id' => $document->id,
            'action' => 'notify',
            'user_id' => Auth::id(),
            'notes' => 'Notifikasi dikirim ke Prodi/Dosen',
        ]);

        return back()->with('success', 'Notifikasi berhasil dikirim');
    }

    /**
     * Update document metadata.
     */
    public function updateMetadata(Request $request, string $id)
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'year' => 'nullable|integer|min:2000|max:2100',
            'category' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
            'expired_at' => 'nullable|date',
        ]);

        $oldData = $document->only(['year', 'category', 'metadata', 'expired_at']);

        $document->update($validated);

        // Log history
        DocumentHistory::create([
            'document_id' => $document->id,
            'action' => 'update_metadata',
            'user_id' => Auth::id(),
            'notes' => 'Metadata dokumen diperbarui',
            'changes' => [
                'old' => $oldData,
                'new' => $document->only(['year', 'category', 'metadata', 'expired_at']),
            ],
        ]);

        return back()->with('success', 'Metadata berhasil diperbarui');
    }

    /**
     * Download document.
     */
    public function download(string $id)
    {
        $document = Document::findOrFail($id);

        if (! Storage::disk('public')->exists($document->file_path)) {
            return back()->withErrors(['error' => 'File tidak ditemukan']);
        }

        // Log history
        DocumentHistory::create([
            'document_id' => $document->id,
            'action' => 'download',
            'user_id' => Auth::id(),
            'notes' => 'Dokumen diunduh',
        ]);

        return response()->download(
            Storage::disk('public')->path($document->file_path),
            $document->file_name
        );
    }

    /**
     * Resolve document issue.
     */
    public function resolve(Request $request, string $id)
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $document->update([
            'issue_status' => 'resolved',
        ]);

        // Log history
        DocumentHistory::create([
            'document_id' => $document->id,
            'action' => 'resolve',
            'user_id' => Auth::id(),
            'notes' => $validated['notes'] ?? 'Masalah dokumen diselesaikan',
        ]);

        return back()->with('success', 'Masalah dokumen telah diselesaikan');
    }

    /**
     * Reject document.
     */
    public function reject(Request $request, string $id)
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'rejection_notes' => 'required|string|max:1000',
        ]);

        $document->update([
            'issue_status' => 'rejected',
            'rejection_notes' => $validated['rejection_notes'],
            'rejected_by' => Auth::id(),
        ]);

        // Log history
        DocumentHistory::create([
            'document_id' => $document->id,
            'action' => 'reject',
            'user_id' => Auth::id(),
            'notes' => $validated['rejection_notes'],
        ]);

        return back()->with('success', 'Dokumen ditolak');
    }
}
