<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentStatus;
use App\Models\Criterion;
use App\Models\Evaluation;
use App\Models\Program;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatisticsController extends Controller
{
    /**
     * Display the statistics dashboard.
     */
    public function index(Request $request): Response
    {
        // Get document completeness statistics
        $documentStats = $this->getDocumentCompletenessStats();

        // Get assessor evaluation statistics
        $assessorStats = $this->getAssessorEvaluationStats();

        // Get accreditation recap
        $accreditationRecap = $this->getAccreditationRecap();

        return Inertia::render('Dashboard/Statistics/Index', [
            'documentStats' => $documentStats,
            'assessorStats' => $assessorStats,
            'accreditationRecap' => $accreditationRecap,
        ]);
    }

    /**
     * Get document completeness statistics.
     *
     * @return array<string, mixed>
     */
    private function getDocumentCompletenessStats(): array
    {
        // Document growth chart data (last 6 months)
        $growthData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            // Count assignments created in this month
            $count = Assignment::whereBetween('created_at', [$monthStart, $monthEnd])
                ->whereNull('unassigned_at')
                ->count();

            $growthData[] = [
                'month' => $date->format('M Y'),
                'count' => $count,
            ];
        }

        // Programs with slowest progress (lowest completion rate)
        $slowPrograms = Program::query()
            ->with(['standards.criteria.assignments' => function ($q) {
                $q->whereNull('unassigned_at');
            }])
            ->get()
            ->map(function ($program) {
                $totalCriteria = 0;
                $completedCriteria = 0;

                foreach ($program->standards as $standard) {
                    foreach ($standard->criteria as $criterion) {
                        $totalCriteria++;
                        $hasCompleted = $criterion->assignments()
                            ->whereNull('unassigned_at')
                            ->where('status', AssignmentStatus::Completed)
                            ->exists();
                        if ($hasCompleted) {
                            $completedCriteria++;
                        }
                    }
                }

                $completionRate = $totalCriteria > 0 ? ($completedCriteria / $totalCriteria) * 100 : 0;

                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'fakultas' => $program->fakultas,
                    'completion_rate' => round($completionRate, 1),
                    'total_criteria' => $totalCriteria,
                    'completed_criteria' => $completedCriteria,
                ];
            })
            ->sortBy('completion_rate')
            ->take(10)
            ->values();

        // Problem documents indicator (assignments with issues)
        $problemDocuments = Assignment::query()
            ->whereNull('unassigned_at')
            ->where(function ($q) {
                // Overdue assignments
                $q->where(function ($subQ) {
                    $subQ->whereNotNull('deadline')
                        ->where('deadline', '<', Carbon::today())
                        ->where('status', '!=', AssignmentStatus::Completed);
                })
                // Or assignments pending for more than 30 days
                    ->orWhere(function ($subQ) {
                        $subQ->where('status', AssignmentStatus::Pending)
                            ->where('assigned_date', '<', Carbon::now()->subDays(30));
                    });
            })
            ->with(['criterion.standard.program', 'assessor', 'unit'])
            ->get()
            ->map(function ($assignment) {
                $issueType = 'Unknown';
                if ($assignment->deadline && $assignment->deadline < Carbon::today() && $assignment->status !== AssignmentStatus::Completed) {
                    $issueType = 'Terlambat';
                } elseif ($assignment->status === AssignmentStatus::Pending && $assignment->assigned_date < Carbon::now()->subDays(30)) {
                    $issueType = 'Pending Lama';
                }

                return [
                    'id' => $assignment->id,
                    'program_name' => $assignment->criterion?->standard?->program?->name ?? $assignment->unit?->name ?? 'N/A',
                    'criterion_name' => $assignment->criterion?->name ?? 'N/A',
                    'assessor_name' => $assignment->assessor?->name ?? 'N/A',
                    'issue_type' => $issueType,
                    'deadline' => $assignment->deadline instanceof Carbon ? $assignment->deadline->format('Y-m-d') : ($assignment->deadline ? Carbon::parse($assignment->deadline)->format('Y-m-d') : null),
                    'assigned_date' => $assignment->assigned_date instanceof Carbon ? $assignment->assigned_date->format('Y-m-d') : ($assignment->assigned_date ? Carbon::parse($assignment->assigned_date)->format('Y-m-d') : null),
                ];
            });

        return [
            'growth_chart' => $growthData,
            'slow_programs' => $slowPrograms,
            'problem_documents' => $problemDocuments,
            'total_problem_documents' => $problemDocuments->count(),
        ];
    }

    /**
     * Get assessor evaluation statistics.
     *
     * @return array<string, mixed>
     */
    private function getAssessorEvaluationStats(): array
    {
        // Average score per faculty
        $facultyScores = Program::query()
            ->with(['standards.criteria.criteriaPoints.evaluations'])
            ->get()
            ->groupBy('fakultas')
            ->map(function ($programs, $fakultas) {
                $totalScore = 0;
                $totalEvaluations = 0;

                foreach ($programs as $program) {
                    foreach ($program->standards as $standard) {
                        foreach ($standard->criteria as $criterion) {
                            foreach ($criterion->criteriaPoints as $point) {
                                $avgScore = $point->evaluations()->avg('score');
                                if ($avgScore !== null) {
                                    $totalScore += $avgScore;
                                    $totalEvaluations++;
                                }
                            }
                        }
                    }
                }

                $averageScore = $totalEvaluations > 0 ? $totalScore / $totalEvaluations : 0;

                return [
                    'fakultas' => $fakultas,
                    'average_score' => round($averageScore, 2),
                    'total_evaluations' => $totalEvaluations,
                ];
            })
            ->values();

        // Criteria with lowest scores
        $lowScoreCriteria = Criterion::query()
            ->with(['criteriaPoints.evaluations', 'standard.program'])
            ->get()
            ->map(function ($criterion) {
                $scores = [];
                foreach ($criterion->criteriaPoints as $point) {
                    $avgScore = $point->evaluations()->avg('score');
                    if ($avgScore !== null) {
                        $scores[] = $avgScore;
                    }
                }

                $averageScore = count($scores) > 0 ? array_sum($scores) / count($scores) : null;

                return [
                    'id' => $criterion->id,
                    'name' => $criterion->name,
                    'program_name' => $criterion->standard?->program?->name ?? 'N/A',
                    'average_score' => $averageScore !== null ? round($averageScore, 2) : null,
                    'max_score' => $criterion->criteriaPoints->sum('max_score'),
                ];
            })
            ->filter(function ($item) {
                return $item['average_score'] !== null;
            })
            ->sortBy('average_score')
            ->take(10)
            ->values();

        // Reviewers who haven't completed evaluations
        $incompleteReviewers = Assignment::query()
            ->whereNull('unassigned_at')
            ->where('status', '!=', AssignmentStatus::Completed)
            ->with(['assessor', 'criterion.standard.program'])
            ->get()
            ->groupBy('assessor_id')
            ->map(function ($assignments, $assessorId) {
                $assessor = $assignments->first()->assessor;
                $total = $assignments->count();
                $completed = $assignments->where('status', AssignmentStatus::Completed)->count();

                return [
                    'id' => $assessorId,
                    'name' => $assessor?->name ?? 'Unknown',
                    'email' => $assessor?->email ?? 'N/A',
                    'total_assignments' => $total,
                    'completed_assignments' => $completed,
                    'pending_assignments' => $total - $completed,
                    'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
                ];
            })
            ->sortByDesc('pending_assignments')
            ->take(10)
            ->values();

        return [
            'faculty_scores' => $facultyScores,
            'low_score_criteria' => $lowScoreCriteria,
            'incomplete_reviewers' => $incompleteReviewers,
        ];
    }

    /**
     * Get accreditation recap with gap analysis.
     *
     * @return array<string, mixed>
     */
    private function getAccreditationRecap(): array
    {
        // Get total scores per program
        $programScores = Program::query()
            ->with(['standards.criteria.criteriaPoints.evaluations'])
            ->get()
            ->map(function ($program) {
                $totalScore = 0;
                $maxScore = 0;
                $criteriaDetails = [];

                foreach ($program->standards as $standard) {
                    foreach ($standard->criteria as $criterion) {
                        $criterionScore = 0;
                        $criterionMax = 0;

                        foreach ($criterion->criteriaPoints as $point) {
                            $avgScore = $point->evaluations()->avg('score') ?? 0;
                            $criterionScore += $avgScore;
                            $criterionMax += $point->max_score;
                        }

                        $totalScore += $criterionScore;
                        $maxScore += $criterionMax;

                        $criteriaDetails[] = [
                            'id' => $criterion->id,
                            'name' => $criterion->name,
                            'score' => round($criterionScore, 2),
                            'max_score' => $criterionMax,
                            'percentage' => $criterionMax > 0 ? round(($criterionScore / $criterionMax) * 100, 1) : 0,
                        ];
                    }
                }

                $percentage = $maxScore > 0 ? ($totalScore / $maxScore) * 100 : 0;

                // Identify strong and weak criteria
                $strongCriteria = collect($criteriaDetails)
                    ->where('percentage', '>=', 80)
                    ->sortByDesc('percentage')
                    ->take(5)
                    ->values();

                $weakCriteria = collect($criteriaDetails)
                    ->where('percentage', '<', 60)
                    ->sortBy('percentage')
                    ->take(5)
                    ->values();

                // Generate suggestions
                $suggestions = [];
                if ($weakCriteria->isNotEmpty()) {
                    $weakCriterion = $weakCriteria->first();
                    $suggestions[] = "Perlu peningkatan pada kriteria: {$weakCriterion['name']} (skor: {$weakCriterion['percentage']}%)";
                }
                if ($percentage < 70) {
                    $suggestions[] = 'Program perlu meningkatkan keseluruhan skor akreditasi (saat ini: '.round($percentage, 1).'%)';
                }

                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'fakultas' => $program->fakultas,
                    'jenjang' => $program->jenjang,
                    'total_score' => round($totalScore, 2),
                    'max_score' => $maxScore,
                    'percentage' => round($percentage, 1),
                    'criteria_details' => $criteriaDetails,
                    'strong_criteria' => $strongCriteria,
                    'weak_criteria' => $weakCriteria,
                    'suggestions' => $suggestions,
                ];
            })
            ->sortByDesc('percentage')
            ->values();

        return [
            'program_scores' => $programScores,
        ];
    }
}
