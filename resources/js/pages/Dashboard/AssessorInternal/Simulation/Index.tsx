import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Target {
    target_score: number;
    target_grade: string;
    year: number;
    gap: number;
}

interface GapAnalysis {
    low_scores: Array<{
        category: string;
        criterion: string;
        score: number;
    }>;
    large_gaps: Array<{
        category: string;
        criterion: string;
        score: number;
        weight: number;
        potential_improvement: number;
    }>;
    improvement_opportunities: Array<{
        category: string;
        criterion: string;
        score: number;
        potential_improvement: number;
    }>;
}

interface CriterionDetail {
    criterion_id: number;
    criterion_name: string;
    score: number;
    weight: number;
    weighted_score: number;
    status: string | null;
    notes: string | null;
    evaluation_file: { name: string; path: string } | null;
    indicators: {
        fulfilled: number;
        not_fulfilled: number;
        total: number;
    };
}

interface Simulation {
    program: string;
    unit: string;
    program_id: number | null;
    unit_id: string | null;
    final_score: number;
    final_grade: string;
    banpt_grade: string;
    total_weight: number;
    criteria_count: number;
    target: Target | null;
    criteria_breakdown: Record<string, CriterionDetail[]>;
    gap_analysis: GapAnalysis;
}

interface Props {
    simulations: Simulation[];
    programs: Array<{ id: number; name: string }>;
    units: Array<{ id: string; name: string }>;
    filters: {
        program_id?: number;
        unit_id?: string;
    };
}

const CATEGORY_COLORS: Record<string, string> = {
    'Visi Misi': '#3b82f6',
    'Tata Pamong': '#10b981',
    'SDM Dosen': '#f59e0b',
    'Mahasiswa': '#8b5cf6',
    'Penelitian': '#ef4444',
    'Pengabdian Masyarakat': '#06b6d4',
    'Kerjasama': '#ec4899',
    'Luaran & Dampak': '#84cc16',
    'Lainnya': '#6b7280',
};

