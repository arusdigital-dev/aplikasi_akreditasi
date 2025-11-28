<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\Unit;
use App\Models\User;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService
    ) {}

    /**
     * Display the report generator index page.
     */
    public function index(Request $request): Response
    {
        $programs = Program::orderBy('name')->get(['id', 'name', 'fakultas', 'jenjang']);
        $units = Unit::where('is_active', true)->orderBy('name')->get(['id', 'name', 'type']);
        $assessors = User::whereHas('assignments')->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Dashboard/Reports/Index', [
            'programs' => $programs,
            'units' => $units,
            'assessors' => $assessors,
        ]);
    }

    /**
     * Preview document completeness report data.
     */
    public function previewDocumentCompleteness(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:fakultas,prodi,unit,criteria',
            'program_id' => 'nullable|exists:programs,id',
            'unit_id' => 'nullable|exists:units,id',
            'criterion_id' => 'nullable|exists:criteria,id',
        ]);

        try {
            $data = $this->reportService->getDocumentCompletenessData(
                type: $validated['type'],
                programId: $validated['program_id'] ?? null,
                unitId: $validated['unit_id'] ?? null,
                criterionId: $validated['criterion_id'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => $data,
                'generated_at' => now()->format('d F Y H:i:s'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Gagal mengambil data laporan: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate and download document completeness report.
     */
    public function generateDocumentCompleteness(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:fakultas,prodi,unit,criteria',
            'program_id' => 'nullable|exists:programs,id',
            'unit_id' => 'nullable|exists:units,id',
            'criterion_id' => 'nullable|exists:criteria,id',
            'format' => 'required|in:pdf,excel,word',
        ]);

        try {
            $filename = $this->reportService->generateDocumentCompletenessReport(
                type: $validated['type'],
                programId: $validated['program_id'] ?? null,
                unitId: $validated['unit_id'] ?? null,
                criterionId: $validated['criterion_id'] ?? null,
                format: $validated['format']
            );

            $filePath = Storage::disk('public')->path($filename);
            
            if (! file_exists($filePath)) {
                return back()->withErrors(['error' => 'File laporan tidak ditemukan']);
            }

            return response()->download($filePath, basename($filename))->deleteFileAfterSend(false);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal membuat laporan: '.$e->getMessage()]);
        }
    }

    /**
     * Generate and download assessor evaluation report.
     */
    public function generateAssessorEvaluation(Request $request)
    {
        $validated = $request->validate([
            'assessor_id' => 'nullable|exists:users,id',
            'program_id' => 'nullable|exists:programs,id',
            'format' => 'required|in:pdf,excel,word',
        ]);

        try {
            $filename = $this->reportService->generateAssessorEvaluationReport(
                assessorId: $validated['assessor_id'] ?? null,
                programId: $validated['program_id'] ?? null,
                format: $validated['format']
            );

            $filePath = Storage::disk('public')->path($filename);

            if (! file_exists($filePath)) {
                return back()->withErrors(['error' => 'File laporan tidak ditemukan']);
            }

            return response()->download($filePath, basename($filename))->deleteFileAfterSend(false);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal membuat laporan: '.$e->getMessage()]);
        }
    }

    /**
     * Generate and download executive report.
     */
    public function generateExecutive(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'nullable|exists:programs,id',
            'format' => 'required|in:pdf,excel,word',
        ]);

        try {
            $filename = $this->reportService->generateExecutiveReport(
                programId: $validated['program_id'] ?? null,
                format: $validated['format']
            );

            $filePath = Storage::disk('public')->path($filename);

            if (! file_exists($filePath)) {
                return back()->withErrors(['error' => 'File laporan tidak ditemukan']);
            }

            return response()->download($filePath, basename($filename))->deleteFileAfterSend(false);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal membuat laporan: '.$e->getMessage()]);
        }
    }
}
