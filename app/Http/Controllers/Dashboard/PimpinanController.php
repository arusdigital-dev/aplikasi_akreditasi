<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Criterion;
use App\Models\Document;
use App\Models\Program;
use App\Models\Unit;
use App\Models\UnitType;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PimpinanController extends Controller
{
    /**
     * Display the executive dashboard.
     */
    public function dashboard(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $level = $user->getPimpinanLevel();

        // Get accessible units based on level
        $accessibleUnits = $this->getAccessibleUnits($user, $level);
        $accessibleUnitIds = $accessibleUnits->pluck('id')->toArray();

        // Calculate statistics
        $stats = $this->calculateStatistics($user, $level, $accessibleUnitIds);

        // Get progress data for charts
        $progressData = $this->getProgressData($user, $level, $accessibleUnitIds);

        // Get status per fakultas
        $fakultasStatus = $this->getFakultasStatus($user, $level, $accessibleUnitIds);

        // Get status per prodi
        $prodiStatus = $this->getProdiStatus($user, $level, $accessibleUnitIds);

        return Inertia::render('Dashboard/Pimpinan/Index', [
            'level' => $level,
            'userRole' => $this->getUserRoleName($user),
            'stats' => $stats,
            'progressData' => $progressData,
            'fakultasStatus' => $fakultasStatus,
            'prodiStatus' => $prodiStatus,
        ]);
    }

    /**
     * Get accessible units based on pimpinan level.
     */
    private function getAccessibleUnits(User $user, ?string $level)
    {
        if (! $level) {
            return collect();
        }

        return match ($level) {
            'universitas' => Unit::where('is_active', true)
                ->whereIn('type', [UnitType::Fakultas, UnitType::Pascasarjana])
                ->get(),
            'fakultas' => Unit::where('id', $user->unit_id)
                ->where('type', UnitType::Fakultas)
                ->get(),
            'prodi' => Unit::where('id', $user->unit_id)
                ->where('type', UnitType::Prodi)
                ->get(),
            default => collect(),
        };
    }

    /**
     * Calculate dashboard statistics.
     */
    private function calculateStatistics(User $user, ?string $level, array $accessibleUnitIds): array
    {
        // Get all prodi IDs accessible based on level
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        // Count active faculties
        $activeFaculties = match ($level) {
            'universitas' => Unit::where('is_active', true)
                ->where('type', UnitType::Fakultas)
                ->count(),
            'fakultas' => 1, // User's faculty
            'prodi' => 0, // No faculty at prodi level
            default => 0,
        };

        // Count active prodi
        $activeProdi = count($prodiIds);

        // Calculate readiness percentage (aggregated score)
        $readinessPercentage = $this->calculateReadinessPercentage($prodiIds);

        // Count prodi by grade category
        $prodiByGrade = $this->countProdiByGrade($prodiIds);

        // Count problematic documents
        $problematicDocuments = $this->countProblematicDocuments($prodiIds);

        // Count incomplete assessments
        $incompleteAssessments = $this->countIncompleteAssessments($prodiIds);

        return [
            'active_faculties' => $activeFaculties,
            'active_prodi' => $activeProdi,
            'readiness_percentage' => $readinessPercentage,
            'prodi_by_grade' => $prodiByGrade,
            'problematic_documents' => $problematicDocuments,
            'incomplete_assessments' => $incompleteAssessments,
        ];
    }

    /**
     * Get accessible prodi IDs based on level.
     */
    private function getAccessibleProdiIds(User $user, ?string $level, array $accessibleUnitIds): array
    {
        return match ($level) {
            'universitas' => Unit::where('is_active', true)
                ->where('type', UnitType::Prodi)
                ->pluck('id')
                ->toArray(),
            'fakultas' => Unit::where('is_active', true)
                ->where('type', UnitType::Prodi)
                ->where('parent_id', $user->unit_id)
                ->pluck('id')
                ->toArray(),
            'prodi' => [$user->unit_id],
            default => [],
        };
    }

    /**
     * Calculate readiness percentage (aggregated score).
     */
    private function calculateReadinessPercentage(array $prodiIds): float
    {
        if (empty($prodiIds)) {
            return 0;
        }

        // Get all assignments for these prodi
        $assignments = Assignment::whereIn('unit_id', $prodiIds)
            ->whereNull('unassigned_at')
            ->with('evaluations')
            ->get();

        if ($assignments->isEmpty()) {
            return 0;
        }

        $totalScore = 0;
        $totalWeight = 0;

        foreach ($assignments as $assignment) {
            $evaluations = $assignment->evaluations;
            if ($evaluations->isNotEmpty()) {
                $avgScore = $evaluations->avg('score');
                $weight = $assignment->criterion?->weight ?? 1;
                $totalScore += $avgScore * $weight;
                $totalWeight += $weight;
            }
        }

        if ($totalWeight == 0) {
            return 0;
        }

        $averageScore = $totalScore / $totalWeight;

        // Convert to percentage (assuming max score is 4)
        return round(($averageScore / 4) * 100, 2);
    }

    /**
     * Count prodi by grade category.
     */
    private function countProdiByGrade(array $prodiIds): array
    {
        if (empty($prodiIds)) {
            return [
                'unggul' => 0,
                'sangat_baik' => 0,
                'baik' => 0,
                'kurang' => 0,
            ];
        }

        $grades = [
            'unggul' => 0,
            'sangat_baik' => 0,
            'baik' => 0,
            'kurang' => 0,
        ];

        // Get all prodi units
        $prodis = Unit::whereIn('id', $prodiIds)->get();

        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            if ($assignments->isEmpty()) {
                $grades['kurang']++;

                continue;
            }

            // Calculate average score for this prodi
            $totalScore = 0;
            $totalWeight = 0;

            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            if ($totalWeight == 0) {
                $grades['kurang']++;

                continue;
            }

            $averageScore = $totalScore / $totalWeight;

            // Categorize by grade
            if ($averageScore >= 3.5) {
                $grades['unggul']++;
            } elseif ($averageScore >= 3.0) {
                $grades['sangat_baik']++;
            } elseif ($averageScore >= 2.5) {
                $grades['baik']++;
            } else {
                $grades['kurang']++;
            }
        }

        return $grades;
    }

    /**
     * Count problematic documents.
     */
    private function countProblematicDocuments(array $prodiIds): int
    {
        if (empty($prodiIds)) {
            return 0;
        }

        return Document::whereIn('unit_id', $prodiIds)
            ->where(function ($q) {
                $q->where('issue_status', '!=', 'resolved')
                    ->orWhereNotNull('rejected_by')
                    ->orWhere(function ($subQ) {
                        $subQ->whereNotNull('expired_at')
                            ->where('expired_at', '<', now());
                    });
            })
            ->count();
    }

    /**
     * Count incomplete assessments.
     */
    private function countIncompleteAssessments(array $prodiIds): int
    {
        if (empty($prodiIds)) {
            return 0;
        }

        return Assignment::whereIn('unit_id', $prodiIds)
            ->whereNull('unassigned_at')
            ->where(function ($q) {
                $q->whereHas('evaluations', function ($subQ) {
                    $subQ->whereNull('evaluation_status');
                })
                    ->orWhereDoesntHave('evaluations');
            })
            ->count();
    }

    /**
     * Get user role name.
     */
    private function getUserRoleName(User $user): string
    {
        if ($user->isRektor()) {
            return 'Rektor';
        }
        if ($user->isWakilRektor()) {
            return 'Wakil Rektor';
        }
        if ($user->isDekan()) {
            return 'Dekan';
        }
        if ($user->isWakilDekan()) {
            return 'Wakil Dekan';
        }
        if ($user->isKajur()) {
            return 'Kajur';
        }

        return 'Pimpinan';
    }

    /**
     * Get progress data for charts (line chart per week, stacked bar per fakultas).
     */
    private function getProgressData(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [
                'weekly_progress' => [],
                'fakultas_document_status' => [],
            ];
        }

        // Weekly progress (line chart) - last 12 weeks
        $weeklyProgress = [];
        $startDate = now()->subWeeks(11)->startOfWeek();
        $endDate = now()->endOfWeek();

        for ($week = $startDate->copy(); $week->lte($endDate); $week->addWeek()) {
            $weekEnd = $week->copy()->endOfWeek();
            $documentsCount = Document::whereIn('unit_id', $prodiIds)
                ->where('created_at', '<=', $weekEnd)
                ->where(function ($q) {
                    $q->whereNull('issue_status')
                        ->orWhere('issue_status', 'resolved');
                })
                ->count();

            $weeklyProgress[] = [
                'week' => $week->format('Y-m-d'),
                'week_label' => $week->format('d M'),
                'count' => $documentsCount,
            ];
        }

        // Fakultas document status (stacked bar chart)
        $fakultasUnits = match ($level) {
            'universitas' => Unit::where('is_active', true)
                ->where('type', UnitType::Fakultas)
                ->get(),
            'fakultas' => Unit::where('id', $user->unit_id)
                ->where('type', UnitType::Fakultas)
                ->get(),
            default => collect(),
        };

        $fakultasDocumentStatus = [];
        foreach ($fakultasUnits as $fakultas) {
            $fakultasProdiIds = Unit::where('parent_id', $fakultas->id)
                ->where('type', UnitType::Prodi)
                ->pluck('id')
                ->toArray();

            if (empty($fakultasProdiIds)) {
                continue;
            }

            $totalDocs = Document::whereIn('unit_id', $fakultasProdiIds)->count();
            $lengkap = Document::whereIn('unit_id', $fakultasProdiIds)
                ->where(function ($q) {
                    $q->whereNull('issue_status')
                        ->orWhere('issue_status', 'resolved');
                })
                ->whereNull('rejected_by')
                ->count();
            $tidakLengkap = Document::whereIn('unit_id', $fakultasProdiIds)
                ->where(function ($q) {
                    $q->whereNull('issue_status')
                        ->orWhere('issue_status', '!=', 'resolved');
                })
                ->whereNull('rejected_by')
                ->count();
            $ditolak = Document::whereIn('unit_id', $fakultasProdiIds)
                ->whereNotNull('rejected_by')
                ->count();
            $menungguRevisi = Document::whereIn('unit_id', $fakultasProdiIds)
                ->where('issue_status', 'pending')
                ->whereNull('rejected_by')
                ->count();

            $fakultasDocumentStatus[] = [
                'fakultas' => $fakultas->name,
                'fakultas_id' => $fakultas->id,
                'lengkap' => $lengkap,
                'tidak_lengkap' => $tidakLengkap,
                'ditolak' => $ditolak,
                'menunggu_revisi' => $menungguRevisi,
                'total' => $totalDocs,
            ];
        }

        return [
            'weekly_progress' => $weeklyProgress,
            'fakultas_document_status' => $fakultasDocumentStatus,
        ];
    }

    /**
     * Get status per fakultas with drill-down data.
     */
    private function getFakultasStatus(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $fakultasUnits = match ($level) {
            'universitas' => Unit::where('is_active', true)
                ->where('type', UnitType::Fakultas)
                ->get(),
            'fakultas' => Unit::where('id', $user->unit_id)
                ->where('type', UnitType::Fakultas)
                ->get(),
            default => collect(),
        };

        $status = [];
        foreach ($fakultasUnits as $fakultas) {
            $fakultasProdiIds = Unit::where('parent_id', $fakultas->id)
                ->where('type', UnitType::Prodi)
                ->pluck('id')
                ->toArray();

            if (empty($fakultasProdiIds)) {
                continue;
            }

            // Calculate readiness percentage
            $readiness = $this->calculateReadinessPercentage($fakultasProdiIds);

            // Calculate average score
            $assignments = Assignment::whereIn('unit_id', $fakultasProdiIds)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

            // Determine grade
            $grade = match (true) {
                $averageScore >= 3.5 => 'Unggul',
                $averageScore >= 3.0 => 'Sangat Baik',
                $averageScore >= 2.5 => 'Baik',
                default => 'Kurang',
            };

            // Determine risk level
            $riskLevel = match (true) {
                $readiness >= 85 && $averageScore >= 3.0 => 'Rendah',
                $readiness >= 70 && $averageScore >= 2.5 => 'Sedang',
                default => 'Tinggi',
            };

            // Count problematic documents
            $problematicDocs = Document::whereIn('unit_id', $fakultasProdiIds)
                ->where(function ($q) {
                    $q->where('issue_status', '!=', 'resolved')
                        ->orWhereNotNull('rejected_by')
                        ->orWhere(function ($subQ) {
                            $subQ->whereNotNull('expired_at')
                                ->where('expired_at', '<', now());
                        });
                })
                ->count();

            $totalDocs = Document::whereIn('unit_id', $fakultasProdiIds)->count();
            $completeDocs = Document::whereIn('unit_id', $fakultasProdiIds)
                ->where(function ($q) {
                    $q->whereNull('issue_status')
                        ->orWhere('issue_status', 'resolved');
                })
                ->whereNull('rejected_by')
                ->count();

            $docCompleteness = $totalDocs > 0 ? round(($completeDocs / $totalDocs) * 100, 1) : 0;

            $status[] = [
                'fakultas_id' => $fakultas->id,
                'fakultas' => $fakultas->name,
                'kesiapan' => round($readiness, 1),
                'nilai_sementara' => round($averageScore, 2),
                'grade' => $grade,
                'risiko' => $riskLevel,
                'status_dokumen' => $docCompleteness,
                'problematic_documents' => $problematicDocs,
            ];
        }

        return $status;
    }

    /**
     * Get status per prodi with filter options.
     */
    private function getProdiStatus(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [];
        }

        $prodis = Unit::whereIn('id', $prodiIds)
            ->with('parent')
            ->get();

        $status = [];
        foreach ($prodis as $prodi) {
            // Calculate document progress
            $totalDocs = Document::where('unit_id', $prodi->id)->count();
            $completeDocs = Document::where('unit_id', $prodi->id)
                ->where(function ($q) {
                    $q->whereNull('issue_status')
                        ->orWhere('issue_status', 'resolved');
                })
                ->whereNull('rejected_by')
                ->count();

            $docProgress = $totalDocs > 0 ? round(($completeDocs / $totalDocs) * 100, 1) : 0;

            // Calculate simulation score
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            $simulationScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

            // Get target (if exists) - Program is linked by name/fakultas, not direct relation
            $program = Program::where('name', $prodi->name)
                ->orWhere(function ($q) use ($prodi) {
                    $parent = $prodi->parent;
                    if ($parent) {
                        $q->where('fakultas', $parent->name);
                    }
                })
                ->first();

            $target = $program?->akreditasiTargets()->latest()->first();
            $targetScore = $target?->target_score ?? null;
            $targetGrade = $target?->target_grade ?? null;
            $gap = $targetScore ? $simulationScore - $targetScore : null;

            // Determine grade
            $grade = match (true) {
                $simulationScore >= 3.5 => 'Unggul',
                $simulationScore >= 3.0 => 'Sangat Baik',
                $simulationScore >= 2.5 => 'Baik',
                default => 'Kurang',
            };

            // Check for warnings
            $warnings = [];
            $problematicDocs = Document::where('unit_id', $prodi->id)
                ->where(function ($q) {
                    $q->where('issue_status', '!=', 'resolved')
                        ->orWhereNotNull('rejected_by')
                        ->orWhere(function ($subQ) {
                            $subQ->whereNotNull('expired_at')
                                ->where('expired_at', '<', now());
                        });
                })
                ->count();

            if ($problematicDocs > 0) {
                $warnings[] = "{$problematicDocs} dokumen bermasalah";
            }

            $incompleteAssessments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->where(function ($q) {
                    $q->whereHas('evaluations', function ($subQ) {
                        $subQ->whereNull('evaluation_status');
                    })
                        ->orWhereDoesntHave('evaluations');
                })
                ->count();

            if ($incompleteAssessments > 0) {
                $warnings[] = "{$incompleteAssessments} penilaian belum selesai";
            }

            if ($gap !== null && $gap < -0.5) {
                $warnings[] = 'Gap target besar';
            }

            $status[] = [
                'prodi_id' => $prodi->id,
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'fakultas_id' => $prodi->parent_id,
                'progress_dokumen' => $docProgress,
                'nilai_simulasi' => round($simulationScore, 2),
                'grade' => $grade,
                'target_score' => $targetScore,
                'target_grade' => $targetGrade,
                'gap' => $gap !== null ? round($gap, 2) : null,
                'warnings' => $warnings,
                'risk_level' => match (true) {
                    $simulationScore >= 3.0 && $docProgress >= 90 => 'Rendah',
                    $simulationScore >= 2.5 && $docProgress >= 75 => 'Sedang',
                    default => 'Tinggi',
                },
            ];
        }

        return $status;
    }

    /**
     * Display rekap nilai / poin akreditasi.
     */
    public function rekapNilai(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $level = $user->getPimpinanLevel();

        // Get accessible units based on level
        $accessibleUnits = $this->getAccessibleUnits($user, $level);
        $accessibleUnitIds = $accessibleUnits->pluck('id')->toArray();

        // Get rekap nilai per prodi
        $rekapPerProdi = $this->getRekapPerProdi($user, $level, $accessibleUnitIds);

        // Get rekap nilai per fakultas
        $rekapPerFakultas = $this->getRekapPerFakultas($user, $level, $accessibleUnitIds);

        // Get perbandingan antar-prodi
        $perbandinganProdi = $this->getPerbandinganProdi($user, $level, $accessibleUnitIds);

        return Inertia::render('Dashboard/Pimpinan/RekapNilai', [
            'level' => $level,
            'userRole' => $this->getUserRoleName($user),
            'rekapPerProdi' => $rekapPerProdi,
            'rekapPerFakultas' => $rekapPerFakultas,
            'perbandinganProdi' => $perbandinganProdi,
        ]);
    }

    /**
     * Get rekap nilai per prodi.
     */
    private function getRekapPerProdi(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [];
        }

        $prodis = Unit::whereIn('id', $prodiIds)
            ->with('parent')
            ->get();

        $rekap = [];
        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with(['criterion', 'evaluations'])
                ->get();

            // Calculate total score
            $totalScore = 0;
            $totalWeight = 0;
            $criteriaScores = [];

            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;

                    // Group by category
                    $category = $this->mapCriterionToCategory($assignment->criterion?->name ?? '');
                    if (! isset($criteriaScores[$category])) {
                        $criteriaScores[$category] = [
                            'total_score' => 0,
                            'total_weight' => 0,
                            'count' => 0,
                        ];
                    }
                    $criteriaScores[$category]['total_score'] += $avgScore * $weight;
                    $criteriaScores[$category]['total_weight'] += $weight;
                    $criteriaScores[$category]['count']++;
                }
            }

            $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;
            $grade = $this->convertToGrade($averageScore);

            // Calculate per-criteria scores
            $perCriteria = [];
            foreach ($criteriaScores as $category => $data) {
                $perCriteria[] = [
                    'kriteria' => $category,
                    'nilai' => $data['total_weight'] > 0 ? round($data['total_score'] / $data['total_weight'], 2) : 0,
                    'bobot' => $data['total_weight'],
                ];
            }

            $rekap[] = [
                'prodi_id' => $prodi->id,
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'fakultas_id' => $prodi->parent_id,
                'nilai_total' => round($averageScore, 2),
                'predikat' => $grade,
                'nilai_per_kriteria' => $perCriteria,
            ];
        }

        return $rekap;
    }

    /**
     * Get rekap nilai per fakultas with radar chart data.
     */
    private function getRekapPerFakultas(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $fakultasUnits = match ($level) {
            'universitas' => Unit::where('is_active', true)
                ->where('type', UnitType::Fakultas)
                ->get(),
            'fakultas' => Unit::where('id', $user->unit_id)
                ->where('type', UnitType::Fakultas)
                ->get(),
            default => collect(),
        };

        $rekap = [];
        foreach ($fakultasUnits as $fakultas) {
            $fakultasProdiIds = Unit::where('parent_id', $fakultas->id)
                ->where('type', UnitType::Prodi)
                ->pluck('id')
                ->toArray();

            if (empty($fakultasProdiIds)) {
                continue;
            }

            $assignments = Assignment::whereIn('unit_id', $fakultasProdiIds)
                ->whereNull('unassigned_at')
                ->with(['criterion', 'evaluations'])
                ->get();

            // Group by category
            $categoryScores = [];
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $category = $this->mapCriterionToCategory($assignment->criterion?->name ?? '');

                    if (! isset($categoryScores[$category])) {
                        $categoryScores[$category] = [
                            'total_score' => 0,
                            'total_weight' => 0,
                        ];
                    }
                    $weight = $assignment->criterion?->weight ?? 1;
                    $categoryScores[$category]['total_score'] += $avgScore * $weight;
                    $categoryScores[$category]['total_weight'] += $weight;
                }
            }

            // Prepare radar chart data
            $radarData = [];
            $categories = ['Tata Pamong', 'SDM Dosen', 'Mahasiswa', 'Penelitian', 'Pengabdian Masyarakat', 'Kerjasama', 'Luaran & Dampak'];
            foreach ($categories as $category) {
                $score = 0;
                if (isset($categoryScores[$category]) && $categoryScores[$category]['total_weight'] > 0) {
                    $score = $categoryScores[$category]['total_score'] / $categoryScores[$category]['total_weight'];
                }
                $radarData[$category] = round($score, 2);
            }

            // Find strong and weak criteria
            $sortedCategories = collect($radarData)->sortDesc();
            $strongCriteria = $sortedCategories->take(3)->keys()->toArray();
            $weakCriteria = $sortedCategories->reverse()->take(3)->keys()->toArray();

            $rekap[] = [
                'fakultas_id' => $fakultas->id,
                'fakultas' => $fakultas->name,
                'radar_data' => $radarData,
                'strong_criteria' => $strongCriteria,
                'weak_criteria' => $weakCriteria,
            ];
        }

        return $rekap;
    }

    /**
     * Get perbandingan antar-prodi.
     */
    private function getPerbandinganProdi(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [
                'top_10' => [],
                'bottom_10' => [],
            ];
        }

        $prodis = Unit::whereIn('id', $prodiIds)
            ->with('parent')
            ->get();

        $prodiScores = [];
        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

            $prodiScores[] = [
                'prodi_id' => $prodi->id,
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'nilai' => round($averageScore, 2),
                'grade' => $this->convertToGrade($averageScore),
            ];
        }

        // Sort by score
        usort($prodiScores, fn ($a, $b) => $b['nilai'] <=> $a['nilai']);

        return [
            'top_10' => array_slice($prodiScores, 0, 10),
            'bottom_10' => array_slice(array_reverse($prodiScores), 0, 10),
        ];
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
     * Convert score to grade.
     */
    private function convertToGrade(float $score): string
    {
        if ($score >= 3.5) {
            return 'Unggul';
        }
        if ($score >= 3.0) {
            return 'Sangat Baik';
        }
        if ($score >= 2.5) {
            return 'Baik';
        }

        return 'Kurang';
    }

    /**
     * Display statistik penilaian.
     */
    public function statistikPenilaian(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $level = $user->getPimpinanLevel();

        // Get accessible units based on level
        $accessibleUnits = $this->getAccessibleUnits($user, $level);
        $accessibleUnitIds = $accessibleUnits->pluck('id')->toArray();

        // Get distribusi predikat
        $distribusiPredikat = $this->getDistribusiPredikat($user, $level, $accessibleUnitIds);

        // Get jumlah penilaian selesai vs pending
        $statusPenilaian = $this->getStatusPenilaian($user, $level, $accessibleUnitIds);

        // Get kecepatan penilaian asesor
        $kecepatanAsesor = $this->getKecepatanAsesor($user, $level, $accessibleUnitIds);

        // Get penyebaran nilai antar-kriteria
        $penyebaranNilai = $this->getPenyebaranNilai($user, $level, $accessibleUnitIds);

        return Inertia::render('Dashboard/Pimpinan/StatistikPenilaian', [
            'level' => $level,
            'userRole' => $this->getUserRoleName($user),
            'distribusiPredikat' => $distribusiPredikat,
            'statusPenilaian' => $statusPenilaian,
            'kecepatanAsesor' => $kecepatanAsesor,
            'penyebaranNilai' => $penyebaranNilai,
        ]);
    }

    /**
     * Get distribusi predikat akreditasi.
     */
    private function getDistribusiPredikat(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [
                'unggul' => 0,
                'sangat_baik' => 0,
                'baik' => 0,
                'cukup' => 0,
                'kurang' => 0,
            ];
        }

        $prodis = Unit::whereIn('id', $prodiIds)->get();
        $distribusi = [
            'unggul' => 0,
            'sangat_baik' => 0,
            'baik' => 0,
            'cukup' => 0,
            'kurang' => 0,
        ];

        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            if ($totalWeight == 0) {
                $distribusi['kurang']++;

                continue;
            }

            $averageScore = $totalScore / $totalWeight;

            if ($averageScore >= 3.5) {
                $distribusi['unggul']++;
            } elseif ($averageScore >= 3.0) {
                $distribusi['sangat_baik']++;
            } elseif ($averageScore >= 2.5) {
                $distribusi['baik']++;
            } elseif ($averageScore >= 2.0) {
                $distribusi['cukup']++;
            } else {
                $distribusi['kurang']++;
            }
        }

        return $distribusi;
    }

    /**
     * Get status penilaian (selesai, pending, overdue).
     */
    private function getStatusPenilaian(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [
                'selesai' => 0,
                'pending' => 0,
                'overdue' => 0,
                'timeline' => [],
            ];
        }

        $assignments = Assignment::whereIn('unit_id', $prodiIds)
            ->whereNull('unassigned_at')
            ->with('evaluations')
            ->get();

        $selesai = 0;
        $pending = 0;
        $overdue = 0;

        // Timeline data (last 12 weeks)
        $timeline = [];
        $startDate = now()->subWeeks(11)->startOfWeek();
        $endDate = now()->endOfWeek();

        for ($week = $startDate->copy(); $week->lte($endDate); $week->addWeek()) {
            $weekEnd = $week->copy()->endOfWeek();
            $completed = Assignment::whereIn('unit_id', $prodiIds)
                ->whereNull('unassigned_at')
                ->whereHas('evaluations', function ($q) use ($weekEnd) {
                    $q->where('created_at', '<=', $weekEnd);
                })
                ->where(function ($q) use ($weekEnd) {
                    $q->whereHas('evaluations', function ($subQ) use ($weekEnd) {
                        $subQ->whereNotNull('evaluation_status')
                            ->where('created_at', '<=', $weekEnd);
                    });
                })
                ->count();

            $timeline[] = [
                'week' => $week->format('Y-m-d'),
                'week_label' => $week->format('d M'),
                'completed' => $completed,
            ];
        }

        foreach ($assignments as $assignment) {
            $hasEvaluations = $assignment->evaluations->isNotEmpty();
            $hasCompleteStatus = $assignment->evaluations->contains(fn ($e) => $e->evaluation_status !== null);

            if ($hasEvaluations && $hasCompleteStatus) {
                $selesai++;
            } elseif ($assignment->deadline && $assignment->deadline->isPast()) {
                $overdue++;
            } else {
                $pending++;
            }
        }

        return [
            'selesai' => $selesai,
            'pending' => $pending,
            'overdue' => $overdue,
            'timeline' => $timeline,
        ];
    }

    /**
     * Get kecepatan penilaian asesor.
     */
    private function getKecepatanAsesor(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [
                'rata_rata_durasi' => [],
                'backlog' => [],
                'kriteria_terlambat' => [],
            ];
        }

        $assignments = Assignment::whereIn('unit_id', $prodiIds)
            ->whereNull('unassigned_at')
            ->whereNotNull('assessor_id')
            ->with(['assessor', 'evaluations', 'criterion'])
            ->get();

        // Calculate average duration per assessor
        $assessorDurations = [];
        foreach ($assignments as $assignment) {
            $assessorId = $assignment->assessor_id;
            $assessorName = $assignment->assessor?->name ?? 'Unknown';

            if (! isset($assessorDurations[$assessorId])) {
                $assessorDurations[$assessorId] = [
                    'name' => $assessorName,
                    'total_duration' => 0,
                    'count' => 0,
                ];
            }

            $firstEvaluation = $assignment->evaluations->sortBy('created_at')->first();
            if ($firstEvaluation && $assignment->assigned_date) {
                $duration = $assignment->assigned_date->diffInDays($firstEvaluation->created_at);
                $assessorDurations[$assessorId]['total_duration'] += $duration;
                $assessorDurations[$assessorId]['count']++;
            }
        }

        $rataRataDurasi = [];
        foreach ($assessorDurations as $assessorId => $data) {
            if ($data['count'] > 0) {
                $rataRataDurasi[] = [
                    'assessor_id' => $assessorId,
                    'assessor' => $data['name'],
                    'durasi_rata_rata' => round($data['total_duration'] / $data['count'], 1),
                    'jumlah_penilaian' => $data['count'],
                ];
            }
        }

        usort($rataRataDurasi, fn ($a, $b) => $b['durasi_rata_rata'] <=> $a['durasi_rata_rata']);

        // Find assessors with backlog
        $backlog = [];
        foreach ($assignments->groupBy('assessor_id') as $assessorId => $assessorAssignments) {
            $pendingCount = $assessorAssignments->filter(function ($assignment) {
                $hasEvaluations = $assignment->evaluations->isNotEmpty();
                $hasCompleteStatus = $assignment->evaluations->contains(fn ($e) => $e->evaluation_status !== null);

                return ! ($hasEvaluations && $hasCompleteStatus);
            })->count();

            if ($pendingCount > 0) {
                $firstAssignment = $assessorAssignments->first();
                $backlog[] = [
                    'assessor_id' => $assessorId,
                    'assessor' => $firstAssignment->assessor?->name ?? 'Unknown',
                    'pending_count' => $pendingCount,
                ];
            }
        }

        usort($backlog, fn ($a, $b) => $b['pending_count'] <=> $a['pending_count']);

        // Find criteria that are most often late
        $kriteriaTerlambat = [];
        foreach ($assignments->groupBy('criteria_id') as $criteriaId => $criteriaAssignments) {
            $lateCount = $criteriaAssignments->filter(function ($assignment) {
                if (! $assignment->deadline) {
                    return false;
                }

                $hasEvaluations = $assignment->evaluations->isNotEmpty();
                $hasCompleteStatus = $assignment->evaluations->contains(fn ($e) => $e->evaluation_status !== null);

                if (! ($hasEvaluations && $hasCompleteStatus)) {
                    return $assignment->deadline->isPast();
                }

                $firstEvaluation = $assignment->evaluations->sortBy('created_at')->first();
                if ($firstEvaluation) {
                    return $firstEvaluation->created_at->isAfter($assignment->deadline);
                }

                return false;
            })->count();

            if ($lateCount > 0) {
                $firstAssignment = $criteriaAssignments->first();
                $kriteriaTerlambat[] = [
                    'criteria_id' => $criteriaId,
                    'criteria' => $firstAssignment->criterion?->name ?? 'Unknown',
                    'terlambat_count' => $lateCount,
                ];
            }
        }

        usort($kriteriaTerlambat, fn ($a, $b) => $b['terlambat_count'] <=> $a['terlambat_count']);

        return [
            'rata_rata_durasi' => $rataRataDurasi,
            'backlog' => $backlog,
            'kriteria_terlambat' => $kriteriaTerlambat,
        ];
    }

    /**
     * Get penyebaran nilai antar-kriteria (heatmap data).
     */
    private function getPenyebaranNilai(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [];
        }

        $assignments = Assignment::whereIn('unit_id', $prodiIds)
            ->whereNull('unassigned_at')
            ->with(['criterion', 'evaluations'])
            ->get();

        // Group by criterion and calculate average score
        $criteriaScores = [];
        foreach ($assignments as $assignment) {
            $evaluations = $assignment->evaluations;
            if ($evaluations->isNotEmpty()) {
                $avgScore = $evaluations->avg('score');
                $category = $this->mapCriterionToCategory($assignment->criterion?->name ?? '');

                if (! isset($criteriaScores[$category])) {
                    $criteriaScores[$category] = [
                        'total_score' => 0,
                        'count' => 0,
                    ];
                }

                $criteriaScores[$category]['total_score'] += $avgScore;
                $criteriaScores[$category]['count']++;
            }
        }

        // Prepare heatmap data
        $heatmapData = [];
        foreach ($criteriaScores as $category => $data) {
            $averageScore = $data['count'] > 0 ? $data['total_score'] / $data['count'] : 0;
            $heatmapData[] = [
                'kriteria' => $category,
                'nilai_rata_rata' => round($averageScore, 2),
                'jumlah_penilaian' => $data['count'],
            ];
        }

        usort($heatmapData, fn ($a, $b) => $a['nilai_rata_rata'] <=> $b['nilai_rata_rata']);

        return $heatmapData;
    }

    /**
     * Display laporan eksekutif page.
     */
    public function laporanEksekutif(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $level = $user->getPimpinanLevel();

        // Get accessible units based on level
        $accessibleUnits = $this->getAccessibleUnits($user, $level);
        $accessibleUnitIds = $accessibleUnits->pluck('id')->toArray();

        // Get available reports
        $availableReports = $this->getAvailableReports($user, $level, $accessibleUnitIds);

        return Inertia::render('Dashboard/Pimpinan/LaporanEksekutif', [
            'level' => $level,
            'userRole' => $this->getUserRoleName($user),
            'availableReports' => $availableReports,
        ]);
    }

    /**
     * Get available reports based on pimpinan level.
     */
    private function getAvailableReports(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $reports = [];

        // Laporan Capaian Akreditasi Universitas (only for universitas level)
        if ($level === 'universitas') {
            $reports[] = [
                'id' => 'capaian-universitas',
                'name' => 'Laporan Capaian Akreditasi Universitas',
                'description' => 'Laporan lengkap capaian akreditasi seluruh universitas',
                'icon' => 'university',
            ];
        }

        // Laporan Per Fakultas
        if ($level === 'universitas' || $level === 'fakultas') {
            $reports[] = [
                'id' => 'per-fakultas',
                'name' => 'Laporan Per Fakultas',
                'description' => 'Laporan detail per fakultas dengan breakdown prodi',
                'icon' => 'building',
            ];
        }

        // Laporan Rekapitulasi Prodi
        $reports[] = [
            'id' => 'rekapitulasi-prodi',
            'name' => 'Laporan Rekapitulasi Prodi',
            'description' => 'Rekapitulasi nilai dan status semua prodi',
            'icon' => 'list',
        ];

        // Laporan Risiko Akreditasi
        $reports[] = [
            'id' => 'risiko-akreditasi',
            'name' => 'Laporan Risiko Akreditasi',
            'description' => 'Identifikasi prodi dan fakultas dengan risiko tinggi',
            'icon' => 'warning',
        ];

        // Laporan Gap Analysis Prodi
        $reports[] = [
            'id' => 'gap-analysis',
            'name' => 'Laporan Gap Analysis Prodi',
            'description' => 'Analisis gap antara target dan realisasi per prodi',
            'icon' => 'chart',
        ];

        // Laporan Status Dokumen Akreditasi
        $reports[] = [
            'id' => 'status-dokumen',
            'name' => 'Laporan Status Dokumen Akreditasi',
            'description' => 'Status kelengkapan dan kualitas dokumen akreditasi',
            'icon' => 'document',
        ];

        return $reports;
    }

    /**
     * Download laporan PDF.
     */
    public function downloadLaporan(Request $request, string $reportType, string $format = 'pdf'): BinaryFileResponse|\Illuminate\Http\Response|\Illuminate\Http\JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $level = $user->getPimpinanLevel();

        // Get accessible units based on level
        $accessibleUnits = $this->getAccessibleUnits($user, $level);
        $accessibleUnitIds = $accessibleUnits->pluck('id')->toArray();

        // Generate report data
        $reportData = $this->generateReportData($reportType, $user, $level, $accessibleUnitIds);

        if ($format === 'pdf') {
            return $this->generatePDFReport($reportType, $reportData);
        }

        // Excel format (placeholder for now)
        return response()->json(['message' => 'Excel export akan segera tersedia'], 501);
    }

    /**
     * Generate report data based on report type.
     */
    private function generateReportData(string $reportType, User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        return match ($reportType) {
            'capaian-universitas' => $this->getCapaianUniversitasData($prodiIds),
            'per-fakultas' => $this->getPerFakultasData($user, $level, $accessibleUnitIds),
            'rekapitulasi-prodi' => $this->getRekapitulasiProdiData($prodiIds),
            'risiko-akreditasi' => $this->getRisikoAkreditasiData($prodiIds),
            'gap-analysis' => $this->getGapAnalysisData($prodiIds),
            'status-dokumen' => $this->getStatusDokumenData($prodiIds),
            default => throw new \InvalidArgumentException("Jenis laporan {$reportType} tidak valid"),
        };
    }

    /**
     * Get capaian universitas data.
     */
    private function getCapaianUniversitasData(array $prodiIds): array
    {
        $stats = $this->calculateStatistics(
            Auth::user(),
            'universitas',
            Unit::where('is_active', true)
                ->whereIn('type', [UnitType::Fakultas, UnitType::Pascasarjana])
                ->pluck('id')
                ->toArray()
        );

        $distribusiPredikat = $this->getDistribusiPredikat(
            Auth::user(),
            'universitas',
            Unit::where('is_active', true)
                ->whereIn('type', [UnitType::Fakultas, UnitType::Pascasarjana])
                ->pluck('id')
                ->toArray()
        );

        return [
            'title' => 'Laporan Capaian Akreditasi Universitas',
            'stats' => $stats,
            'distribusi_predikat' => $distribusiPredikat,
            'generated_at' => now()->format('d F Y H:i:s'),
        ];
    }

    /**
     * Get per fakultas data.
     */
    private function getPerFakultasData(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $fakultasStatus = $this->getFakultasStatus($user, $level, $accessibleUnitIds);

        return [
            'title' => 'Laporan Per Fakultas',
            'fakultas_status' => $fakultasStatus,
            'generated_at' => now()->format('d F Y H:i:s'),
        ];
    }

    /**
     * Get rekapitulasi prodi data.
     */
    private function getRekapitulasiProdiData(array $prodiIds): array
    {
        /** @var User $user */
        $user = Auth::user();
        $rekapPerProdi = $this->getRekapPerProdi(
            $user,
            $user->getPimpinanLevel(),
            []
        );

        return [
            'title' => 'Laporan Rekapitulasi Prodi',
            'rekap_per_prodi' => $rekapPerProdi,
            'generated_at' => now()->format('d F Y H:i:s'),
        ];
    }

    /**
     * Get risiko akreditasi data.
     */
    private function getRisikoAkreditasiData(array $prodiIds): array
    {
        $prodis = Unit::whereIn('id', $prodiIds)->with('parent')->get();
        $risikoData = [];

        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;
            $problematicDocs = Document::where('unit_id', $prodi->id)
                ->where(function ($q) {
                    $q->where('issue_status', '!=', 'resolved')
                        ->orWhereNotNull('rejected_by');
                })
                ->count();

            $riskLevel = match (true) {
                $averageScore >= 3.0 && $problematicDocs === 0 => 'Rendah',
                $averageScore >= 2.5 && $problematicDocs < 3 => 'Sedang',
                default => 'Tinggi',
            };

            $risikoData[] = [
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'nilai' => round($averageScore, 2),
                'problematic_documents' => $problematicDocs,
                'risk_level' => $riskLevel,
            ];
        }

        usort($risikoData, fn ($a, $b) => $b['risk_level'] === 'Tinggi' ? 1 : -1);

        return [
            'title' => 'Laporan Risiko Akreditasi',
            'risiko_data' => $risikoData,
            'generated_at' => now()->format('d F Y H:i:s'),
        ];
    }

    /**
     * Get gap analysis data.
     */
    private function getGapAnalysisData(array $prodiIds): array
    {
        $prodis = Unit::whereIn('id', $prodiIds)->with('parent')->get();
        $gapData = [];

        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            $simulationScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

            $program = Program::where('name', $prodi->name)->first();
            $target = $program?->akreditasiTargets()->latest()->first();
            $targetScore = $target?->target_score ?? null;
            $gap = $targetScore ? $simulationScore - $targetScore : null;

            $gapData[] = [
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'target_score' => $targetScore,
                'target_grade' => $target?->target_grade ?? '-',
                'realisasi_score' => round($simulationScore, 2),
                'gap' => $gap !== null ? round($gap, 2) : null,
            ];
        }

        return [
            'title' => 'Laporan Gap Analysis Prodi',
            'gap_data' => $gapData,
            'generated_at' => now()->format('d F Y H:i:s'),
        ];
    }

    /**
     * Get status dokumen data.
     */
    private function getStatusDokumenData(array $prodiIds): array
    {
        $prodis = Unit::whereIn('id', $prodiIds)->with('parent')->get();
        $statusData = [];

        foreach ($prodis as $prodi) {
            $totalDocs = Document::where('unit_id', $prodi->id)->count();
            $completeDocs = Document::where('unit_id', $prodi->id)
                ->where(function ($q) {
                    $q->whereNull('issue_status')
                        ->orWhere('issue_status', 'resolved');
                })
                ->whereNull('rejected_by')
                ->count();

            $problematicDocs = Document::where('unit_id', $prodi->id)
                ->where(function ($q) {
                    $q->where('issue_status', '!=', 'resolved')
                        ->orWhereNotNull('rejected_by');
                })
                ->count();

            $statusData[] = [
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'total_dokumen' => $totalDocs,
                'dokumen_lengkap' => $completeDocs,
                'dokumen_bermasalah' => $problematicDocs,
                'persentase_lengkap' => $totalDocs > 0 ? round(($completeDocs / $totalDocs) * 100, 1) : 0,
            ];
        }

        return [
            'title' => 'Laporan Status Dokumen Akreditasi',
            'status_data' => $statusData,
            'generated_at' => now()->format('d F Y H:i:s'),
        ];
    }

    /**
     * Generate PDF report.
     */
    private function generatePDFReport(string $reportType, array $data): \Illuminate\Http\Response
    {
        $view = match ($reportType) {
            'capaian-universitas' => 'reports.pimpinan.capaian-universitas',
            'per-fakultas' => 'reports.pimpinan.per-fakultas',
            'rekapitulasi-prodi' => 'reports.pimpinan.rekapitulasi-prodi',
            'risiko-akreditasi' => 'reports.pimpinan.risiko-akreditasi',
            'gap-analysis' => 'reports.pimpinan.gap-analysis',
            'status-dokumen' => 'reports.pimpinan.status-dokumen',
            default => 'reports.pimpinan.default',
        };

        $pdf = Pdf::loadView($view, $data);
        $pdf->setPaper('a4', 'portrait');
        $pdf->setOption('enable-local-file-access', true);

        $filename = strtolower(str_replace(' ', '-', $data['title'])).'-'.now()->format('Y-m-d-His').'.pdf';

        return $pdf->download($filename);
    }

    /**
     * Display insight kesiapan akreditasi (gap analysis).
     */
    public function insightKesiapan(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $level = $user->getPimpinanLevel();

        // Get accessible units based on level
        $accessibleUnits = $this->getAccessibleUnits($user, $level);
        $accessibleUnitIds = $accessibleUnits->pluck('id')->toArray();

        // Get gap analysis per prodi
        $gapAnalysisProdi = $this->getGapAnalysisProdi($user, $level, $accessibleUnitIds);

        // Get gap analysis per fakultas
        $gapAnalysisFakultas = $this->getGapAnalysisFakultas($user, $level, $accessibleUnitIds);

        // Get early warning system data
        $earlyWarnings = $this->getEarlyWarnings($user, $level, $accessibleUnitIds);

        // Get prioritization matrix
        $prioritizationMatrix = $this->getPrioritizationMatrix($user, $level, $accessibleUnitIds);

        // Get risk dashboard data
        $riskDashboard = $this->getRiskDashboard($user, $level, $accessibleUnitIds);

        return Inertia::render('Dashboard/Pimpinan/InsightKesiapan', [
            'level' => $level,
            'userRole' => $this->getUserRoleName($user),
            'gapAnalysisProdi' => $gapAnalysisProdi,
            'gapAnalysisFakultas' => $gapAnalysisFakultas,
            'earlyWarnings' => $earlyWarnings,
            'prioritizationMatrix' => $prioritizationMatrix,
            'riskDashboard' => $riskDashboard,
        ]);
    }

    /**
     * Get gap analysis per prodi.
     */
    private function getGapAnalysisProdi(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [];
        }

        $prodis = Unit::whereIn('id', $prodiIds)->with('parent')->get();
        $gapData = [];

        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with(['criterion', 'evaluations'])
                ->get();

            // Calculate realisasi score
            $totalScore = 0;
            $totalWeight = 0;
            $criteriaScores = [];

            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;

                    $category = $this->mapCriterionToCategory($assignment->criterion?->name ?? '');
                    if (! isset($criteriaScores[$category])) {
                        $criteriaScores[$category] = [
                            'total_score' => 0,
                            'total_weight' => 0,
                        ];
                    }
                    $criteriaScores[$category]['total_score'] += $avgScore * $weight;
                    $criteriaScores[$category]['total_weight'] += $weight;
                }
            }

            $realisasi = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

            // Get target
            $program = Program::where('name', $prodi->name)->first();
            $target = $program?->akreditasiTargets()->latest()->first();
            $targetScore = $target?->target_score ?? null;
            $targetGrade = $target?->target_grade ?? null;
            $gap = $targetScore ? $realisasi - $targetScore : null;

            // Generate recommendations based on gap and criteria scores
            $rekomendasi = $this->generateRecommendations($criteriaScores, $gap, $realisasi);

            $gapData[] = [
                'prodi_id' => $prodi->id,
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'target_score' => $targetScore,
                'target_grade' => $targetGrade,
                'realisasi' => round($realisasi, 2),
                'gap' => $gap !== null ? round($gap, 2) : null,
                'rekomendasi' => $rekomendasi,
            ];
        }

        // Sort by gap (most negative first)
        usort($gapData, function ($a, $b) {
            if ($a['gap'] === null) {
                return 1;
            }
            if ($b['gap'] === null) {
                return -1;
            }

            return $a['gap'] <=> $b['gap'];
        });

        return $gapData;
    }

    /**
     * Get gap analysis per fakultas.
     */
    private function getGapAnalysisFakultas(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $fakultasUnits = match ($level) {
            'universitas' => Unit::where('is_active', true)
                ->where('type', UnitType::Fakultas)
                ->get(),
            'fakultas' => Unit::where('id', $user->unit_id)
                ->where('type', UnitType::Fakultas)
                ->get(),
            default => collect(),
        };

        $gapData = [];
        foreach ($fakultasUnits as $fakultas) {
            $fakultasProdiIds = Unit::where('parent_id', $fakultas->id)
                ->where('type', UnitType::Prodi)
                ->pluck('id')
                ->toArray();

            if (empty($fakultasProdiIds)) {
                continue;
            }

            $assignments = Assignment::whereIn('unit_id', $fakultasProdiIds)
                ->whereNull('unassigned_at')
                ->with(['criterion', 'evaluations'])
                ->get();

            // Group by category
            $categoryScores = [];
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $category = $this->mapCriterionToCategory($assignment->criterion?->name ?? '');

                    if (! isset($categoryScores[$category])) {
                        $categoryScores[$category] = [
                            'total_score' => 0,
                            'total_weight' => 0,
                        ];
                    }
                    $weight = $assignment->criterion?->weight ?? 1;
                    $categoryScores[$category]['total_score'] += $avgScore * $weight;
                    $categoryScores[$category]['total_weight'] += $weight;
                }
            }

            // Find weakest criteria
            $weakCriteria = [];
            foreach ($categoryScores as $category => $data) {
                if ($data['total_weight'] > 0) {
                    $avgScore = $data['total_score'] / $data['total_weight'];
                    $weakCriteria[] = [
                        'kriteria' => $category,
                        'nilai_rata_rata' => round($avgScore, 2),
                    ];
                }
            }

            usort($weakCriteria, fn ($a, $b) => $a['nilai_rata_rata'] <=> $b['nilai_rata_rata']);

            // Generate priority actions
            $prioritasTindakan = $this->generatePriorityActions($weakCriteria);

            $gapData[] = [
                'fakultas_id' => $fakultas->id,
                'fakultas' => $fakultas->name,
                'kriteria_lemah' => array_slice($weakCriteria, 0, 5),
                'nilai_per_kriteria' => $weakCriteria,
                'prioritas_tindakan' => $prioritasTindakan,
            ];
        }

        return $gapData;
    }

    /**
     * Get early warning system data.
     */
    private function getEarlyWarnings(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [
                'low_completeness' => [],
                'low_score' => [],
                'problematic_criteria' => [],
                'upcoming_deadlines' => [],
            ];
        }

        $warnings = [
            'low_completeness' => [],
            'low_score' => [],
            'problematic_criteria' => [],
            'upcoming_deadlines' => [],
        ];

        $prodis = Unit::whereIn('id', $prodiIds)->with('parent')->get();

        foreach ($prodis as $prodi) {
            // Check completeness
            $totalDocs = Document::where('unit_id', $prodi->id)->count();
            $completeDocs = Document::where('unit_id', $prodi->id)
                ->where(function ($q) {
                    $q->whereNull('issue_status')
                        ->orWhere('issue_status', 'resolved');
                })
                ->whereNull('rejected_by')
                ->count();

            $completeness = $totalDocs > 0 ? ($completeDocs / $totalDocs) * 100 : 0;

            if ($completeness < 70) {
                $warnings['low_completeness'][] = [
                    'prodi_id' => $prodi->id,
                    'prodi' => $prodi->name,
                    'fakultas' => $prodi->parent?->name ?? '-',
                    'completeness' => round($completeness, 1),
                ];
            }

            // Check score
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

            if ($averageScore < 2.75 && $averageScore > 0) {
                $warnings['low_score'][] = [
                    'prodi_id' => $prodi->id,
                    'prodi' => $prodi->name,
                    'fakultas' => $prodi->parent?->name ?? '-',
                    'score' => round($averageScore, 2),
                ];
            }

            // Check problematic criteria
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    if ($avgScore < 2.5) {
                        $warnings['problematic_criteria'][] = [
                            'prodi_id' => $prodi->id,
                            'prodi' => $prodi->name,
                            'criteria' => $assignment->criterion?->name ?? 'Unknown',
                            'score' => round($avgScore, 2),
                        ];
                    }
                }
            }

            // Check upcoming deadlines (7 days)
            $upcomingDeadlines = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->whereNotNull('deadline')
                ->whereBetween('deadline', [now(), now()->addDays(7)])
                ->whereDoesntHave('evaluations', function ($q) {
                    $q->whereNotNull('evaluation_status');
                })
                ->with('criterion')
                ->get();

            foreach ($upcomingDeadlines as $assignment) {
                $warnings['upcoming_deadlines'][] = [
                    'prodi_id' => $prodi->id,
                    'prodi' => $prodi->name,
                    'criteria' => $assignment->criterion?->name ?? 'Unknown',
                    'deadline' => $assignment->deadline->format('d F Y'),
                    'days_left' => now()->diffInDays($assignment->deadline, false),
                ];
            }
        }

        // Sort and limit
        usort($warnings['problematic_criteria'], fn ($a, $b) => $a['score'] <=> $b['score']);
        $warnings['problematic_criteria'] = array_slice($warnings['problematic_criteria'], 0, 10);

        usort($warnings['upcoming_deadlines'], fn ($a, $b) => $a['days_left'] <=> $b['days_left']);

        return $warnings;
    }

    /**
     * Generate recommendations based on gap and criteria scores.
     */
    private function generateRecommendations(array $criteriaScores, ?float $gap, float $realisasi): array
    {
        $rekomendasi = [];

        // Check for low CPL (Capaian Pembelajaran Lulusan)
        if (isset($criteriaScores['Luaran & Dampak'])) {
            $cplScore = $criteriaScores['Luaran & Dampak']['total_weight'] > 0
                ? $criteriaScores['Luaran & Dampak']['total_score'] / $criteriaScores['Luaran & Dampak']['total_weight']
                : 0;
            if ($cplScore < 3.0) {
                $rekomendasi[] = 'Tingkatkan Dokumen CPL';
            }
        }

        // Check for RPS consistency
        if (isset($criteriaScores['Mahasiswa'])) {
            $mahasiswaScore = $criteriaScores['Mahasiswa']['total_weight'] > 0
                ? $criteriaScores['Mahasiswa']['total_score'] / $criteriaScores['Mahasiswa']['total_weight']
                : 0;
            if ($mahasiswaScore < 3.0) {
                $rekomendasi[] = 'Perbaiki Konsistensi RPS';
            }
        }

        // Check for lecturer output evidence
        if (isset($criteriaScores['SDM Dosen'])) {
            $sdmScore = $criteriaScores['SDM Dosen']['total_weight'] > 0
                ? $criteriaScores['SDM Dosen']['total_score'] / $criteriaScores['SDM Dosen']['total_weight']
                : 0;
            if ($sdmScore < 3.0) {
                $rekomendasi[] = 'Tambahkan bukti luaran dosen';
            }
        }

        // General recommendations based on gap
        if ($gap !== null && $gap < -0.3) {
            $rekomendasi[] = 'Perlu peningkatan signifikan untuk mencapai target';
        }

        if ($realisasi < 2.5) {
            $rekomendasi[] = 'Fokus pada perbaikan kriteria dengan nilai terendah';
        }

        return array_unique($rekomendasi);
    }

    /**
     * Generate priority actions based on weak criteria.
     */
    private function generatePriorityActions(array $weakCriteria): array
    {
        $actions = [];

        foreach (array_slice($weakCriteria, 0, 3) as $criteria) {
            $kriteria = $criteria['kriteria'];
            $nilai = $criteria['nilai_rata_rata'];

            if ($nilai < 2.5) {
                $actions[] = "Prioritas tinggi: Perbaiki {$kriteria} (nilai: {$nilai})";
            } elseif ($nilai < 3.0) {
                $actions[] = "Prioritas sedang: Tingkatkan {$kriteria} (nilai: {$nilai})";
            }
        }

        if (empty($actions)) {
            $actions[] = 'Pertahankan kualitas semua kriteria';
        }

        return $actions;
    }

    /**
     * Get prioritization matrix.
     */
    private function getPrioritizationMatrix(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [
                'high_risk' => [],
                'medium_risk' => [],
                'low_risk' => [],
                'top_performers' => [],
            ];
        }

        $prodis = Unit::whereIn('id', $prodiIds)->with('parent')->get();
        $matrix = [
            'high_risk' => [],
            'medium_risk' => [],
            'low_risk' => [],
            'top_performers' => [],
        ];

        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            // Calculate score
            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

            // Check completeness
            $totalDocs = Document::where('unit_id', $prodi->id)->count();
            $completeDocs = Document::where('unit_id', $prodi->id)
                ->where(function ($q) {
                    $q->whereNull('issue_status')
                        ->orWhere('issue_status', 'resolved');
                })
                ->whereNull('rejected_by')
                ->count();

            $completeness = $totalDocs > 0 ? ($completeDocs / $totalDocs) * 100 : 0;

            // Check problematic documents
            $problematicDocs = Document::where('unit_id', $prodi->id)
                ->where(function ($q) {
                    $q->where('issue_status', '!=', 'resolved')
                        ->orWhereNotNull('rejected_by');
                })
                ->count();

            // Check incomplete assessments
            $incompleteAssessments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->where(function ($q) {
                    $q->whereHas('evaluations', function ($subQ) {
                        $subQ->whereNull('evaluation_status');
                    })
                        ->orWhereDoesntHave('evaluations');
                })
                ->count();

            // Calculate risk score (0-100, higher = more risk)
            $riskScore = 0;
            if ($averageScore > 0) {
                $riskScore += (4 - $averageScore) * 15; // Score component (0-60)
            }
            $riskScore += (100 - $completeness) * 0.2; // Completeness component (0-20)
            $riskScore += min($problematicDocs * 5, 10); // Problematic docs (0-10)
            $riskScore += min($incompleteAssessments * 2, 10); // Incomplete assessments (0-10)
            $riskScore = min($riskScore, 100);

            $prodiData = [
                'prodi_id' => $prodi->id,
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'score' => round($averageScore, 2),
                'completeness' => round($completeness, 1),
                'problematic_documents' => $problematicDocs,
                'incomplete_assessments' => $incompleteAssessments,
                'risk_score' => round($riskScore, 1),
            ];

            // Categorize
            if ($riskScore >= 70 || $averageScore < 2.5 || $completeness < 60) {
                $matrix['high_risk'][] = $prodiData;
            } elseif ($riskScore >= 40 || $averageScore < 3.0 || $completeness < 75) {
                $matrix['medium_risk'][] = $prodiData;
            } elseif ($averageScore >= 3.5 && $completeness >= 90 && $riskScore < 20) {
                $matrix['top_performers'][] = $prodiData;
            } else {
                $matrix['low_risk'][] = $prodiData;
            }
        }

        // Sort by risk score (descending for high/medium, ascending for low/top)
        usort($matrix['high_risk'], fn ($a, $b) => $b['risk_score'] <=> $a['risk_score']);
        usort($matrix['medium_risk'], fn ($a, $b) => $b['risk_score'] <=> $a['risk_score']);
        usort($matrix['low_risk'], fn ($a, $b) => $a['risk_score'] <=> $b['risk_score']);
        usort($matrix['top_performers'], fn ($a, $b) => $b['score'] <=> $a['score']);

        return $matrix;
    }

    /**
     * Get risk dashboard data.
     */
    private function getRiskDashboard(User $user, ?string $level, array $accessibleUnitIds): array
    {
        $prodiIds = $this->getAccessibleProdiIds($user, $level, $accessibleUnitIds);

        if (empty($prodiIds)) {
            return [
                'heatmap_data' => [],
                'risk_factors' => [],
                'risk_trends' => [],
                'projections' => [],
            ];
        }

        // Get heatmap data (per fakultas/prodi)
        $heatmapData = [];
        if ($level === 'universitas' || $level === 'fakultas') {
            $fakultasUnits = match ($level) {
                'universitas' => Unit::where('is_active', true)
                    ->where('type', UnitType::Fakultas)
                    ->get(),
                'fakultas' => Unit::where('id', $user->unit_id)
                    ->where('type', UnitType::Fakultas)
                    ->get(),
                default => collect(),
            };

            foreach ($fakultasUnits as $fakultas) {
                $fakultasProdiIds = Unit::where('parent_id', $fakultas->id)
                    ->where('type', UnitType::Prodi)
                    ->pluck('id')
                    ->toArray();

                if (empty($fakultasProdiIds)) {
                    continue;
                }

                $riskScore = $this->calculateFakultasRiskScore($fakultasProdiIds);
                $heatmapData[] = [
                    'fakultas_id' => $fakultas->id,
                    'fakultas' => $fakultas->name,
                    'risk_score' => $riskScore,
                    'risk_level' => $this->getRiskLevel($riskScore),
                ];
            }
        } else {
            // Per prodi
            $prodis = Unit::whereIn('id', $prodiIds)->with('parent')->get();
            foreach ($prodis as $prodi) {
                $riskScore = $this->calculateProdiRiskScore($prodi->id);
                $heatmapData[] = [
                    'prodi_id' => $prodi->id,
                    'prodi' => $prodi->name,
                    'fakultas' => $prodi->parent?->name ?? '-',
                    'risk_score' => $riskScore,
                    'risk_level' => $this->getRiskLevel($riskScore),
                ];
            }
        }

        // Get risk factors
        $riskFactors = $this->getRiskFactors($prodiIds);

        // Get risk trends (last 4 weeks)
        $riskTrends = $this->getRiskTrends($prodiIds);

        // Get projections
        $projections = $this->getProjections($prodiIds);

        return [
            'heatmap_data' => $heatmapData,
            'risk_factors' => $riskFactors,
            'risk_trends' => $riskTrends,
            'projections' => $projections,
        ];
    }

    /**
     * Calculate fakultas risk score.
     */
    private function calculateFakultasRiskScore(array $prodiIds): float
    {
        $totalRisk = 0;
        $count = 0;

        foreach ($prodiIds as $prodiId) {
            $riskScore = $this->calculateProdiRiskScore($prodiId);
            $totalRisk += $riskScore;
            $count++;
        }

        return $count > 0 ? $totalRisk / $count : 0;
    }

    /**
     * Calculate prodi risk score.
     */
    private function calculateProdiRiskScore(string $prodiId): float
    {
        $assignments = Assignment::where('unit_id', $prodiId)
            ->whereNull('unassigned_at')
            ->with('evaluations')
            ->get();

        $totalScore = 0;
        $totalWeight = 0;
        foreach ($assignments as $assignment) {
            $evaluations = $assignment->evaluations;
            if ($evaluations->isNotEmpty()) {
                $avgScore = $evaluations->avg('score');
                $weight = $assignment->criterion?->weight ?? 1;
                $totalScore += $avgScore * $weight;
                $totalWeight += $weight;
            }
        }

        $averageScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

        $totalDocs = Document::where('unit_id', $prodiId)->count();
        $completeDocs = Document::where('unit_id', $prodiId)
            ->where(function ($q) {
                $q->whereNull('issue_status')
                    ->orWhere('issue_status', 'resolved');
            })
            ->whereNull('rejected_by')
            ->count();

        $completeness = $totalDocs > 0 ? ($completeDocs / $totalDocs) * 100 : 0;

        $problematicDocs = Document::where('unit_id', $prodiId)
            ->where(function ($q) {
                $q->where('issue_status', '!=', 'resolved')
                    ->orWhereNotNull('rejected_by');
            })
            ->count();

        $riskScore = 0;
        if ($averageScore > 0) {
            $riskScore += (4 - $averageScore) * 15;
        }
        $riskScore += (100 - $completeness) * 0.2;
        $riskScore += min($problematicDocs * 5, 10);

        return min($riskScore, 100);
    }

    /**
     * Get risk level from score.
     */
    private function getRiskLevel(float $riskScore): string
    {
        if ($riskScore >= 70) {
            return 'High';
        }
        if ($riskScore >= 40) {
            return 'Medium';
        }
        if ($riskScore >= 20) {
            return 'Low';
        }

        return 'Very Low';
    }

    /**
     * Get risk factors.
     */
    private function getRiskFactors(array $prodiIds): array
    {
        $factors = [];

        $prodis = Unit::whereIn('id', $prodiIds)->get();
        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with(['criterion', 'evaluations'])
                ->get();

            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    if ($avgScore < 2.5) {
                        $category = $this->mapCriterionToCategory($assignment->criterion?->name ?? '');
                        if (! isset($factors[$category])) {
                            $factors[$category] = [
                                'category' => $category,
                                'count' => 0,
                                'avg_score' => 0,
                                'total_score' => 0,
                            ];
                        }
                        $factors[$category]['count']++;
                        $factors[$category]['total_score'] += $avgScore;
                    }
                }
            }
        }

        // Calculate averages
        foreach ($factors as &$factor) {
            $factor['avg_score'] = $factor['count'] > 0 ? round($factor['total_score'] / $factor['count'], 2) : 0;
            unset($factor['total_score']);
        }

        usort($factors, fn ($a, $b) => $b['count'] <=> $a['count']);

        return array_slice($factors, 0, 10);
    }

    /**
     * Get risk trends (last 4 weeks).
     */
    private function getRiskTrends(array $prodiIds): array
    {
        $trends = [];
        $startDate = now()->subWeeks(3)->startOfWeek();

        for ($week = $startDate->copy(); $week->lte(now()); $week->addWeek()) {
            $weekEnd = $week->copy()->endOfWeek();

            // Calculate average risk for this week
            $totalRisk = 0;
            $count = 0;

            foreach ($prodiIds as $prodiId) {
                $assignments = Assignment::where('unit_id', $prodiId)
                    ->whereNull('unassigned_at')
                    ->whereHas('evaluations', function ($q) use ($weekEnd) {
                        $q->where('created_at', '<=', $weekEnd);
                    })
                    ->with('evaluations')
                    ->get();

                if ($assignments->isNotEmpty()) {
                    $riskScore = $this->calculateProdiRiskScore($prodiId);
                    $totalRisk += $riskScore;
                    $count++;
                }
            }

            $avgRisk = $count > 0 ? $totalRisk / $count : 0;

            $trends[] = [
                'week' => $week->format('Y-m-d'),
                'week_label' => $week->format('d M'),
                'risk_score' => round($avgRisk, 1),
            ];
        }

        return $trends;
    }

    /**
     * Get projections.
     */
    private function getProjections(array $prodiIds): array
    {
        $projections = [];

        $prodis = Unit::whereIn('id', $prodiIds)->with('parent')->get();
        foreach ($prodis as $prodi) {
            $assignments = Assignment::where('unit_id', $prodi->id)
                ->whereNull('unassigned_at')
                ->with('evaluations')
                ->get();

            $totalScore = 0;
            $totalWeight = 0;
            foreach ($assignments as $assignment) {
                $evaluations = $assignment->evaluations;
                if ($evaluations->isNotEmpty()) {
                    $avgScore = $evaluations->avg('score');
                    $weight = $assignment->criterion?->weight ?? 1;
                    $totalScore += $avgScore * $weight;
                    $totalWeight += $weight;
                }
            }

            $currentScore = $totalWeight > 0 ? $totalScore / $totalWeight : 0;

            // Projection: if no improvement, score might drop
            // If current trend is negative, project further decline
            $projectedScore = max(0, $currentScore - 0.1);

            // Get target
            $program = Program::where('name', $prodi->name)->first();
            $target = $program?->akreditasiTargets()->latest()->first();
            $targetScore = $target?->target_score ?? null;

            $projections[] = [
                'prodi_id' => $prodi->id,
                'prodi' => $prodi->name,
                'fakultas' => $prodi->parent?->name ?? '-',
                'current_score' => round($currentScore, 2),
                'projected_score' => round($projectedScore, 2),
                'target_score' => $targetScore,
                'projected_grade' => $this->convertToGrade($projectedScore),
                'gap_if_no_action' => $targetScore ? round($projectedScore - $targetScore, 2) : null,
            ];
        }

        return $projections;
    }
}