export default function SimulationIndex({ simulations, programs, units, filters }: Props) {
    const [selectedProgram, setSelectedProgram] = useState(filters.program_id?.toString() || '');
    const [selectedUnit, setSelectedUnit] = useState(filters.unit_id || '');

    const handleFilter = () => {
        router.get(route('assessor-internal.simulation'), {
            program_id: selectedProgram || undefined,
            unit_id: selectedUnit || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = (type: 'pdf' | 'excel') => {
        const url = type === 'pdf'
            ? route('assessor-internal.simulation.export.pdf', {
                program_id: selectedProgram || undefined,
                unit_id: selectedUnit || undefined,
            })
            : route('assessor-internal.simulation.export.excel', {
                program_id: selectedProgram || undefined,
                unit_id: selectedUnit || undefined,
            });
        window.open(url, '_blank');
    };

    const getGradeColor = (grade: string): string => {
        switch (grade) {
            case 'A':
            case 'Unggul':
                return 'text-green-600 bg-green-100';
            case 'B':
            case 'Baik Sekali':
            case 'Baik':
                return 'text-blue-600 bg-blue-100';
            case 'C':
            case 'Cukup':
                return 'text-yellow-600 bg-yellow-100';
            case 'D':
            case 'Kurang':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <DashboardLayout title="Simulasi Akreditasi" subtitle="Simulasi skor akhir akreditasi berdasarkan penilaian">
            <Head title="Simulasi Akreditasi" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                            <select
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua Program</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit/Prodi</label>
                            <select
                                value={selectedUnit}
                                onChange={(e) => setSelectedUnit(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua Unit</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleFilter}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                                Filter
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                                    title="Export PDF"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleExport('excel')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                                    title="Export Excel"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {simulations.length > 0 ? (
                    simulations.map((simulation, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{simulation.program}</h3>
                                    <p className="text-sm text-gray-600">{simulation.unit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Nilai Akhir</p>
                                    <p className="text-3xl font-bold text-blue-600">{simulation.final_score.toFixed(2)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-3 py-1 text-sm font-medium rounded ${getGradeColor(simulation.final_grade)}`}>
                                            {simulation.final_grade}
                                        </span>
                                        <span className={`px-3 py-1 text-sm font-medium rounded ${getGradeColor(simulation.banpt_grade)}`}>
                                            {simulation.banpt_grade} (BAN-PT)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Target Comparison */}
                            {simulation.target && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-3">Perbandingan dengan Target Prodi</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-blue-600">Target ({simulation.target.year})</p>
                                            <p className="text-lg font-bold text-blue-900">
                                                {simulation.target.target_score.toFixed(2)} ({simulation.target.target_grade})
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600">Realisasi</p>
                                            <p className="text-lg font-bold text-blue-900">{simulation.final_score.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600">Gap</p>
                                            <p className={`text-lg font-bold ${simulation.target.gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {simulation.target.gap >= 0 ? '+' : ''}{simulation.target.gap.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Criteria Breakdown by Category */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Breakdown Per Kriteria</h4>
                                {Object.entries(simulation.criteria_breakdown).map(([category, criteria]) => (
                                    <div key={category} className="mb-6 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: CATEGORY_COLORS[category] || '#6b7280' }}
                                            />
                                            <h5 className="text-md font-semibold text-gray-900">{category}</h5>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kriteria</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bobot</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nilai Tertimbang</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Indikator</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {criteria.map((criterion) => (
                                                        <tr key={criterion.criterion_id} className={criterion.score < 2.5 ? 'bg-red-50' : ''}>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{criterion.criterion_name}</td>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{criterion.score.toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {typeof criterion.weight === 'number' ? criterion.weight.toFixed(2) : criterion.weight || '0.00'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                                {typeof criterion.weighted_score === 'number' ? criterion.weighted_score.toFixed(2) : criterion.weighted_score || '0.00'}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {criterion.status ? (
                                                                    <span className={`px-2 py-1 text-xs rounded ${
                                                                        criterion.status === 'passed' ? 'bg-green-100 text-green-800' :
                                                                        criterion.status === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {criterion.status === 'passed' ? 'Lulus' :
                                                                         criterion.status === 'needs_improvement' ? 'Butuh Perbaikan' :
                                                                         'Tidak Memadai'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                                {criterion.indicators.fulfilled} / {criterion.indicators.total} terpenuhi
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {criterion.evaluation_file && (
                                                                    <Link
                                                                        href={route('assessor-internal.evaluation-notes.download', {
                                                                            id: 'temp', // This would need proper ID
                                                                            type: 'evaluation',
                                                                        })}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                    </Link>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Gap Analysis */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Gap Analysis</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Low Scores */}
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h5 className="text-sm font-semibold text-red-900 mb-2">Kriteria Skor Rendah</h5>
                                        {simulation.gap_analysis.low_scores.length > 0 ? (
                                            <ul className="space-y-1">
                                                {simulation.gap_analysis.low_scores.slice(0, 5).map((item, idx) => (
                                                    <li key={idx} className="text-xs text-red-700">
                                                        {item.criterion} ({item.score.toFixed(2)})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-red-600">Tidak ada</p>
                                        )}
                                    </div>

                                    {/* Large Gaps */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h5 className="text-sm font-semibold text-yellow-900 mb-2">Gap Besar (Perlu Dokumentasi)</h5>
                                        {simulation.gap_analysis.large_gaps.length > 0 ? (
                                            <ul className="space-y-1">
                                                {simulation.gap_analysis.large_gaps.slice(0, 5).map((item, idx) => (
                                                    <li key={idx} className="text-xs text-yellow-700">
                                                        {item.criterion} (Gap: {item.potential_improvement.toFixed(2)})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-yellow-600">Tidak ada</p>
                                        )}
                                    </div>

                                    {/* Improvement Opportunities */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h5 className="text-sm font-semibold text-green-900 mb-2">Peluang Peningkatan</h5>
                                        {simulation.gap_analysis.improvement_opportunities.length > 0 ? (
                                            <ul className="space-y-1">
                                                {simulation.gap_analysis.improvement_opportunities.slice(0, 5).map((item, idx) => (
                                                    <li key={idx} className="text-xs text-green-700">
                                                        {item.criterion} (Potensi: +{item.potential_improvement.toFixed(2)})
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-green-600">Tidak ada</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Visualisasi Nilai per Kategori</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={Object.entries(simulation.criteria_breakdown).map(([category, criteria]) => ({
                                            category,
                                            'Rata-rata Nilai': criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length,
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                                        <YAxis domain={[0, 4]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Rata-rata Nilai" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">Tidak ada data simulasi untuk ditampilkan</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

