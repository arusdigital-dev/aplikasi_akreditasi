import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface Rubric {
    id: number;
    score: number;
    label: string | null;
    description: string;
}

interface Indicator {
    id: number;
    code: string;
    name: string;
    description: string | null;
    document_requirements: string[] | null;
    weight: number;
    rubrics: Rubric[];
}

interface Element {
    id: number;
    code: string;
    name: string;
    weight: number;
    indicators: Indicator[];
}

interface Standard {
    id: number;
    code: string;
    name: string;
    weight: number;
    elements: Element[];
}

interface Cycle {
    id: string;
    lam: {
        id: number;
        name: string;
        min_score_scale?: number;
        max_score_scale?: number;
        standards: Standard[];
    } | null;
}

interface ScoreByAssessor {
    id: string;
    lam_indicator_id: number;
    score: number;
    notes?: string | null;
    source: string;
}

interface Assignment {
    id: string;
    cycle_name: string;
    deadline?: string | null;
    fakultas?: string | null;
    prodi?: string | null;
    status: string;
}

interface Props {
    assignment: Assignment;
    cycle: Cycle;
    scoresByAssessor: Record<string, ScoreByAssessor>;
}

export default function AccreditationAssignmentsEvaluate({ assignment, cycle, scoresByAssessor }: Props) {
    const minScale = cycle.lam?.min_score_scale ?? 0;
    const maxScale = cycle.lam?.max_score_scale ?? 4;

    // Flatten indicators for initial form values
    const indicators: Indicator[] = useMemo(() => {
        const result: Indicator[] = [];
        const standards = cycle.lam?.standards || [];
        standards.forEach((std) => {
            (std.elements || []).forEach((el) => {
                (el.indicators || []).forEach((ind) => {
                    result.push(ind);
                });
            });
        });
        return result;
    }, [cycle.lam?.standards]);

    const initialEvaluations = useMemo(() => {
        return indicators.map((ind) => {
            const existing = scoresByAssessor[ind.id]?.score;
            const existingNotes = scoresByAssessor[ind.id]?.notes;
            return {
                lam_indicator_id: ind.id,
                score: existing !== undefined ? String(existing) : '',
                notes: existingNotes ?? '',
            };
        });
    }, [indicators, scoresByAssessor]);

    const { data, setData, post, put, processing, errors } = useForm({
        evaluations: initialEvaluations,
    });

    const [expandedStandards, setExpandedStandards] = useState<Record<number, boolean>>({});

    useEffect(() => {
        setExpandedStandards({});
    }, [cycle.id]);

    const toggleStandard = (standardId: number) => {
        setExpandedStandards((prev) => ({
            ...prev,
            [standardId]: !prev[standardId],
        }));
    };

    const updateEvaluation = (indicatorId: number, field: string, value: string) => {
        const newEvaluations = data.evaluations.map((ev) =>
            ev.lam_indicator_id === indicatorId ? { ...ev, [field]: value } : ev
        );
        setData('evaluations', newEvaluations);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const emptyScores = data.evaluations.filter((ev) => ev.score === '' || ev.score === null);
        if (emptyScores.length > 0) {
            alert('Semua indikator harus diberi nilai.');
            return;
        }
        const hasExisting = Object.keys(scoresByAssessor).length > 0;
        const url = hasExisting
            ? route('assessor-internal.accreditation-assignments.scores.update', { assignmentId: assignment.id })
            : route('assessor-internal.accreditation-assignments.scores.store', { assignmentId: assignment.id });
        const action = hasExisting ? put : post;
        action(url, {
            onSuccess: () => {
                router.visit(route('assessor-internal.accreditation-assignments.index'));
            },
        });
    };

    return (
        <DashboardLayout
            title="Input Skor LAM"
            subtitle={`${assignment.cycle_name} • ${assignment.prodi ?? ''}${assignment.fakultas ? ' / ' + assignment.fakultas : ''}`}
        >
            <Head title="Input Skor LAM" />

            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Program Studi</p>
                            <p className="text-sm font-medium text-gray-900">{assignment.prodi ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Fakultas</p>
                            <p className="text-sm font-medium text-gray-900">{assignment.fakultas ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Siklus</p>
                            <p className="text-sm font-medium text-gray-900">{assignment.cycle_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Deadline</p>
                            <p className="text-sm font-medium text-gray-900">
                                {assignment.deadline
                                    ? new Date(assignment.deadline).toLocaleDateString('id-ID', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Scale info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        Skala penilaian LAM: {minScale} sampai {maxScale}
                    </div>

                    {/* Standards */}
                    {cycle.lam?.standards && cycle.lam.standards.length > 0 ? (
                        cycle.lam.standards.map((standard) => (
                            <div key={standard.id} className="bg-white rounded-lg shadow">
                                <button
                                    type="button"
                                    onClick={() => toggleStandard(standard.id)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">{standard.code}</span>
                                        <span className="text-gray-700">{standard.name}</span>
                                        <span className="text-xs text-gray-500">(Bobot: {standard.weight}%)</span>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform ${
                                            expandedStandards[standard.id] ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {expandedStandards[standard.id] && (
                                    <div className="border-t border-gray-200">
                                        {standard.elements && standard.elements.length > 0 ? (
                                            standard.elements.map((element) => (
                                                <div key={element.id} className="px-6 py-4 bg-gray-50">
                                                    <div className="font-medium text-gray-900 mb-3">
                                                        {element.code}: {element.name}
                                                    </div>
                                                    <div className="space-y-3 ml-4">
                                                        {element.indicators && element.indicators.length > 0 ? (
                                                            element.indicators.map((indicator) => {
                                                                const existing = scoresByAssessor[indicator.id];
                                                                const current = data.evaluations.find(
                                                                    (ev) => ev.lam_indicator_id === indicator.id
                                                                );
                                                                return (
                                                                    <div key={indicator.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-gray-900">
                                                                                    {indicator.code}: {indicator.name}
                                                                                </div>
                                                                                {indicator.description && (
                                                                                    <p className="text-sm text-gray-600 mt-1">{indicator.description}</p>
                                                                                )}
                                                                                {indicator.document_requirements && Array.isArray(indicator.document_requirements) && indicator.document_requirements.length > 0 && (
                                                                                    <div className="mt-2">
                                                                                        <span className="text-xs font-medium text-gray-500">Dokumen yang diperlukan:</span>
                                                                                        <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                                                                                            {indicator.document_requirements.map((doc, idx) => (
                                                                                                <li key={idx}>{doc}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {existing && (
                                                                                <div className="ml-4">
                                                                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                                                                                        Skor saat ini: {existing.score}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {indicator.rubrics && indicator.rubrics.length > 0 && (
                                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                                <div className="text-xs font-medium text-gray-500 mb-2">Rubrik Penilaian:</div>
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                    {indicator.rubrics.map((rubric) => (
                                                                                        <button
                                                                                            key={rubric.id}
                                                                                            type="button"
                                                                                            onClick={() => updateEvaluation(indicator.id, 'score', String(rubric.score))}
                                                                                            className={`text-left text-xs p-2 rounded border ${
                                                                                                current?.score === String(rubric.score)
                                                                                                    ? 'border-blue-400 bg-blue-50'
                                                                                                    : 'border-gray-200 bg-gray-50'
                                                                                            }`}
                                                                                        >
                                                                                            <span className="font-medium">Skor {rubric.score}:</span> {rubric.label && `${rubric.label} - `}
                                                                                            {rubric.description}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                    Nilai ({minScale}–{maxScale})
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    min={minScale}
                                                                                    max={maxScale}
                                                                                    step="0.01"
                                                                                    value={current?.score ?? ''}
                                                                                    onChange={(e) => updateEvaluation(indicator.id, 'score', e.target.value)}
                                                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                                                    required
                                                                                />
                                                                                {(() => {
                                                                                    const evIndex = data.evaluations.findIndex(
                                                                                        (ev) => ev.lam_indicator_id === indicator.id
                                                                                    );
                                                                                    const key = evIndex >= 0 ? (`evaluations.${evIndex}.score` as keyof typeof errors) : null;
                                                                                    return key && errors[key] ? (
                                                                                        <p className="mt-1 text-sm text-red-600">
                                                                                            {errors[key]}
                                                                                        </p>
                                                                                    ) : null;
                                                                                })()}
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                                                                                <textarea
                                                                                    value={current?.notes ?? ''}
                                                                                    onChange={(e) => updateEvaluation(indicator.id, 'notes', e.target.value)}
                                                                                    placeholder="Catatan penilaian (opsional)"
                                                                                    rows={3}
                                                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="text-sm text-gray-500 italic">Tidak ada indikator</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-6 py-4 text-sm text-gray-500 italic">Tidak ada elemen</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                            Struktur LAM tidak tersedia.
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Link
                            href={route('assessor-internal.accreditation-assignments.index')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Skor'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
