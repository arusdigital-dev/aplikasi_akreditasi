import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Program {
    id: string;
    name: string;
}

interface Criteria {
    criteria_id: string;
    criteria_name: string;
    total_evaluations: number;
    average_score: number;
    max_score: number;
}

interface Assessor {
    assessor_id: string;
    assessor_name: string;
    total_evaluations: number;
    average_score: number;
}

interface Props {
    summary: {
        total_evaluations: number;
        average_score: number;
        max_score: number;
        min_score: number;
    };
    perCriteria: Criteria[];
    perAssessor: Assessor[];
    scoreDistribution: Record<string, number>;
    progressPerCriteria: Criteria[];
    timelineEvaluations: Array<{
        date: string;
        count: number;
        average_score: number;
    }>;
    programs: Program[];
    filters: {
        program_id?: string;
        criteria_id?: string;
        assessor_id?: string;
        year?: number;
    };
}

export default function AssessmentStatistics({ summary, perCriteria, perAssessor, scoreDistribution, progressPerCriteria, timelineEvaluations, programs, filters }: Props) {
    const [selectedProgram, setSelectedProgram] = useState(filters.program_id || '');
    const [year, setYear] = useState(filters.year || new Date().getFullYear());

    const handleFilter = () => {
        router.get(route('coordinator-prodi.statistics.assessment'), {
            program_id: selectedProgram || undefined,
            year: year,
        });
    };

    return (
        <DashboardLayout title="Statistik Penilaian" subtitle="Statistik penilaian dari asesor">
            <Head title="Statistik Penilaian" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                min="2020"
                                max="2030"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Total Evaluasi</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{summary.total_evaluations}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Rata-rata Skor</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{summary.average_score.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Skor Tertinggi</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">{summary.max_score.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Skor Terendah</p>
                        <p className="text-2xl font-bold text-red-600 mt-2">{summary.min_score.toFixed(2)}</p>
                    </div>
                </div>

                {/* Per Criteria */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Per Kriteria</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kriteria</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Evaluasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rata-rata Skor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor Maks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {perCriteria.length > 0 ? (
                                    perCriteria.map((criteria) => (
                                        <tr key={criteria.criteria_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {criteria.criteria_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {criteria.total_evaluations}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {criteria.average_score.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {criteria.max_score.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Per Assessor */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistik Per Asesor</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asesor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Evaluasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rata-rata Skor</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {perAssessor.length > 0 ? (
                                    perAssessor.map((assessor) => (
                                        <tr key={assessor.assessor_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {assessor.assessor_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {assessor.total_evaluations}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {assessor.average_score.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Score Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Skor</h2>
                    <div className="space-y-3">
                        {Object.entries(scoreDistribution).map(([range, count]) => (
                            <div key={range}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-700">{range}</span>
                                    <span className="text-sm font-medium text-gray-900">{count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: `${summary.total_evaluations > 0 ? (count / summary.total_evaluations) * 100 : 0}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

