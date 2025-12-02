import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Statistic {
    program: string;
    unit: string;
    total_criteria: number;
    evaluated_criteria: number;
    progress: number;
    average_score: number;
    weak_criteria: number;
    strong_criteria: number;
    radar_data: {
        input: number;
        process: number;
        output: number;
        impact: number;
    };
    criteria_details: Array<{
        criterion: string;
        score: number;
        status: string | null;
    }>;
}

interface Props {
    statistics: Statistic[];
    programs: Array<{ id: number; name: string }>;
    filters: {
        program_id?: number;
    };
}

export default function StatisticsPerProgram({ statistics, programs, filters }: Props) {
    const [selectedProgram, setSelectedProgram] = useState(filters.program_id?.toString() || '');

    const handleFilter = () => {
        router.get(route('assessor-internal.statistics.per-program'), {
            program_id: selectedProgram || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Prepare radar chart data
    const radarData = statistics.map((stat) => ({
        program: `${stat.program} - ${stat.unit}`,
        Input: stat.radar_data.input,
        Proses: stat.radar_data.process,
        Output: stat.radar_data.output,
        Dampak: stat.radar_data.impact,
    }));

    // Prepare progress bar data
    const progressData = statistics.map((stat) => ({
        program: `${stat.program} - ${stat.unit}`,
        progress: stat.progress,
        average: stat.average_score,
    }));

    return (
        <DashboardLayout title="Statistik Per Prodi" subtitle="Overview penilaian per program studi">
            <Head title="Statistik Per Prodi" />

            <div className="space-y-6">
                {/* Filter */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
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
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {statistics.length > 0 ? (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-sm text-gray-600">Total Prodi</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.length}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {statistics.length > 0
                                        ? (statistics.reduce((sum, s) => sum + s.average_score, 0) / statistics.length).toFixed(2)
                                        : '0.00'}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-sm text-gray-600">Total Kriteria Dievaluasi</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {statistics.reduce((sum, s) => sum + s.evaluated_criteria, 0)}
                                </p>
                            </div>
                        </div>

                        {/* Statistics per Program */}
                        {statistics.map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg shadow p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{stat.program}</h3>
                                        <p className="text-sm text-gray-600">{stat.unit}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                                        <p className="text-2xl font-bold text-blue-600">{stat.average_score.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Progress Penilaian</span>
                                        <span className="text-sm text-gray-600">
                                            {stat.evaluated_criteria} / {stat.total_criteria} kriteria ({stat.progress.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                            className="bg-blue-600 h-4 rounded-full transition-all"
                                            style={{ width: `${stat.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Criteria Highlights */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-red-800">Kriteria Lemah</p>
                                        <p className="text-2xl font-bold text-red-600">{stat.weak_criteria}</p>
                                        <p className="text-xs text-red-600 mt-1">Nilai &lt; 2.5</p>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-green-800">Kriteria Kuat</p>
                                        <p className="text-2xl font-bold text-green-600">{stat.strong_criteria}</p>
                                        <p className="text-xs text-green-600 mt-1">Nilai ≥ 3.5</p>
                                    </div>
                                </div>

                                {/* Radar Chart */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-4">Grafik Radar (Input → Proses → Output → Dampak)</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={[
                                            { category: 'Input', value: stat.radar_data.input },
                                            { category: 'Proses', value: stat.radar_data.process },
                                            { category: 'Output', value: stat.radar_data.output },
                                            { category: 'Dampak', value: stat.radar_data.impact },
                                        ]}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="category" />
                                            <PolarRadiusAxis angle={90} domain={[0, 4]} />
                                            <Radar
                                                name={`${stat.program} - ${stat.unit}`}
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.6}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                    <div className="mt-4 grid grid-cols-4 gap-4 text-center text-xs text-gray-600">
                                        <div>
                                            <p className="font-medium">Input: {stat.radar_data.input.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Proses: {stat.radar_data.process.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Output: {stat.radar_data.output.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">Dampak: {stat.radar_data.impact.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Criteria Details */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Detail Kriteria</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kriteria</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {stat.criteria_details.map((detail, idx) => (
                                                    <tr key={idx} className={detail.score < 2.5 ? 'bg-red-50' : detail.score >= 3.5 ? 'bg-green-50' : ''}>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{detail.criterion}</td>
                                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{detail.score.toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-600">
                                                            {detail.status ? (
                                                                <span className={`px-2 py-1 text-xs rounded ${
                                                                    detail.status === 'passed' ? 'bg-green-100 text-green-800' :
                                                                    detail.status === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {detail.status === 'passed' ? 'Lulus' :
                                                                     detail.status === 'needs_improvement' ? 'Butuh Perbaikan' :
                                                                     'Tidak Memadai'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Comparison Chart */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Progress Antar Prodi</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={progressData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="program" angle={-45} textAnchor="end" height={100} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="progress" fill="#3b82f6" name="Progress (%)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">Tidak ada data statistik untuk ditampilkan</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

