<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AccreditationCycle;
use App\Models\AccreditationSimulation;
use App\Services\SimulationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SimulationController extends Controller
{
    public function __construct(
        protected SimulationService $simulationService
    ) {
    }

    /**
     * Run a new simulation.
     */
    public function runSimulation(Request $request, string $cycleId): RedirectResponse
    {
        $validated = $request->validate([
            'indicator_scores' => 'required|array',
            'indicator_scores.*' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $cycle = AccreditationCycle::with('lam')->findOrFail($cycleId);

        $result = $this->simulationService->runSimulation(
            $cycle,
            $validated['indicator_scores']
        );

        // Save simulation to database
        $simulation = AccreditationSimulation::create([
            'accreditation_cycle_id' => $cycleId,
            'created_by' => $request->user()->id,
            'indicator_scores' => $result['indicator_scores'],
            'standard_scores' => $result['standard_scores'],
            'total_score' => $result['total_score'],
            'predicted_result' => $result['predicted_result'],
            'gap_analysis' => $result['gap_analysis'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('coordinator-prodi.accreditation.simulation', $cycleId)
            ->with('success', 'Simulasi berhasil dijalankan.');
    }

    /**
     * Run simulation with current scores from database.
     */
    public function runSimulationWithCurrentScores(Request $request, string $cycleId): RedirectResponse
    {
        $cycle = AccreditationCycle::with('lam')->findOrFail($cycleId);

        $indicatorScores = $this->simulationService->getCurrentScores($cycle);

        if (empty($indicatorScores)) {
            return redirect()->route('coordinator-prodi.accreditation.simulation', $cycleId)
                ->with('error', 'Tidak ada skor untuk siklus ini. Silakan isi skor indikator terlebih dahulu.');
        }

        $result = $this->simulationService->runSimulation($cycle, $indicatorScores);

        // Save simulation to database
        $simulation = AccreditationSimulation::create([
            'accreditation_cycle_id' => $cycleId,
            'created_by' => $request->user()->id,
            'indicator_scores' => $result['indicator_scores'],
            'standard_scores' => $result['standard_scores'],
            'total_score' => $result['total_score'],
            'predicted_result' => $result['predicted_result'],
            'gap_analysis' => $result['gap_analysis'],
        ]);

        return redirect()->route('coordinator-prodi.accreditation.simulation', $cycleId)
            ->with('success', 'Simulasi berhasil dijalankan dengan skor saat ini.');
    }

    /**
     * Get simulation history for a cycle.
     */
    public function getSimulationHistory(string $cycleId): JsonResponse
    {
        $simulations = AccreditationSimulation::where('accreditation_cycle_id', $cycleId)
            ->with('creator:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($simulations);
    }

    /**
     * Get a specific simulation.
     */
    public function getSimulation(string $simulationId): JsonResponse
    {
        $simulation = AccreditationSimulation::with('creator:id,name,email')
            ->findOrFail($simulationId);

        $data = $simulation->toArray();
        if (isset($data['standard_scores']) && is_array($data['standard_scores'])) {
            $data['standard_scores'] = array_values($data['standard_scores']);
        }
        return response()->json($data);
    }
}
