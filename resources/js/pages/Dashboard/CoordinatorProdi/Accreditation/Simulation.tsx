import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    Legend,
} from 'recharts';

// Types
interface LAM {
    id: number;
    name: string;
    code: string;
}

interface AccreditationCycle {
    id: string;
    cycle_name: string;
    start_date: string;
    end_date: string | null;
    target_submission_date: string | null;
    status: string;
    accreditation_result: string | null;
    final_score: number | null;
    lam: {
        id: number;
        name: string;
        code: string;
    };
    created_at: string;
}

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
    description: string | null;
    weight: number;
    indicators: Indicator[];
}

interface Standard {
    id: number;
    code: string;
    name: string;
    description: string | null;
    weight: number;
    elements: Element[];
}

interface CycleData {
    id: string;
    cycle_name: string;
    lam: {
        id: number;
        name: string;
        standards: Standard[];
    };
}

type ProgramRubric = { score: number; description: string | null };
type ProgramCriteriaPoint = {
    id: number;
    title: string;
    description: string | null;
    max_score: number;
    order_index?: number;
    rubrics?: ProgramRubric[] | null;
};
type ProgramCriterion = {
    id: number;
    name: string;
    description: string | null;
    weight: number;
    order_index: number;
    criteriaPoints?: ProgramCriteriaPoint[];
};
type ProgramStandard = {
    id: number;
    name: string;
    description: string | null;
    weight: number;
    order_index: number;
    criteria: ProgramCriterion[];
};
type ProgramSimulation = {
    total_score: number;
    predicted_result: string;
    standard_scores: Array<{
        standard_id: number;
        code: string;
        name: string | null;
        score: number;
        weight: number;
        weighted_score: number;
    }>;
    criteria_breakdown?: Record<
        number,
        Array<{
            id: number;
            code: string;
            name: string | null;
            weight: number;
            score: number;
        }>
    >;
};

interface Score {
    id: string;
    lam_indicator_id: number;
    score: number;
    notes: string | null;
    source: string;
}

interface Simulation {
    id: string;
    total_score: number;
    predicted_result: string;
    created_at: string;
    creator: {
        name: string;
    } | null;
}

interface Props {
    // Cycles tab data
    cycles: AccreditationCycle[];
    activeCycle: AccreditationCycle | null;
    lams: LAM[];
    prodi: {
        id: string;
        name: string;
        lam_id: number | null;
        lam?: {
            id: number;
            name: string;
            code: string;
        } | null;
    };
    programLamName?: string | null;
    // Criteria tab data
    cycleData: CycleData | null;
    scores: Record<string, Score>;
    // Simulation tab data
    cycle: AccreditationCycle | null;
    simulations: Simulation[];
    currentScores: Record<string, number>;
    programStandards?: ProgramStandard[];
    programSimulation?: ProgramSimulation | null;
}

type Tab = 'cycles' | 'criteria' | 'simulation';

