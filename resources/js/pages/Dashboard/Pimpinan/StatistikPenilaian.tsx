import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DistribusiPredikat {
    unggul: number;
    sangat_baik: number;
    baik: number;
    cukup: number;
    kurang: number;
}

interface StatusPenilaian {
    selesai: number;
    pending: number;
    overdue: number;
    timeline: Array<{
        week: string;
        week_label: string;
        completed: number;
    }>;
}

interface KecepatanAsesor {
    rata_rata_durasi: Array<{
        assessor_id: string;
        assessor: string;
        durasi_rata_rata: number;
        jumlah_penilaian: number;
    }>;
    backlog: Array<{
        assessor_id: string;
        assessor: string;
        pending_count: number;
    }>;
    kriteria_terlambat: Array<{
        criteria_id: number;
        criteria: string;
        terlambat_count: number;
    }>;
}

interface PenyebaranNilai {
    kriteria: string;
    nilai_rata_rata: number;
    jumlah_penilaian: number;
}

interface Props {
    level: 'universitas' | 'fakultas' | 'prodi' | null;
    userRole: string;
    distribusiPredikat: DistribusiPredikat;
    statusPenilaian: StatusPenilaian;
    kecepatanAsesor: KecepatanAsesor;
    penyebaranNilai: PenyebaranNilai[];
}

const PREDIKAT_COLORS = {
    unggul: '#10b981',
    sangat_baik: '#3b82f6',
    baik: '#f59e0b',
    cukup: '#f97316',
    kurang: '#ef4444',
};

const getHeatmapColor = (value: number): string => {
    if (value >= 3.5) {
        return '#10b981';
    }
    if (value >= 3.0) {
        return '#3b82f6';
    }
    if (value >= 2.5) {
        return '#f59e0b';
    }
    if (value >= 2.0) {
        return '#f97316';
    }
    return '#ef4444';
};

export default function StatistikPenilaian({
    level,
    userRole,
    distribusiPredikat,
    statusPenilaian,
    kecepatanAsesor,
    penyebaranNilai,
}: Props) {
    // Prepare pie chart data for distribusi predikat
    const pieData = [
        { name: 'Unggul', value: distribusiPredikat.unggul, color: PREDIKAT_COLORS.unggul },
        { name: 'Sangat Baik', value: distribusiPredikat.sangat_baik, color: PREDIKAT_COLORS.sangat_baik },
        { name: 'Baik', value: distribusiPredikat.baik, color: PREDIKAT_COLORS.baik },
        { name: 'Cukup', value: distribusiPredikat.cukup, color: PREDIKAT_COLORS.cukup },
        { name: 'Kurang', value: distribusiPredikat.kurang, color: PREDIKAT_COLORS.kurang },
    ].filter((item) => item.value > 0);

    const totalProdi = pieData.reduce((sum, item) => sum + item.value, 0);

    return (
        <DashboardLayout title="Statistik Penilaian" subtitle="Akses cepat dan pemahaman pola penilaian asesor">
            <Head title="Statistik Penilaian" />

            <div className="space-y-6">
                {/* Distribusi Predikat Akreditasi */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Predikat Akreditasi</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center">
                            <div className="space-y-3">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{totalProdi}</p>
                                    <p className="text-sm text-gray-500">Total Prodi</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {pieData.map((item) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.value} prodi</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jumlah Penilaian Selesai vs Pending */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Jumlah Penilaian Selesai vs Pending</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-600">{statusPenilaian.selesai}</div>
                                <div className="text-sm text-green-700 mt-1">Selesai</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-yellow-600">{statusPenilaian.pending}</div>
                                <div className="text-sm text-yellow-700 mt-1">Pending</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-red-600">{statusPenilaian.overdue}</div>
                                <div className="text-sm text-red-700 mt-1">Overdue</div>
                            </div>
                        </div>

                        {/* Timeline Chart */}
                        <div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={statusPenilaian.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week_label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        name="Penilaian Selesai"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Kecepatan Penilaian Asesor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rata-rata Durasi Penilaian per Asesor */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rata-rata Durasi Penilaian per Asesor</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={kecepatanAsesor.rata_rata_durasi.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="assessor" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="durasi_rata_rata" fill="#3b82f6" name="Durasi (hari)">
                                    {kecepatanAsesor.rata_rata_durasi.slice(0, 10).map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.durasi_rata_rata > 7 ? '#ef4444' : entry.durasi_rata_rata > 3 ? '#f59e0b' : '#10b981'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Asesor dengan Backlog */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asesor dengan Backlog</h3>
                        <div className="space-y-3">
                            {kecepatanAsesor.backlog.length > 0 ? (
                                kecepatanAsesor.backlog.slice(0, 10).map((item) => (
                                    <div key={item.assessor_id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{item.assessor}</div>
                                            <div className="text-xs text-gray-500">{item.pending_count} penilaian pending</div>
                                        </div>
                                        <div className="text-lg font-bold text-yellow-600">{item.pending_count}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">Tidak ada backlog</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Kriteria yang Paling Sering Terlambat */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Kriteria yang Paling Sering Terlambat Dinilai</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kriteria</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Terlambat</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {kecepatanAsesor.kriteria_terlambat.length > 0 ? (
                                    kecepatanAsesor.kriteria_terlambat.slice(0, 10).map((item) => (
                                        <tr key={item.criteria_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.criteria}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-red-600">{item.terlambat_count}</span>
                                                    <span className="text-xs text-gray-500">penilaian</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada kriteria yang terlambat
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Penyebaran Nilai Antar-Kriteria (Heatmap) */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Penyebaran Nilai Antar-Kriteria</h3>
                    <div className="space-y-4">
                        {penyebaranNilai.length > 0 ? (
                            penyebaranNilai.map((item) => {
                                const color = getHeatmapColor(item.nilai_rata_rata);
                                const percentage = (item.nilai_rata_rata / 4) * 100;

                                return (
                                    <div key={item.kriteria} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-900 w-48">{item.kriteria}</span>
                                                <span className="text-sm text-gray-500">({item.jumlah_penilaian} penilaian)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">{item.nilai_rata_rata}</span>
                                                <span className="text-xs text-gray-500">/ 4.0</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div
                                                className="h-4 rounded-full transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-500 py-8">Tidak ada data</div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-4 justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded" />
                                <span className="text-xs text-gray-600">&lt; 2.0 (Kurang)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-500 rounded" />
                                <span className="text-xs text-gray-600">2.0 - 2.5 (Cukup)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded" />
                                <span className="text-xs text-gray-600">2.5 - 3.0 (Baik)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded" />
                                <span className="text-xs text-gray-600">3.0 - 3.5 (Sangat Baik)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded" />
                                <span className="text-xs text-gray-600">≥ 3.5 (Unggul)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}



