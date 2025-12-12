<?php

namespace App\Services;

use App\Models\AccreditationCycle;
use App\Models\LAM;
use App\Models\ProdiIndicatorScore;

class SimulationService
{
    /**
     * Run simulation for an accreditation cycle.
     *
     * @param  array<string, float>  $indicatorScores
     * @return array<string, mixed>
     */
    public function runSimulation(AccreditationCycle $cycle, array $indicatorScores): array
    {
        $lam = $cycle->lam;
        $standards = $lam->standards()->with('elements.indicators')->get();

        $standardScores = [];
        $totalWeightedScore = 0;

        foreach ($standards as $standard) {
            $standardScore = $this->calculateStandardScore($standard, $indicatorScores);
            $weightedScore = $standardScore * $standard->weight;
            $totalWeightedScore += $weightedScore;

            $standardScores[$standard->id] = [
                'standard_id' => $standard->id,
                'code' => $standard->code,
                'name' => $standard->name,
                'score' => $standardScore,
                'weight' => $standard->weight,
                'weighted_score' => $weightedScore,
            ];
        }

        $totalScore = $totalWeightedScore;
        $predictedResult = $this->predictAccreditationResult($lam, $totalScore);
        $gapAnalysis = $this->generateGapAnalysis($standards, $standardScores, $lam);

        return [
            'indicator_scores' => $indicatorScores,
            'standard_scores' => $standardScores,
            'total_score' => round($totalScore, 2),
            'predicted_result' => $predictedResult,
            'gap_analysis' => $gapAnalysis,
        ];
    }

    /**
     * Calculate score for a standard.
     *
     * @param  \App\Models\LAMStandard  $standard
     * @param  array<string, float>  $indicatorScores
     */
    protected function calculateStandardScore($standard, array $indicatorScores): float
    {
        $totalScore = 0;
        $totalWeight = 0;

        foreach ($standard->elements as $element) {
            foreach ($element->indicators as $indicator) {
                $indicatorScore = $indicatorScores[$indicator->id] ?? 0;
                $totalScore += $indicatorScore * $indicator->weight;
                $totalWeight += $indicator->weight;
            }
        }

        if ($totalWeight == 0) {
            return 0;
        }

        return $totalScore / $totalWeight;
    }

    /**
     * Predict accreditation result based on score.
     */
    protected function predictAccreditationResult(LAM $lam, float $totalScore): string
    {
        $levels = $lam->accreditation_levels ?? ['Unggul' => 3.5, 'Baik Sekali' => 3.0, 'Baik' => 2.5, 'Tidak Terakreditasi' => 0];

        // Sort by threshold descending
        arsort($levels);

        foreach ($levels as $level => $threshold) {
            if ($totalScore >= $threshold) {
                return $level;
            }
        }

        return 'Tidak Terakreditasi';
    }

    /**
     * Generate gap analysis.
     *
     * @param  \Illuminate\Database\Eloquent\Collection  $standards
     * @param  array<string, mixed>  $standardScores
     */
    protected function generateGapAnalysis($standards, array $standardScores, LAM $lam): array
    {
        $gaps = [];
        $maxScore = $lam->max_score_scale;

        foreach ($standards as $standard) {
            $standardScore = $standardScores[$standard->id]['score'] ?? 0;
            $gap = $maxScore - $standardScore;

            if ($gap > 0.5) { // Only flag significant gaps
                $gaps[] = [
                    'standard_code' => $standard->code,
                    'standard_name' => $standard->name,
                    'current_score' => round($standardScore, 2),
                    'max_score' => $maxScore,
                    'gap' => round($gap, 2),
                    'priority' => $gap > 1.5 ? 'high' : ($gap > 1.0 ? 'medium' : 'low'),
                ];
            }
        }

        // Sort by gap descending
        usort($gaps, fn ($a, $b) => $b['gap'] <=> $a['gap']);

        return $gaps;
    }

    /**
     * Get current scores from database for a cycle.
     *
     * @return array<string, float>
     */
    public function getCurrentScores(AccreditationCycle $cycle): array
    {
        $scores = ProdiIndicatorScore::where('accreditation_cycle_id', $cycle->id)
            ->get()
            ->groupBy('lam_indicator_id')
            ->map(function ($group) {
                // Get the latest score (by source priority: assessor_external > assessor_internal > coordinator)
                $priorities = ['assessor_external' => 3, 'assessor_internal' => 2, 'coordinator' => 1];
                $latest = $group->sortByDesc(function ($score) use ($priorities) {
                    return ($priorities[$score->source] ?? 0) * 1000 + strtotime($score->created_at);
                })->first();

                return $latest ? (float) $latest->score : 0;
            })
            ->toArray();

        return $scores;
    }
}