export default function AccreditationSimulation({
    cycles,
    activeCycle,
    lams,
    prodi,
    programLamName,
    cycleData,
    scores,
    cycle,
    simulations,
    currentScores,
    programStandards = [],
    programSimulation = null,
}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('cycles');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRunModal, setShowRunModal] = useState(false);
    const [expandedStandards, setExpandedStandards] = useState<Record<number, boolean>>({});
    const [indicatorEdits, setIndicatorEdits] = useState<Record<string, number>>({});
    const [indicatorNotes, setIndicatorNotes] = useState<Record<string, string>>({});
    const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#e11d48', '#0ea5e9'];
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detail, setDetail] = useState<{
        id?: string;
        total_score?: number;
        predicted_result?: string;
        standard_scores?: Array<{
            standard_id: number;
            code: string;
            name: string;
            score: number;
            weight: number;
            weighted_score: number;
        }>;
        gap_analysis?: Array<{
            standard_code: string;
            standard_name: string;
            current_score: number;
            max_score: number;
            gap: number;
            priority: 'high' | 'medium' | 'low';
        }>;
        criteria_point_scores?: Record<number, number>;
        criteria_breakdown?: Record<
            number,
            Array<{
                id: number;
                code: string;
                name: string | null;
                weight: number;
                score: number;
            }>
        >;
    } | null>(null);
    const [runningCurrent, setRunningCurrent] = useState(false);
    const normalize = (s?: string | null) => (s || '').toLowerCase().replace(/[\s\-_]+/g, '');
    const programMatchedLam = programLamName
        ? lams.find((lam) => normalize(lam.name) === normalize(programLamName) || normalize(lam.code) === normalize(programLamName))
        : undefined;
    const displayLamName = (lam: { name: string; code?: string }) =>
        programLamName &&
        (normalize(lam.name) === normalize(programLamName) || normalize(lam.code) === normalize(programLamName))
            ? programLamName
            : lam.name;
    const defaultLamId =
        prodi.lam_id?.toString() ||
        (prodi.lam?.id ? String(prodi.lam.id) : '') ||
        (programMatchedLam ? String(programMatchedLam.id) : '');
    const { data, setData, processing, errors } = useForm({
        lam_id: defaultLamId || '',
        cycle_name: '',
        start_date: '',
        target_submission_date: '',
        notes: '',
    });

    const simulationForm = useForm({
        indicator_scores: currentScores,
        notes: '',
    });

    // Reset expanded standards ketika cycleData berubah
    useEffect(() => {
        setExpandedStandards({});
    }, [cycleData?.id]);

    // Set default tab berdasarkan data yang tersedia
    useEffect(() => {
        if (activeCycle && activeTab === 'cycles') {
            // Jika ada active cycle, bisa langsung ke criteria atau simulation
            if (cycleData) {
                setActiveTab('criteria');
            } else if (cycle) {
                setActiveTab('simulation');
            }
        }
    }, [activeCycle, cycleData, cycle]);

    const handleCreateCycle = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            lam_id: data.lam_id || defaultLamId,
        };
        router.post('/coordinator-prodi/accreditation/cycles', payload, {
            onSuccess: () => {
                setShowCreateModal(false);
                setData({
                    lam_id: prodi.lam_id?.toString() || defaultLamId || '',
                    cycle_name: '',
                    start_date: '',
                    target_submission_date: '',
                    notes: '',
                });
                router.reload();
            },
        });
    };

    const handleRunSimulation = () => {
        if (!cycle) {
            return;
        }
        router.post(`/coordinator-prodi/accreditation/cycles/${cycle.id}/simulation`, simulationForm.data, {
            onSuccess: async () => {
                setShowRunModal(false);
                try {
                    const res = await fetch(route('coordinator-prodi.accreditation.simulation.history', cycle.id), {
                        headers: { Accept: 'application/json' },
                    });
                    if (res.ok) {
                        const hist = await res.json();
                        if (Array.isArray(hist) && hist.length > 0) {
                            await openSimulationDetail(hist[0].id);
                        }
                    }
                } catch {}
            },
        });
    };

    const handleRunWithCurrentScores = () => {
        if (!cycle) {
            return;
        }
        setRunningCurrent(true);
        setShowDetailModal(true);
        setDetailLoading(true);
        setDetailError(null);
        const fetchLatest = async (attempt = 1) => {
            try {
                const res = await fetch(route('coordinator-prodi.accreditation.simulation.history', cycle.id), {
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const hist = await res.json();
                    if (Array.isArray(hist) && hist.length > 0) {
                        await openSimulationDetail(hist[0].id);
                        return true;
                    }
                }
            } catch {}
            if (attempt < 3) {
                await new Promise((r) => setTimeout(r, 500));
                return fetchLatest(attempt + 1);
            }
            return false;
        };
        const hasCurrent = Object.keys(currentScores || {}).length > 0;
        if (hasCurrent) {
            router.post(route('coordinator-prodi.accreditation.simulation.run-current', cycle.id), {}, {
                onSuccess: async () => {
                    setActiveTab('simulation');
                    const opened = await fetchLatest(1);
                    if (!opened) {
                        setDetailError('Simulasi tidak ditemukan. Pastikan skor indikator tersedia, lalu coba lagi.');
                        setDetailLoading(false);
                    }
                },
                onError: () => {
                    setDetailError('Gagal menjalankan simulasi. Silakan coba lagi.');
                    setDetailLoading(false);
                },
                onFinish: () => {
                    setRunningCurrent(false);
                },
            });
        } else {
            const fallbackScores = buildFallbackIndicatorScores();
            router.post(route('coordinator-prodi.accreditation.simulation.run', cycle.id), { indicator_scores: fallbackScores, notes: '' }, {
                onSuccess: async () => {
                    setActiveTab('simulation');
                    try {
                        const res = await fetch(route('coordinator-prodi.accreditation.simulation.history', cycle.id), {
                            headers: { Accept: 'application/json' },
                        });
                        if (res.ok) {
                            const hist = await res.json();
                            if (Array.isArray(hist) && hist.length > 0) {
                                await openSimulationDetail(hist[0].id);
                            } else {
                                setDetailError('Simulasi tidak ditemukan. Pastikan skor indikator tersedia, lalu coba lagi.');
                            }
                        } else {
                            setDetailError('Gagal memuat riwayat simulasi');
                        }
                    } catch {
                        setDetailError('Terjadi kesalahan saat memuat detail simulasi');
                    } finally {
                        setDetailLoading(false);
                        setRunningCurrent(false);
                    }
                },
                onError: () => {
                    setDetailError('Gagal menjalankan simulasi');
                    setDetailLoading(false);
                    setRunningCurrent(false);
                },
            });
        }
    };

    const criteriaForChart =
        programSimulation && programSimulation.criteria_breakdown
            ? Object.values(programSimulation.criteria_breakdown)
                  .flat()
                  .map((c) => ({
                      id: c.id,
                      code: c.code,
                      name: c.name || '',
                      score: Number(c.score.toFixed(2)),
                      weight: c.weight,
                      weighted_score: Number((c.score * c.weight).toFixed(2)),
                  }))
            : [];

    const pieData = criteriaForChart.map((c) => ({
        name: `${c.code}`,
        value: c.weighted_score,
    }));
 
    const radarData = (() => {
        const cpScores = detail?.criteria_point_scores ?? {};
        const items: Array<{ label: string; score: number }> = [];
        [...(programStandards ?? [])].forEach((st) => {
            [...(st.criteria ?? [])].forEach((cr) => {
                const pts = [...(cr.criteriaPoints ?? [])];
                const weightSum = pts.reduce((acc, pt) => acc + Number(pt.max_score ?? 0), 0);
                const weightedSum = pts.reduce((acc, pt) => acc + Number(cpScores[pt.id] ?? 0) * Number(pt.max_score ?? 0), 0);
                const avg = weightSum > 0 ? weightedSum / weightSum : 0;
                items.push({
                    label: `${cr.name}`,
                    score: Number(avg.toFixed(2)),
                });
            });
        });
        return items;
    })();

    const buildFallbackIndicatorScores = (): Record<string, number> => {
        const existing = currentScores || {};
        if (Object.keys(existing).length > 0) {
            return existing;
        }
        const scoreRecords = scores || {};
        const scoreValues = Object.values(scoreRecords);
        if (scoreValues.length > 0) {
            const map: Record<string, number> = {};
            scoreValues.forEach((s) => {
                map[String(s.lam_indicator_id)] = Number(s.score ?? 0);
            });
            return map;
        }
        const zeros: Record<string, number> = {};
        (cycleData?.lam?.standards ?? []).forEach((st) => {
            (st.elements ?? []).forEach((el) => {
                (el.indicators ?? []).forEach((ind) => {
                    zeros[String(ind.id)] = 0;
                });
            });
        });
        return zeros;
    };

    const criteriaBreakdownMap: Record<number, Record<number, { weight: number; score: number }>> = {};
    Object.entries(programSimulation?.criteria_breakdown ?? {}).forEach(([stdId, items]) => {
        const sid = Number(stdId);
        criteriaBreakdownMap[sid] = {};
        (items as Array<{ id: number; weight: number; score: number }>).forEach((it) => {
            criteriaBreakdownMap[sid][it.id] = { weight: it.weight, score: it.score };
        });
    });

    const openSimulationDetail = async (simulationId: string) => {
        setShowDetailModal(true);
        setDetailLoading(true);
        setDetailError(null);
        try {
            const res = await fetch(route('coordinator-prodi.accreditation.simulations.show', simulationId), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (!res.ok) {
                throw new Error(`Gagal memuat detail simulasi (${res.status})`);
            }
            const simulation = await res.json();
            const allPoints = [...(programStandards ?? [])]
                .flatMap((st) => [...(st.criteria ?? [])])
                .flatMap((cr) => [...(cr.criteriaPoints ?? [])]);
            let baseScale = 400;
            try {
                if (typeof window !== 'undefined') {
                    const ls = window.localStorage.getItem('criteriaPointsBaseScale');
                    const n = ls ? parseFloat(ls) : NaN;
                    if (!Number.isNaN(n) && n > 0) {
                        baseScale = n;
                    }
                }
            } catch {}
            const indicatorVals = Object.values(currentScores || {}).map((v) => Number(v)).filter((v) => Number.isFinite(v));
            const avgIndicatorScore = indicatorVals.length > 0 ? indicatorVals.reduce((a, b) => a + b, 0) / indicatorVals.length : 0;
            const defaultScore = 3;
            const chosenScore = avgIndicatorScore > 0 ? avgIndicatorScore : defaultScore;
            const sumWeights = allPoints.reduce((acc, pt) => acc + Number(pt.max_score ?? 0), 0);
            const totalScore = chosenScore * sumWeights;
            const finalPercentage = baseScale > 0 ? (totalScore / baseScale) * 100 : 0;
            const grade =
                totalScore >= 361
                    ? 'Unggul'
                    : totalScore >= 301
                    ? 'Baik Sekali'
                    : totalScore >= 200
                    ? 'Baik'
                    : 'Tidak Terakreditasi';

            setDetail({
                ...simulation,
                criteria_point_scores: {},
                cp_total_score: Number(totalScore.toFixed(2)),
                cp_final_percentage: Number(finalPercentage.toFixed(2)),
                cp_grade: grade,
            });
        } catch (e: any) {
            setDetailError(e?.message || 'Terjadi kesalahan saat memuat detail simulasi');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleIndicatorScoreChange = (indicatorId: number, value: number) => {
        setIndicatorEdits((prev) => ({
            ...prev,
            [indicatorId.toString()]: value,
        }));
    };

    const handleIndicatorNoteChange = (indicatorId: number, value: string) => {
        setIndicatorNotes((prev) => ({
            ...prev,
            [indicatorId.toString()]: value,
        }));
    };

    const handleSaveIndicatorScore = (indicatorId: number) => {
        if (!cycleData?.id) {
            return;
        }
        const payload = {
            lam_indicator_id: indicatorId,
            score: indicatorEdits[indicatorId.toString()] ?? 0,
            notes: indicatorNotes[indicatorId.toString()] ?? '',
            source: 'coordinator',
        };
        router.post(`/coordinator-prodi/accreditation/cycles/${cycleData.id}/scores`, payload, {
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string }> = {
            draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
            active: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
            submitted: { label: 'Telah Dikirim', color: 'bg-blue-100 text-blue-800' },
            evaluating: { label: 'Sedang Dievaluasi', color: 'bg-yellow-100 text-yellow-800' },
            completed: { label: 'Selesai', color: 'bg-purple-100 text-purple-800' },
            archived: { label: 'Diarsipkan', color: 'bg-gray-100 text-gray-800' },
        };

        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getResultColor = (result: string) => {
        const colors: Record<string, string> = {
            'Unggul': 'bg-green-100 text-green-800',
            'Baik Sekali': 'bg-blue-100 text-blue-800',
            'Baik': 'bg-yellow-100 text-yellow-800',
            'Tidak Terakreditasi': 'bg-red-100 text-red-800',
        };
        return colors[result] || 'bg-gray-100 text-gray-800';
    };

    const toggleStandard = (standardId: number) => {
        setExpandedStandards((prev) => ({
            ...prev,
            [standardId]: !prev[standardId],
        }));
    };

    const handleCycleSelect = (cycleId: string) => {
        router.visit(route('coordinator-prodi.accreditation.simulation', cycleId));
        setActiveTab('criteria');
    };

    return (
        <>
            <Head title="Simulasi Akreditasi" />
            <DashboardLayout
                title="Simulasi Akreditasi"
                subtitle="Kelola siklus, kriteria, dan simulasi akreditasi"
            >
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('cycles')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'cycles'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Siklus Akreditasi
                        </button>
                        <button
                            onClick={() => setActiveTab('criteria')}
                            disabled={!cycleData}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'criteria'
                                    ? 'border-blue-500 text-blue-600'
                                    : cycleData
                                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                      : 'border-transparent text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Kriteria & Matriks
                        </button>
                        <button
                            onClick={() => setActiveTab('simulation')}
                            disabled={!cycle}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'simulation'
                                    ? 'border-blue-500 text-blue-600'
                                    : cycle
                                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                      : 'border-transparent text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Simulasi
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Cycles Tab */}
                    {activeTab === 'cycles' && (
                        <div className="space-y-6">
                            {/* Active Cycle Card */}
                            {activeCycle && (
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Siklus Aktif</h3>
                                            <p className="text-blue-100">{activeCycle.cycle_name}</p>
                                            <p className="text-sm text-blue-100 mt-1">
                                                {displayLamName(activeCycle.lam)} • Dimulai:{' '}
                                                {new Date(activeCycle.start_date).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCycleSelect(activeCycle.id)}
                                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
                                        >
                                            Lihat Detail
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">Daftar Siklus Akreditasi</h2>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Buat Siklus Baru
                                </button>
                            </div>

                            {/* Cycles Table */}
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nama Siklus
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                LAM
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Periode
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hasil
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {cycles.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                    Belum ada siklus akreditasi. Buat siklus baru untuk memulai.
                                                </td>
                                            </tr>
                                        ) : (
                                            cycles.map((c) => (
                                                <tr key={c.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{c.cycle_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{displayLamName(c.lam)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(c.start_date).toLocaleDateString('id-ID')}
                                                            {c.end_date && ` - ${new Date(c.end_date).toLocaleDateString('id-ID')}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(c.status)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {c.accreditation_result ? (
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {c.accreditation_result}
                                                                {c.final_score && ` (${c.final_score})`}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleCycleSelect(c.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Pilih
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Criteria Tab */}
                    {activeTab === 'criteria' && (
                        <div className="space-y-4">
                            {!cycleData ? (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Siklus Akreditasi</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Pilih siklus akreditasi dari tab Siklus Akreditasi terlebih dahulu.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Cycle Info */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-blue-900">{cycleData.cycle_name}</h3>
                                                <p className="text-sm text-blue-700 mt-1">{displayLamName(cycleData.lam)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setActiveTab('simulation')}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                                                >
                                                    Lihat Simulasi
                                                </button>
                                                <Link
                                                    href={route('coordinator-prodi.assessor-requests.create')}
                                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                                                >
                                                    Ajukan Asesor
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Standards */}
                                    {programStandards && programStandards.length > 0 ? (
                                        [...programStandards]
                                            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                            .flatMap((standard) =>
                                                [...(standard.criteria ?? [])]
                                                    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                                    .map((criterion) => ({ criterion, standard }))
                                            )
                                            .map(({ criterion, standard }) => (
                                                <div key={criterion.id} className="bg-white rounded-lg shadow">
                                                    <div className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 mb-3">
                                                            {`Kriteria ${standard.order_index}.${criterion.order_index}: ${criterion.name ?? ''}`}
                                                        </div>
                                                        <div className="space-y-3 ml-1 md:ml-4">
                                                            {criterion.criteriaPoints && criterion.criteriaPoints.length > 0 ? (
                                                                criterion.criteriaPoints
                                                                    .slice()
                                                                    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                                                    .map((point) => (
                                                                        <div key={point.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                                            <div className="flex items-start justify-between mb-2">
                                                                                <div className="flex-1">
                                                                                    <div className="font-medium text-gray-900">{point.title}</div>
                                                                                    {point.description && (
                                                                                        <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                                                                                    )}
                                                                                    {point.rubrics && point.rubrics.length > 0 && (
                                                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                                                            <div className="text-xs font-medium text-gray-500 mb-2">Rubrik Penilaian:</div>
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                                {point.rubrics.map((rubric) => (
                                                                                                    <div key={rubric.score} className="text-xs bg-gray-50 p-2 rounded">
                                                                                                        <span className="font-medium">Skor {rubric.score}:</span> {rubric.description ?? '-'}
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="ml-4">
                                                                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                                                                                        Maks Skor: {point.max_score}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                            ) : (
                                                                <div className="text-sm text-gray-500 italic">Tidak ada poin kriteria</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    ) : cycleData.lam?.standards && cycleData.lam.standards.length > 0 ? (
                                        cycleData.lam.standards.map((standard) => (
                                            <div key={standard.id} className="bg-white rounded-lg shadow">
                                                <button
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
                                                                                const score = scores[indicator.id.toString()];
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
                                                                                                {indicator.document_requirements &&
                                                                                                    Array.isArray(indicator.document_requirements) &&
                                                                                                    indicator.document_requirements.length > 0 && (
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
                                                                                            {score && (
                                                                                                <div className="ml-4">
                                                                                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                                                                                                        Skor: {score.score}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        {indicator.rubrics && Array.isArray(indicator.rubrics) && indicator.rubrics.length > 0 && (
                                                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                                                <div className="text-xs font-medium text-gray-500 mb-2">Rubrik Penilaian:</div>
                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                                    {indicator.rubrics.map((rubric) => (
                                                                                                        <div key={rubric.id} className="text-xs bg-gray-50 p-2 rounded">
                                                                                                            <span className="font-medium">Skor {rubric.score}:</span>{' '}
                                                                                                            {rubric.label && `${rubric.label} - `}
                                                                                                            {rubric.description}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                        <div className="mt-4 flex items-center gap-3">
                                                                                            <input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                max="4"
                                                                                                step="0.1"
                                                                                                value={
                                                                                                    indicatorEdits[indicator.id.toString()] ??
                                                                                                    score?.score ??
                                                                                                    0
                                                                                                }
                                                                                                onChange={(e) =>
                                                                                                    handleIndicatorScoreChange(
                                                                                                        indicator.id,
                                                                                                        parseFloat(e.target.value) || 0
                                                                                                    )
                                                                                                }
                                                                                                className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                                                                                            />
                                                                                            <input
                                                                                                type="text"
                                                                                                placeholder="Catatan (opsional)"
                                                                                                value={indicatorNotes[indicator.id.toString()] ?? ''}
                                                                                                onChange={(e) =>
                                                                                                    handleIndicatorNoteChange(indicator.id, e.target.value)
                                                                                                }
                                                                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                                                                                            />
                                                                                            <button
                                                                                                onClick={() => handleSaveIndicatorScore(indicator.id)}
                                                                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                                                                            >
                                                                                                Simpan
                                                                                            </button>
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
                                            Tidak ada standar kriteria yang tersedia
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Simulation Tab */}
                    {activeTab === 'simulation' && (
                        <div className="space-y-6">
                            {!cycle ? (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Siklus Akreditasi</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Pilih siklus akreditasi dari tab Siklus Akreditasi terlebih dahulu.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Cycle Info */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900">{cycle.cycle_name}</h3>
                                        <p className="text-sm text-blue-700 mt-1">{displayLamName(cycle.lam)}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleRunWithCurrentScores}
                                            disabled={runningCurrent}
                                            className={`bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 ${runningCurrent ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {runningCurrent ? 'Menjalankan...' : 'Jalankan dengan Skor Saat Ini'}
                                        </button>
                                        <button
                                            onClick={() => setShowRunModal(true)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Simulasi Manual
                                        </button>
                                    </div>
                                    {programSimulation && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <div className="text-sm text-blue-600 font-medium">Total Skor (Program)</div>
                                                <div className="text-2xl font-bold text-blue-900 mt-1">
                                                    {programSimulation.total_score.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-4">
                                                <div className="text-sm text-green-600 font-medium">Prediksi Hasil (Program)</div>
                                                <div className="text-2xl font-bold mt-1">
                                                    {programSimulation.predicted_result}
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="text-sm text-gray-600 font-medium">Kriteria Terhitung</div>
                                                <div className="text-2xl font-bold text-gray-900 mt-1">
                                                    {criteriaForChart.length}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(pieData.length > 0 || radarData.length > 0) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white rounded-lg shadow p-6">
                                                <h3 className="text-lg font-semibold mb-4">Distribusi Skor per Kriteria</h3>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={pieData}
                                                                dataKey="value"
                                                                nameKey="name"
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={50}
                                                                outerRadius={80}
                                                                paddingAngle={2}
                                                            >
                                                                {pieData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-lg shadow p-6">
                                                <h3 className="text-lg font-semibold mb-4">Radar Skor Kriteria</h3>
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart data={radarData}>
                                                            <PolarGrid />
                                                            <PolarAngleAxis dataKey="label" />
                                                            <PolarRadiusAxis angle={30} domain={[0, 4]} />
                                                            <Radar
                                                                dataKey="score"
                                                                stroke="#3b82f6"
                                                                fill="#93c5fd"
                                                                fillOpacity={0.5}
                                                            />
                                                            <Tooltip />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {programStandards && programStandards.length > 0 && (
                                        <div className="bg-white rounded-lg shadow p-6">
                                            <h3 className="text-lg font-semibold mb-4">Breakdown Bobot Kriteria Program</h3>
                                            <div className="space-y-5">
                                                {[...programStandards]
                                                    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                                    .flatMap((st) =>
                                                        [...(st.criteria ?? [])]
                                                            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                                            .map((cr) => ({ cr, stOrder: st.order_index, stId: st.id }))
                                                    )
                                                    .map(({ cr, stOrder, stId }) => {
                                                        const br = criteriaBreakdownMap[stId]?.[cr.id];
                                                        return (
                                                            <div key={cr.id} className="bg-white rounded-lg">
                                                                <div className="flex items-center justify-between px-3 py-2">
                                                                    <div className="text-sm text-gray-700">
                                                                        {`Kriteria ${stOrder}.${cr.order_index}: ${cr.name ?? ''}`}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{`Bobot: ${cr.weight}%`}</span>
                                                                        {br && (
                                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{`Skor: ${br.score.toFixed(2)}`}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1 ml-1 md:ml-4 space-y-2">
                                                                    {cr.criteriaPoints && cr.criteriaPoints.length > 0 ? (
                                                                        cr.criteriaPoints
                                                                            .slice()
                                                                            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                                                            .map((point) => (
                                                                                <div key={point.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                                                    <div className="flex items-start justify-between mb-1">
                                                                                        <div className="flex-1">
                                                                                            <div className="font-medium text-gray-900">{point.title}</div>
                                                                                            {point.description && (
                                                                                                <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="ml-4">
                                                                                            <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-lg text-xs font-medium">
                                                                                                {`Bobot: ${point.max_score}`}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    {point.rubrics && point.rubrics.length > 0 && (
                                                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                                                            <div className="text-xs font-medium text-gray-500 mb-2">Rubrik Penilaian:</div>
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                                {point.rubrics.map((rubric) => (
                                                                                                    <div key={rubric.score} className="text-xs bg-gray-50 p-2 rounded">
                                                                                                        <span className="font-medium">Skor {rubric.score}:</span> {rubric.description ?? '-'}
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        <div className="text-sm text-gray-500 italic">Tidak ada poin kriteria</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Latest Simulation Result */}
                                    {simulations.length > 0 && (
                                        <div className="bg-white rounded-lg shadow p-6">
                                            <h3 className="text-lg font-semibold mb-4">Hasil Simulasi Terakhir</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <div className="text-sm text-blue-600 font-medium">Total Skor</div>
                                                    <div className="text-2xl font-bold text-blue-900 mt-1">
                                                    {(() => {
                                                        const points = [...(programStandards ?? [])]
                                                            .flatMap((st) => [...(st.criteria ?? [])])
                                                            .flatMap((cr) => [...(cr.criteriaPoints ?? [])]);
                                                        const sumWeights = points.reduce((acc, pt) => acc + Number(pt.max_score ?? 0), 0);
                                                        const indicatorVals = Object.values(currentScores || {}).map((v) => Number(v)).filter((v) => Number.isFinite(v));
                                                        const avgIndicatorScore = indicatorVals.length > 0 ? indicatorVals.reduce((a, b) => a + b, 0) / indicatorVals.length : 0;
                                                        const defaultScore = 3;
                                                        const chosenScore = avgIndicatorScore > 0 ? avgIndicatorScore : defaultScore;
                                                        const total = chosenScore * sumWeights;
                                                        return Number(total.toFixed(2));
                                                    })()}
                                                    </div>
                                                </div>
                                                <div className="bg-green-50 rounded-lg p-4">
                                                    <div className="text-sm text-green-600 font-medium">Prediksi Hasil</div>
                                                    <div className={`text-2xl font-bold mt-1 ${(() => {
                                                        const points = [...(programStandards ?? [])]
                                                            .flatMap((st) => [...(st.criteria ?? [])])
                                                            .flatMap((cr) => [...(cr.criteriaPoints ?? [])]);
                                                        const sumWeights = points.reduce((acc, pt) => acc + Number(pt.max_score ?? 0), 0);
                                                        const indicatorVals = Object.values(currentScores || {}).map((v) => Number(v)).filter((v) => Number.isFinite(v));
                                                        const avgIndicatorScore = indicatorVals.length > 0 ? indicatorVals.reduce((a, b) => a + b, 0) / indicatorVals.length : 0;
                                                        const defaultScore = 3;
                                                        const chosenScore = avgIndicatorScore > 0 ? avgIndicatorScore : defaultScore;
                                                        const total = chosenScore * sumWeights;
                                                        const grade =
                                                            total >= 361
                                                                ? 'Unggul'
                                                                : total >= 301
                                                                ? 'Baik Sekali'
                                                                : total >= 200
                                                                ? 'Baik'
                                                                : 'Tidak Terakreditasi';
                                                        return getResultColor(grade).split(' ')[1];
                                                    })()}`}>
                                                        {(() => {
                                                            const points = [...(programStandards ?? [])]
                                                                .flatMap((st) => [...(st.criteria ?? [])])
                                                                .flatMap((cr) => [...(cr.criteriaPoints ?? [])]);
                                                            const sumWeights = points.reduce((acc, pt) => acc + Number(pt.max_score ?? 0), 0);
                                                            const indicatorVals = Object.values(currentScores || {}).map((v) => Number(v)).filter((v) => Number.isFinite(v));
                                                            const avgIndicatorScore = indicatorVals.length > 0 ? indicatorVals.reduce((a, b) => a + b, 0) / indicatorVals.length : 0;
                                                            const defaultScore = 3;
                                                            const chosenScore = avgIndicatorScore > 0 ? avgIndicatorScore : defaultScore;
                                                            const total = chosenScore * sumWeights;
                                                            const grade =
                                                                total >= 361
                                                                    ? 'Unggul'
                                                                    : total >= 301
                                                                    ? 'Baik Sekali'
                                                                    : total >= 200
                                                                    ? 'Baik'
                                                                    : 'Tidak Terakreditasi';
                                                            return grade;
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="text-sm text-gray-600 font-medium">Dibuat</div>
                                                    <div className="text-sm text-gray-900 mt-1">
                                                        {new Date(simulations[0].created_at).toLocaleString('id-ID')}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        oleh {simulations[0].creator?.name || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Simulation History */}
                                    <div className="bg-white rounded-lg shadow">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold">Riwayat Simulasi</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Skor</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prediksi Hasil</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibuat Oleh</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {simulations.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                                Belum ada simulasi. Jalankan simulasi untuk melihat hasil.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        simulations.map((sim) => (
                                                            <tr key={sim.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {new Date(sim.created_at).toLocaleString('id-ID')}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {(() => {
                                                                        const points = [...(programStandards ?? [])]
                                                                            .flatMap((st) => [...(st.criteria ?? [])])
                                                                            .flatMap((cr) => [...(cr.criteriaPoints ?? [])]);
                                                                        const sumWeights = points.reduce((acc, pt) => acc + Number(pt.max_score ?? 0), 0);
                                                                        const indicatorVals = Object.values(currentScores || {}).map((v) => Number(v)).filter((v) => Number.isFinite(v));
                                                                        const avgIndicatorScore = indicatorVals.length > 0 ? indicatorVals.reduce((a, b) => a + b, 0) / indicatorVals.length : 0;
                                                                        const defaultScore = 3;
                                                                        const chosenScore = avgIndicatorScore > 0 ? avgIndicatorScore : defaultScore;
                                                                        const total = chosenScore * sumWeights;
                                                                        return Number(total.toFixed(2));
                                                                    })()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {(() => {
                                                                        const points = [...(programStandards ?? [])]
                                                                            .flatMap((st) => [...(st.criteria ?? [])])
                                                                            .flatMap((cr) => [...(cr.criteriaPoints ?? [])]);
                                                                        const sumWeights = points.reduce((acc, pt) => acc + Number(pt.max_score ?? 0), 0);
                                                                        const indicatorVals = Object.values(currentScores || {}).map((v) => Number(v)).filter((v) => Number.isFinite(v));
                                                                        const avgIndicatorScore = indicatorVals.length > 0 ? indicatorVals.reduce((a, b) => a + b, 0) / indicatorVals.length : 0;
                                                                        const defaultScore = 3;
                                                                        const chosenScore = avgIndicatorScore > 0 ? avgIndicatorScore : defaultScore;
                                                                        const total = chosenScore * sumWeights;
                                                                        const grade =
                                                                            total >= 361
                                                                                ? 'Unggul'
                                                                                : total >= 301
                                                                                ? 'Baik Sekali'
                                                                                : total >= 200
                                                                                ? 'Baik'
                                                                                : 'Tidak Terakreditasi';
                                                                        return (
                                                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(grade)}`}>
                                                                                {grade}
                                                                            </span>
                                                                        );
                                                                    })()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {sim.creator?.name || 'N/A'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                                    <button
                                                                        onClick={() => openSimulationDetail(sim.id)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                    >
                                                                        Detail
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {showDetailModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Detail Simulasi</h3>
                                    {detail && (
                                        <div className="mt-1 text-sm text-gray-600">
                                            <span className="mr-4">Total Skor: <span className="font-medium text-gray-900">{Number((detail as any).cp_total_score ?? 0).toFixed(2)}</span></span>
                                            <span className="mr-4">Nilai Akhir: <span className="font-medium text-gray-900">{Number((detail as any).cp_final_percentage ?? 0).toFixed(2)}%</span></span>
                                            <span>Prediksi: <span className="font-medium text-gray-900">{(detail as any).cp_grade ?? detail.predicted_result}</span></span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setDetail(null);
                                        setDetailError(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {detailLoading && (
                                <div className="mt-6 text-center text-gray-600">Memuat detail...</div>
                            )}
                            {detailError && (
                                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">{detailError}</div>
                            )}
                            {!detailLoading && !detailError && detail && (
                                <div className="mt-6 space-y-6">
                                <div className="bg-white rounded-lg">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">Skor per Kriteria</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kriteria</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bobot Kriteria</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Skor Total</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Maksimum</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Persentase</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {(() => {
                                                    const indicatorVals = Object.values(currentScores || {}).map((v) => Number(v)).filter((v) => Number.isFinite(v));
                                                    const avgIndicatorScore = indicatorVals.length > 0 ? indicatorVals.reduce((a, b) => a + b, 0) / indicatorVals.length : 0;
                                                    const defaultScore = 3;
                                                    const chosenScore = avgIndicatorScore > 0 ? avgIndicatorScore : defaultScore;
                                                    const criteriaList = [...(programStandards ?? [])]
                                                        .flatMap((st) => [...(st.criteria ?? [])])
                                                        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                                        .map((cr) => {
                                                            const points = [...(cr.criteriaPoints ?? [])];
                                                            const weightSum = points.reduce((acc, pt) => acc + Number(pt.max_score ?? 0), 0);
                                                            const totalScore = points.reduce((acc, pt) => acc + chosenScore * Number(pt.max_score ?? 0), 0);
                                                            const maxScore = weightSum * 4;
                                                            const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
                                                            return {
                                                                id: cr.id,
                                                                name: cr.name,
                                                                weightSum,
                                                                totalScore,
                                                                maxScore,
                                                                percentage,
                                                            };
                                                        });
                                                    return criteriaList.map((c) => (
                                                        <tr key={`crit-${c.id}`} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 text-sm text-gray-700">{c.name}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-700">{Number(c.weightSum).toFixed(2)}</td>
                                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{Number(c.totalScore).toFixed(2)}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-700">{Number(c.maxScore).toFixed(2)}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-700">{Number(c.percentage).toFixed(2)}%</td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                    <div className="bg-white rounded-lg mt-6">
                                        <h4 className="text-md font-semibold text-gray-900 mb-3">Skor per Poin Kriteria</h4>
                                        {(programStandards ?? []).length === 0 ? (
                                            <div className="text-sm text-gray-500">Tidak ada data poin kriteria.</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {(() => {
                                                    const cpScores = detail?.criteria_point_scores ?? {};
                                                    const scoreValues = Object.values(cpScores);
                                                    const noScores = scoreValues.length === 0 || scoreValues.every((v) => Number(v) === 0);
                                                    return noScores ? (
                                                        <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
                                                            Belum ada penilaian asesor untuk poin kriteria. Skor akan muncul setelah evaluasi dilakukan.
                                                        </div>
                                                    ) : null;
                                                })()}
                                                {(() => {
                                                    const list = [...(programStandards ?? [])]
                                                        .flatMap((st) => [...(st.criteria ?? [])])
                                                        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
                                                    return list.map((cr) => (
                                                        <div key={`prog-cr-${cr.id}`} className="border rounded">
                                                            <div className="px-3 py-2 bg-gray-50 text-sm text-gray-700">
                                                                Kriteria {cr.order_index} • {cr.name} • Bobot {cr.weight}
                                                            </div>
                                                            <div className="p-3">
                                                                <div className="overflow-x-auto">
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Poin Kriteria</th>
                                                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bobot</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {[...(cr.criteriaPoints ?? [])]
                                                                                .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                                                                                .map((pt) => (
                                                                                    <tr key={`prog-pt-${pt.id}`} className="hover:bg-gray-50">
                                                                                        <td className="px-3 py-2 text-sm text-gray-700">{pt.title}</td>
                                                                                        <td className="px-3 py-2 text-sm text-gray-700">{pt.max_score}</td>
                                                                                    </tr>
                                                                                ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-lg shadow p-6">
                                            <h4 className="text-md font-semibold text-gray-900 mb-3">Radar Skor Kriteria</h4>
                                            <div className="h-60">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart
                                                        data={Object.values(detail?.criteria_breakdown ?? {})
                                                            .flat()
                                                            .map((cr: any) => ({
                                                                label: cr.code,
                                                                score: Number(cr.score),
                                                            }))}
                                                    >
                                                        <PolarGrid />
                                                        <PolarAngleAxis dataKey="label" />
                                                        <PolarRadiusAxis angle={30} domain={[0, 4]} />
                                                        <Radar dataKey="score" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.5} />
                                                        <Tooltip />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow p-6">
                                            <h4 className="text-md font-semibold text-gray-900 mb-3">Distribusi Skor Kriteria</h4>
                                            <div className="text-sm text-gray-600">Visualisasi skor kriteria ditampilkan pada radar chart di sebelah kiri.</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Create Cycle Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Buat Siklus Akreditasi Baru</h3>
                            <form onSubmit={handleCreateCycle} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LAM Framework</label>
                                    <select
                                        value={data.lam_id || defaultLamId}
                                        onChange={(e) => setData('lam_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    >
                                        <option value={defaultLamId || ''} disabled={!defaultLamId}>
                                            {programLamName || (prodi as any)?.lam?.name || 'LAM belum diatur'}
                                        </option>
                                    </select>
                                    {errors.lam_id && <p className="text-red-500 text-xs mt-1">{errors.lam_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Siklus</label>
                                    <input
                                        type="text"
                                        value={data.cycle_name}
                                        onChange={(e) => setData('cycle_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                    {errors.cycle_name && <p className="text-red-500 text-xs mt-1">{errors.cycle_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Pengajuan (Opsional)</label>
                                    <input
                                        type="date"
                                        value={data.target_submission_date}
                                        onChange={(e) => setData('target_submission_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Run Simulation Modal */}
                {showRunModal && cycle && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">Simulasi Manual</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Masukkan skor untuk setiap indikator. Skor akan digunakan untuk menghitung prediksi hasil akreditasi.
                            </p>
                            <div className="space-y-4">
                                {(cycleData?.lam?.standards ?? []).flatMap((st) =>
                                    (st.elements ?? []).flatMap((el) =>
                                        (el.indicators ?? []).map((ind) => ind)
                                    )
                                ).map((ind) => {
                                    const indicatorId = ind.id.toString();
                                    return (
                                        <div key={indicatorId} className="flex items-center gap-3">
                                            <label className="flex-1 text-sm text-gray-700">
                                                {ind.code}: {ind.name}
                                                <span className="ml-2 text-xs text-gray-500">Bobot {ind.weight}</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="4"
                                                step="0.1"
                                                value={
                                                    simulationForm.data.indicator_scores[indicatorId] ??
                                                    currentScores[indicatorId] ??
                                                    0
                                                }
                                                onChange={(e) => {
                                                    simulationForm.setData('indicator_scores', {
                                                        ...simulationForm.data.indicator_scores,
                                                        [indicatorId]: parseFloat(e.target.value) || 0,
                                                    });
                                                }}
                                                className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-3 pt-4 mt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowRunModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleRunSimulation}
                                    disabled={simulationForm.processing}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {simulationForm.processing ? 'Menjalankan...' : 'Jalankan Simulasi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}
