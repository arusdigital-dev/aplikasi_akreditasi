<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\LAM;
use Illuminate\Http\JsonResponse;

class LAMController extends Controller
{
    /**
     * Get all active LAMs.
     */
    public function index(): JsonResponse
    {
        $lams = LAM::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'description']);

        return response()->json($lams);
    }

    /**
     * Get a specific LAM with full structure.
     */
    public function show(string $id): JsonResponse
    {
        $lam = LAM::with([
            'standards.elements.indicators.rubrics',
            'standards.elements.indicators' => function ($query) {
                $query->orderBy('order_index');
            },
        ])
            ->findOrFail($id);

        return response()->json([
            'lam' => [
                'id' => $lam->id,
                'name' => $lam->name,
                'code' => $lam->code,
                'description' => $lam->description,
                'min_score_scale' => $lam->min_score_scale,
                'max_score_scale' => $lam->max_score_scale,
                'accreditation_levels' => $lam->accreditation_levels,
            ],
            'standards' => $lam->standards->map(function ($standard) {
                return [
                    'id' => $standard->id,
                    'code' => $standard->code,
                    'name' => $standard->name,
                    'description' => $standard->description,
                    'weight' => $standard->weight,
                    'order_index' => $standard->order_index,
                    'elements' => $standard->elements->map(function ($element) {
                        return [
                            'id' => $element->id,
                            'code' => $element->code,
                            'name' => $element->name,
                            'description' => $element->description,
                            'weight' => $element->weight,
                            'order_index' => $element->order_index,
                            'indicators' => $element->indicators->map(function ($indicator) {
                                return [
                                    'id' => $indicator->id,
                                    'code' => $indicator->code,
                                    'name' => $indicator->name,
                                    'description' => $indicator->description,
                                    'document_requirements' => $indicator->document_requirements,
                                    'weight' => $indicator->weight,
                                    'order_index' => $indicator->order_index,
                                    'is_auto_scorable' => $indicator->is_auto_scorable,
                                    'auto_scoring_rules' => $indicator->auto_scoring_rules,
                                    'rubrics' => $indicator->rubrics->map(function ($rubric) {
                                        return [
                                            'id' => $rubric->id,
                                            'score' => $rubric->score,
                                            'label' => $rubric->label,
                                            'description' => $rubric->description,
                                        ];
                                    }),
                                ];
                            }),
                        ];
                    }),
                ];
            }),
        ]);
    }

    /**
     * Get LAM structure for a prodi.
     */
    public function getProdiLAM(string $prodiId): JsonResponse
    {
        $prodi = \App\Models\Prodi::with('lam')->findOrFail($prodiId);

        if (! $prodi->lam_id) {
            return response()->json([
                'message' => 'Prodi does not have an assigned LAM',
            ], 404);
        }

        return $this->show($prodi->lam_id);
    }
}
