import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Statistic {
    criterion_id: number;
    criterion_name: string;
    total_units: number;
    average_score: number;
    min_score: number;
    max_score: number;
    distribution: {
        A: number;
        B: number;
        C: number;
        D: number;
    };
    units: Array<{
        unit: string;
        score: number;
    }>;
    problem_count: number;
    is_problematic: boolean;
}

interface Props {
    statistics: Statistic[];
}

const COLORS = {
    A: '#10b981', // green
    B: '#3b82f6', // blue
    C: '#f59e0b', // yellow
    D: '#ef4444', // red
};

export default function StatisticsPerCriterion({ statistics }: Props) {
    // Prepare distribution chart data
    const distributionData = statistics.map((stat) => ({
        criterion: stat.criterion_name,
        A: stat.distribution.A,
        B: stat.distribution.B,
        C: stat.distribution.C,
        D: stat.distribution.D,
    }));

    // Prepare comparison chart data
    const comparisonData = statistics.map((stat) => ({
        criterion: stat.criterion_name,
        'Rata-rata': stat.average_score,
        'Min': stat.min_score,
        'Max': stat.max_score,
    }));

    // Overall distribution
    const overallDistribution = statistics.reduce(
        (acc, stat) => ({
            A: acc.A + stat.distribution.A,
            B: acc.B + stat.distribution.B,
            C: acc.C + stat.distribution.C,
            D: acc.D + stat.distribution.D,
        }),
        { A: 0, B: 0, C: 0, D: 0 }
    );

    const pieData = [
        { name: 'A (≥3.5)', value: overallDistribution.A, color: COLORS.A },
        { name: 'B (2.5-3.5)', value: overallDistribution.B, color: COLORS.B },
        { name: 'C (1.5-2.5)', value: overallDistribution.C, color: COLORS.C },
        { name: 'D (<1.5)', value: overallDistribution.D, color: COLORS.D },
    ];

    return (
        <DashboardLayout title="Statistik Per Kriteria" subtitle="Distribusi nilai dan perbandingan antar-Prodi">
            <Head title="Statistik Per Kriteria" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Total Kriteria</p>
                        <p className="text-2xl font-bold text-gray-900">{statistics.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Kriteria Bermasalah</p>
                        <p className="text-2xl font-bold text-red-600">
                            {statistics.filter((s) => s.is_problematic).length}
                        </p>
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
                        <p className="text-sm text-gray-600">Total Unit Dievaluasi</p>
                        <p className="text-2xl font-bold text-green-600">
                            {statistics.reduce((sum, s) => sum + s.total_units, 0)}
                        </p>
                    </div>
                </div>

                {/* Overall Distribution Pie Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Nilai Keseluruhan (Skala BAN-PT)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Distribution by Criterion */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Nilai Per Kriteria</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={distributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="criterion" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="A" stackId="a" fill={COLORS.A} name="A (≥3.5)" />
                            <Bar dataKey="B" stackId="a" fill={COLORS.B} name="B (2.5-3.5)" />
                            <Bar dataKey="C" stackId="a" fill={COLORS.C} name="C (1.5-2.5)" />
                            <Bar dataKey="D" stackId="a" fill={COLORS.D} name="D (<1.5)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Comparison Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Nilai Antar Kriteria</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="criterion" angle={-45} textAnchor="end" height={100} />
                            <YAxis domain={[0, 4]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Rata-rata" fill="#3b82f6" name="Rata-rata" />
                            <Bar dataKey="Min" fill="#f59e0b" name="Min" />
                            <Bar dataKey="Max" fill="#10b981" name="Max" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Criteria Details */}
                <div className="space-y-4">
                    {statistics.map((stat) => (
                        <div
                            key={stat.criterion_id}
                            className={`bg-white rounded-lg shadow p-6 ${
                                stat.is_problematic ? 'border-l-4 border-red-500' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{stat.criterion_name}</h4>
                                    {stat.is_problematic && (
                                        <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                            Kriteria Bermasalah
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Rata-rata</p>
                                    <p className="text-2xl font-bold text-blue-600">{stat.average_score.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-600">Total Unit</p>
                                    <p className="text-lg font-semibold text-gray-900">{stat.total_units}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Nilai Min</p>
                                    <p className="text-lg font-semibold text-gray-900">{stat.min_score.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Nilai Max</p>
                                    <p className="text-lg font-semibold text-gray-900">{stat.max_score.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Masalah</p>
                                    <p className="text-lg font-semibold text-red-600">{stat.problem_count}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Distribusi (Skala BAN-PT)</p>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.A }} />
                                        <span className="text-xs text-gray-600">A: {stat.distribution.A}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.B }} />
                                        <span className="text-xs text-gray-600">B: {stat.distribution.B}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.C }} />
                                        <span className="text-xs text-gray-600">C: {stat.distribution.C}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.D }} />
                                        <span className="text-xs text-gray-600">D: {stat.distribution.D}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Units Comparison */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Perbandingan Antar Prodi</p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prodi</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stat.units.map((unit, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{unit.unit}</td>
                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{unit.score.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
