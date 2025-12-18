<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AccreditationCycle;
use App\Models\Evaluation;
use App\Models\Prodi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AccreditationController extends Controller
{
    /**
     * Get accreditation cycles for a prodi.
     */
    public function getCycles(string $prodiId): JsonResponse
    {
        $prodi = Prodi::findOrFail($prodiId);

        $cycles = AccreditationCycle::where('prodi_id', $prodiId)
            ->with('lam:id,name,code')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($cycles);
    }

    /**
     * Get active accreditation cycle for a prodi.
     */
    public function getActiveCycle(string $prodiId): JsonResponse
    {
        $cycle = AccreditationCycle::where('prodi_id', $prodiId)
            ->where('status', 'active')
            ->with(['lam.standards.elements.indicators.rubrics'])
            ->first();

        if (!$cycle) {
            return response()->json([
                'message' => 'No active accreditation cycle found',
            ], 404);
        }

        return response()->json($cycle);
    }

    /**
     * Create a new accreditation cycle.
     */
    public function createCycle(Request $request, string $prodiId): JsonResponse
    {
        $validated = $request->validate([
            'lam_id' => 'nullable|exists:lams,id',
            'cycle_name' => 'required|string|max:100',
            'start_date' => 'required|date',
            'target_submission_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $prodi = Prodi::findOrFail($prodiId);
        $lamId = $validated['lam_id'] ?? $prodi->lam_id;
        if (!$lamId) {
            return response()->json([
                'message' => 'LAM belum ditentukan untuk prodi ini',
            ], 422);
        }

        $cycle = AccreditationCycle::create([
            'prodi_id' => $prodiId,
            'lam_id' => $lamId,
            'cycle_name' => $validated['cycle_name'],
            'start_date' => $validated['start_date'],
            'target_submission_date' => $validated['target_submission_date'] ?? null,
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($cycle, 201);
    }

    /**
     * Update accreditation cycle.
     */
    public function updateCycle(Request $request, string $cycleId): JsonResponse
    {
        $cycle = AccreditationCycle::findOrFail($cycleId);

        $validated = $request->validate([
            'cycle_name' => 'sometimes|string|max:100',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date',
            'target_submission_date' => 'nullable|date',
            'status' => 'sometimes|in:draft,active,submitted,evaluating,completed,archived',
            'notes' => 'nullable|string',
        ]);

        $cycle->update($validated);

        return response()->json($cycle);
    }

    /**
     * Get indicator scores for an accreditation cycle.
     */
    public function getIndicatorScores(string $cycleId): JsonResponse
    {
        $cycle = AccreditationCycle::with('lam.standards.elements.indicators')->findOrFail($cycleId);

        $scores = \App\Models\ProdiIndicatorScore::where('accreditation_cycle_id', $cycleId)
            ->with('indicator:id,code,name,lam_element_id', 'assessor:id,name,email')
            ->get()
            ->groupBy('lam_indicator_id');

        return response()->json([
            'cycle' => $cycle,
            'scores' => $scores,
        ]);
    }

    /**
     * Save or update indicator score.
     */
    public function saveIndicatorScore(Request $request, string $cycleId): RedirectResponse
    {
        $validated = $request->validate([
            'lam_indicator_id' => 'required|exists:lam_indicators,id',
            'score' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'source' => 'required|in:coordinator,assessor_internal,assessor_external',
        ]);

        $cycle = AccreditationCycle::findOrFail($cycleId);
        $user = $request->user();

        $score = \App\Models\ProdiIndicatorScore::updateOrCreate(
            [
                'accreditation_cycle_id' => $cycleId,
                'lam_indicator_id' => $validated['lam_indicator_id'],
                'assessor_id' => $validated['source'] !== 'coordinator' ? $user->id : null,
                'source' => $validated['source'],
            ],
            [
                'score' => $validated['score'],
                'notes' => $validated['notes'] ?? null,
                'recommendations' => $validated['recommendations'] ?? null,
            ]
        );

        return redirect()->route('coordinator-prodi.accreditation.simulation', $cycleId)
            ->with('success', 'Skor indikator berhasil disimpan.');
    }

    /**
     * Get average scores per program criteria point for a given cycle.
     */
    public function getCriteriaPointScores(Request $request, string $cycleId): JsonResponse
    {
        $cycle = AccreditationCycle::with('lam')->findOrFail($cycleId);
        $user = $request->user();

        $program = $user->accessiblePrograms()->first();
        if (!$program) {
            return response()->json([
                'message' => 'Program tidak ditemukan',
                'scores' => [],
            ], 404);
        }

        $program->load(['standards.criteria.criteriaPoints']);
        $pointIds = $program->standards->flatMap(function ($std) {
            return $std->criteria->flatMap(function ($cr) {
                return $cr->criteriaPoints->pluck('id');
            });
        })->unique()->values();

        if ($pointIds->isEmpty()) {
            return response()->json(['scores' => []]);
        }

        $year = null;
        if ($cycle->start_date) {
            try {
                $year = Carbon::parse($cycle->start_date)->year;
            } catch (\Throwable $e) {
                $year = null;
            }
        }

        $query = Evaluation::query()
            ->whereIn('criteria_point_id', $pointIds)
            ->whereHas('assignment', function ($q) use ($user) {
                $q->where('prodi_id', $user->prodi_id);
            });

        if ($year) {
            $query->whereYear('created_at', $year);
        }

        $evaluations = $query->get();
        $grouped = $evaluations->groupBy('criteria_point_id')->map(function ($group, $cpId) {
            return [
                'criteria_point_id' => (int) $cpId,
                'average_score' => round($group->avg('score') ?? 0, 2),
                'count' => $group->count(),
            ];
        });

        return response()->json([
            'scores' => $grouped->values(),
        ]);
    }
}
