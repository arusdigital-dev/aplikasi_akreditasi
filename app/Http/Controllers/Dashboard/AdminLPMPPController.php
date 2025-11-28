<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Criterion;
use App\Models\Program;
use App\Models\Unit;
use App\Models\UnitType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminLPMPPController extends Controller
{
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
                    'assessor_name' => 'Asesor #'.$assignment->assessor_id, // TODO: Get from User model
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

        return Inertia::render('Dashboard/AdminLPMPP', [
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
            $totalCriteria = $program->standards->sum(fn ($standard) => $standard->criteria->count());
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
            ->with(['children' => function ($query) {
                $query->where('type', UnitType::Prodi)->where('is_active', true);
            }])
            ->get();

        return $fakultas->map(function ($fakultas) {
            // Get programs for this fakultas (based on program.fakultas field)
            $programs = Program::where('fakultas', $fakultas->name)->get();

            $totalCriteria = 0;
            $completedCriteria = 0;

            foreach ($programs as $program) {
                $program->load(['standards.criteria.assignments']);
                $totalCriteria += $program->standards->sum(fn ($standard) => $standard->criteria->count());
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
            $totalCriteria = $program->standards->sum(fn ($standard) => $standard->criteria->count());
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
}
