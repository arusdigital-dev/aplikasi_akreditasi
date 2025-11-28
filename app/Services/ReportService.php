<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\AssignmentStatus;
use App\Models\Evaluation;
use App\Models\Program;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ReportService
{
    /**
     * Generate document completeness report.
     */
    public function generateDocumentCompletenessReport(
        string $type,
        ?string $programId = null,
        ?string $unitId = null,
        ?string $criterionId = null,
        string $format = 'pdf'
    ): string {
        $data = $this->getDocumentCompletenessData($type, $programId, $unitId, $criterionId);

        return match ($format) {
            'pdf' => $this->generatePDF('reports.document-completeness', $data, 'Laporan Kelengkapan Dokumen'),
            'excel' => $this->generateExcel('DocumentCompletenessExport', $data, 'Laporan Kelengkapan Dokumen'),
            'word' => $this->generateWord('document-completeness', $data, 'Laporan Kelengkapan Dokumen'),
            default => throw new \InvalidArgumentException("Format {$format} tidak didukung"),
        };
    }

    /**
     * Generate assessor evaluation report.
     */
    public function generateAssessorEvaluationReport(
        ?string $assessorId = null,
        ?string $programId = null,
        string $format = 'pdf'
    ): string {
        $data = $this->getAssessorEvaluationData($assessorId, $programId);

        return match ($format) {
            'pdf' => $this->generatePDF('reports.assessor-evaluation', $data, 'Laporan Penilaian Asesor'),
            'excel' => $this->generateExcel('AssessorEvaluationExport', $data, 'Laporan Penilaian Asesor'),
            'word' => $this->generateWord('assessor-evaluation', $data, 'Laporan Penilaian Asesor'),
            default => throw new \InvalidArgumentException("Format {$format} tidak didukung"),
        };
    }

    /**
     * Generate executive university report.
     */
    public function generateExecutiveReport(
        ?string $programId = null,
        string $format = 'pdf'
    ): string {
        $data = $this->getExecutiveReportData($programId);

        return match ($format) {
            'pdf' => $this->generatePDF('reports.executive', $data, 'Laporan Eksekutif Universitas'),
            'excel' => $this->generateExcel('ExecutiveReportExport', $data, 'Laporan Eksekutif Universitas'),
            'word' => $this->generateWord('executive', $data, 'Laporan Eksekutif Universitas'),
            default => throw new \InvalidArgumentException("Format {$format} tidak didukung"),
        };
    }

    /**
     * Get document completeness data (public method for preview).
     */
    public function getDocumentCompletenessData(
        string $type,
        ?string $programId = null,
        ?string $unitId = null,
        ?string $criterionId = null
    ): array {
        $query = Assignment::query()
            ->with(['criterion.standard.program', 'unit', 'assessor'])
            ->whereNull('unassigned_at');

        if ($programId) {
            $query->whereHas('criterion.standard', fn ($q) => $q->where('program_id', $programId));
        }

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        if ($criterionId) {
            $query->where('criteria_id', $criterionId);
        }

        $assignments = $query->get();

        $grouped = match ($type) {
            'fakultas' => $this->groupByFakultas($assignments),
            'prodi' => $this->groupByProdi($assignments),
            'unit' => $this->groupByUnit($assignments),
            'criteria' => $this->groupByCriteria($assignments),
            default => throw new \InvalidArgumentException("Type {$type} tidak didukung"),
        };

        return [
            'type' => $type,
            'data' => $grouped,
            'summary' => $this->calculateCompletenessSummary($assignments),
        ];
    }

    /**
     * Get assessor evaluation data.
     */
    private function getAssessorEvaluationData(?string $assessorId = null, ?string $programId = null): array
    {
        $query = Evaluation::query()
            ->with([
                'assignment.criterion.standard.program',
                'assignment.assessor',
                'assignment.unit',
                'criteriaPoint',
            ]);

        if ($assessorId) {
            $query->where('assessor_id', $assessorId);
        }

        if ($programId) {
            $query->whereHas('assignment.criterion.standard', fn ($q) => $q->where('program_id', $programId));
        }

        $evaluations = $query->get();

        $grouped = $evaluations->groupBy(function ($evaluation) {
            return $evaluation->assignment->assessor->name ?? 'N/A';
        });

        $summary = [
            'total_evaluations' => $evaluations->count(),
            'total_score' => $evaluations->sum('score') ?? 0,
            'average_score' => $evaluations->avg('score') ?? 0,
            'assessors' => $grouped->map(fn ($group) => [
                'name' => $group->first()->assignment->assessor->name ?? 'N/A',
                'total_evaluations' => $group->count(),
                'total_score' => $group->sum('score') ?? 0,
                'average_score' => $group->avg('score') ?? 0,
            ]),
        ];

        return [
            'evaluations' => $evaluations,
            'summary' => $summary,
        ];
    }

    /**
     * Get executive report data.
     */
    private function getExecutiveReportData(?string $programId = null): array
    {
        $query = Program::query()->with(['standards.criteria.assignments.evaluations']);

        if ($programId) {
            $query->where('id', $programId);
        }

        $programs = $query->get();

        $overallStats = [
            'total_programs' => $programs->count(),
            'total_standards' => $programs->sum(fn ($p) => $p->standards->count()),
            'total_criteria' => $programs->sum(fn ($p) => $p->standards->sum(fn ($s) => $s->criteria->count())),
            'total_assignments' => $programs->sum(fn ($p) => $p->standards->sum(fn ($s) => $s->criteria->sum(fn ($c) => $c->assignments->count()))),
            'completed_assignments' => $programs->sum(fn ($p) => $p->standards->sum(fn ($s) => $s->criteria->sum(fn ($c) => $c->assignments->where('status', AssignmentStatus::Completed)->count()))),
        ];

        $readinessScore = $overallStats['total_assignments'] > 0
            ? ($overallStats['completed_assignments'] / $overallStats['total_assignments']) * 100
            : 0;

        $risks = $this->identifyRisks($programs);

        return [
            'programs' => $programs,
            'overall_stats' => $overallStats,
            'readiness_score' => round($readinessScore, 2),
            'risks' => $risks,
        ];
    }

    /**
     * Group assignments by fakultas.
     */
    private function groupByFakultas(Collection $assignments): Collection
    {
        return $assignments->groupBy(function ($assignment) {
            return $assignment->criterion?->standard?->program?->fakultas ?? 'N/A';
        })->map(function ($group, $fakultas) {
            return [
                'name' => $fakultas ?? 'N/A',
                'total' => $group->count(),
                'completed' => $group->where('status', AssignmentStatus::Completed)->count(),
                'in_progress' => $group->where('status', AssignmentStatus::InProgress)->count(),
                'pending' => $group->where('status', AssignmentStatus::Pending)->count(),
                'assignments' => $group,
            ];
        });
    }

    /**
     * Group assignments by prodi.
     */
    private function groupByProdi(Collection $assignments): Collection
    {
        return $assignments->groupBy(function ($assignment) {
            return $assignment->criterion?->standard?->program?->name ?? 'N/A';
        })->map(function ($group, $prodi) {
            return [
                'name' => $prodi ?? 'N/A',
                'total' => $group->count(),
                'completed' => $group->where('status', AssignmentStatus::Completed)->count(),
                'in_progress' => $group->where('status', AssignmentStatus::InProgress)->count(),
                'pending' => $group->where('status', AssignmentStatus::Pending)->count(),
                'assignments' => $group,
            ];
        });
    }

    /**
     * Group assignments by unit.
     */
    private function groupByUnit(Collection $assignments): Collection
    {
        return $assignments->groupBy(function ($assignment) {
            return $assignment->unit?->name ?? 'N/A';
        })->map(function ($group, $unit) {
            return [
                'name' => $unit ?? 'N/A',
                'total' => $group->count(),
                'completed' => $group->where('status', AssignmentStatus::Completed)->count(),
                'in_progress' => $group->where('status', AssignmentStatus::InProgress)->count(),
                'pending' => $group->where('status', AssignmentStatus::Pending)->count(),
                'assignments' => $group,
            ];
        });
    }

    /**
     * Group assignments by criteria.
     */
    private function groupByCriteria(Collection $assignments): Collection
    {
        return $assignments->groupBy(function ($assignment) {
            return $assignment->criterion?->name ?? 'N/A';
        })->map(function ($group, $criteria) {
            return [
                'name' => $criteria ?? 'N/A',
                'total' => $group->count(),
                'completed' => $group->where('status', AssignmentStatus::Completed)->count(),
                'in_progress' => $group->where('status', AssignmentStatus::InProgress)->count(),
                'pending' => $group->where('status', AssignmentStatus::Pending)->count(),
                'assignments' => $group,
            ];
        });
    }

    /**
     * Calculate completeness summary.
     */
    private function calculateCompletenessSummary(Collection $assignments): array
    {
        $total = $assignments->count();
        $completed = $assignments->where('status', AssignmentStatus::Completed)->count();
        $inProgress = $assignments->where('status', AssignmentStatus::InProgress)->count();
        $pending = $assignments->where('status', AssignmentStatus::Pending)->count();

        return [
            'total' => $total,
            'completed' => $completed,
            'in_progress' => $inProgress,
            'pending' => $pending,
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Identify risks.
     */
    private function identifyRisks(Collection $programs): array
    {
        $risks = [];

        foreach ($programs as $program) {
            $totalAssignments = $program->standards->sum(fn ($s) => $s->criteria->sum(fn ($c) => $c->assignments->count()));
            $completedAssignments = $program->standards->sum(fn ($s) => $s->criteria->sum(fn ($c) => $c->assignments->where('status', AssignmentStatus::Completed)->count()));

            if ($totalAssignments > 0) {
                $completionRate = ($completedAssignments / $totalAssignments) * 100;

                if ($completionRate < 50) {
                    $risks[] = [
                        'type' => 'low_completion',
                        'program' => $program->name,
                        'message' => "Program {$program->name} memiliki tingkat kelengkapan rendah ({$completionRate}%)",
                        'severity' => 'high',
                    ];
                }

                // Check for overdue assignments
                $overdue = $program->standards->sum(fn ($s) => $s->criteria->sum(fn ($c) => $c->assignments->where('deadline', '<', now())->where('status', '!=', AssignmentStatus::Completed)->count()));

                if ($overdue > 0) {
                    $risks[] = [
                        'type' => 'overdue',
                        'program' => $program->name,
                        'message' => "Program {$program->name} memiliki {$overdue} penugasan yang melewati deadline",
                        'severity' => 'medium',
                    ];
                }
            }
        }

        return $risks;
    }

    /**
     * Generate PDF report.
     */
    private function generatePDF(string $view, array $data, string $title): string
    {
        $data['title'] = $title;
        $data['generated_at'] = now()->format('d F Y H:i:s');

        try {
            $data['qr_code'] = $this->generateQRCode($title.' - '.now()->toDateTimeString());
        } catch (\Exception $e) {
            $data['qr_code'] = null;
        }

        $pdf = Pdf::loadView($view, $data);
        $pdf->setPaper('a4', 'portrait');
        $pdf->setOption('enable-local-file-access', true);

        $filename = 'reports/'.strtolower(str_replace(' ', '-', $title)).'-'.now()->format('Y-m-d-His').'.pdf';
        Storage::disk('public')->put($filename, $pdf->output());

        return $filename;
    }

    /**
     * Generate Excel report.
     */
    private function generateExcel(string $exportClass, array $data, string $title): string
    {
        // This will be implemented with Laravel Excel export class
        $filename = 'reports/'.strtolower(str_replace(' ', '-', $title)).'-'.now()->format('Y-m-d-His').'.xlsx';

        // For now, return placeholder
        // TODO: Implement Excel export classes

        return $filename;
    }

    /**
     * Generate Word report.
     */
    private function generateWord(string $template, array $data, string $title): string
    {
        $phpWord = new PhpWord;
        $section = $phpWord->addSection();

        // Add header
        $section->addText($title, ['bold' => true, 'size' => 16]);
        $section->addTextBreak(1);
        $section->addText('Dibuat pada: '.now()->format('d F Y H:i:s'), ['size' => 10]);
        $section->addTextBreak(2);

        // Add content based on template
        // TODO: Implement full Word template

        $filename = 'reports/'.strtolower(str_replace(' ', '-', $title)).'-'.now()->format('Y-m-d-His').'.docx';
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save(storage_path('app/public/'.$filename));

        return $filename;
    }

    /**
     * Generate QR code.
     */
    private function generateQRCode(string $data): string
    {
        $qrCode = QrCode::format('png')
            ->size(200)
            ->generate($data);

        $filename = 'qrcodes/'.md5($data).'.png';
        Storage::disk('public')->put($filename, $qrCode);

        return Storage::disk('public')->path($filename);
    }
}
