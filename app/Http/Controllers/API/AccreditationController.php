<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AccreditationCycle;
use App\Models\Prodi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        if (! $cycle) {
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
            'lam_id' => 'required|exists:lams,id',
            'cycle_name' => 'required|string|max:100',
            'start_date' => 'required|date',
            'target_submission_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $prodi = Prodi::findOrFail($prodiId);

        $cycle = AccreditationCycle::create([
            'prodi_id' => $prodiId,
            'lam_id' => $validated['lam_id'],
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
    public function saveIndicatorScore(Request $request, string $cycleId): JsonResponse
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

        return response()->json($score);
    }
}
