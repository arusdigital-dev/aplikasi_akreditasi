import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';

interface PerKriteria {
    kriteria: string;
    nilai: number;
    bobot: number;
}

interface RekapPerProdi {
    prodi_id: string;
    prodi: string;
    fakultas: string;
    fakultas_id: string | null;
    nilai_total: number;
    predikat: string;
    nilai_per_kriteria: PerKriteria[];
}

interface RekapPerFakultas {
    fakultas_id: string;
    fakultas: string;
    radar_data: Record<string, number>;
    strong_criteria: string[];
    weak_criteria: string[];
}

interface PerbandinganProdi {
    top_10: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        nilai: number;
        grade: string;
    }>;
    bottom_10: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        nilai: number;
        grade: string;
    }>;
}

interface Props {
    level: 'universitas' | 'fakultas' | 'prodi' | null;
    userRole: string;
    rekapPerProdi: RekapPerProdi[];
    rekapPerFakultas: RekapPerFakultas[];
    perbandinganProdi: PerbandinganProdi;
}

const GRADE_COLORS = {
    Unggul: '#10b981',
    'Sangat Baik': '#3b82f6',
    Baik: '#f59e0b',
    Kurang: '#ef4444',
};

const RADAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function RekapNilai({ level, userRole, rekapPerProdi, rekapPerFakultas, perbandinganProdi }: Props) {
    const [selectedProdi, setSelectedProdi] = useState<string | null>(null);
    const [selectedFakultas, setSelectedFakultas] = useState<string | null>(null);

    const selectedProdiData = selectedProdi
        ? rekapPerProdi.find((r) => r.prodi_id === selectedProdi)
        : null;

    const selectedFakultasData = selectedFakultas
        ? rekapPerFakultas.find((r) => r.fakultas_id === selectedFakultas)
        : null;

    // Prepare radar chart data
    const radarChartData = selectedFakultasData
        ? Object.entries(selectedFakultasData.radar_data).map(([key, value]) => ({
              category: key,
              value: value,
              fullMark: 4,
          }))
        : [];

    return (
        <DashboardLayout title="Rekap Nilai / Poin Akreditasi" subtitle="Rekap nilai akreditasi dari input asesor dan simulasi">
            <Head title="Rekap Nilai Akreditasi" />

            <div className="space-y-6">
                {/* Rekap Nilai Total per Prodi */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Rekap Nilai Total per Prodi</h3>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodi</th>
                                        {level === 'universitas' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fakultas</th>
                                        )}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predikat</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rekapPerProdi.map((rekap) => (
                                        <tr key={rekap.prodi_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{rekap.prodi}</div>
                                            </td>
                                            {level === 'universitas' && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{rekap.fakultas}</div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{rekap.nilai_total}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="px-2 py-1 text-xs font-semibold rounded text-white"
                                                    style={{ backgroundColor: GRADE_COLORS[rekap.predikat as keyof typeof GRADE_COLORS] || '#6b7280' }}
                                                >
                                                    {rekap.predikat}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedProdi(selectedProdi === rekap.prodi_id ? null : rekap.prodi_id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    {selectedProdi === rekap.prodi_id ? 'Sembunyikan' : 'Detail'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Detail Nilai per Kriteria */}
                        {selectedProdiData && (
                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <h4 className="text-md font-semibold text-gray-900 mb-4">
                                    Nilai per Kriteria - {selectedProdiData.prodi}
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kriteria</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bobot</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedProdiData.nilai_per_kriteria.map((kriteria, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{kriteria.kriteria}</td>
                                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{kriteria.nilai}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{kriteria.bobot.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Chart */}
                                    <div>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={selectedProdiData.nilai_per_kriteria}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="kriteria" angle={-45} textAnchor="end" height={100} />
                                                <YAxis domain={[0, 4]} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="nilai" fill="#3b82f6" name="Nilai" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rekap Nilai per Fakultas */}
                {level === 'universitas' && rekapPerFakultas.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Rekap Nilai per Fakultas</h3>
                                <select
                                    value={selectedFakultas || ''}
                                    onChange={(e) => setSelectedFakultas(e.target.value || null)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Pilih Fakultas</option>
                                    {rekapPerFakultas.map((fakultas) => (
                                        <option key={fakultas.fakultas_id} value={fakultas.fakultas_id}>
                                            {fakultas.fakultas}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {selectedFakultasData && (
                            <div className="p-6">
                                <div className="mb-6">
                                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                                        Radar Chart - {selectedFakultasData.fakultas}
                                    </h4>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <RadarChart data={radarChartData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="category" />
                                            <PolarRadiusAxis angle={90} domain={[0, 4]} />
                                            <Radar
                                                name="Nilai"
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.6}
                                            />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Strong Criteria */}
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <h5 className="text-sm font-semibold text-green-900 mb-2">Kriteria Unggul</h5>
                                        <ul className="space-y-1">
                                            {selectedFakultasData.strong_criteria.map((criteria, idx) => (
                                                <li key={idx} className="text-sm text-green-700">
                                                    • {criteria} ({selectedFakultasData.radar_data[criteria]?.toFixed(2)})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Weak Criteria */}
                                    <div className="bg-red-50 rounded-lg p-4">
                                        <h5 className="text-sm font-semibold text-red-900 mb-2">Kriteria Lemah</h5>
                                        <ul className="space-y-1">
                                            {selectedFakultasData.weak_criteria.map((criteria, idx) => (
                                                <li key={idx} className="text-sm text-red-700">
                                                    • {criteria} ({selectedFakultasData.radar_data[criteria]?.toFixed(2)})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Perbandingan Antar-Prodi */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top 10 Prodi Terbaik */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Top 10 Prodi Terbaik</h3>
                        </div>
                        <div className="p-6">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={perbandinganProdi.top_10}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="prodi" angle={-45} textAnchor="end" height={100} />
                                    <YAxis domain={[0, 4]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="nilai" fill="#10b981" name="Nilai">
                                        {perbandinganProdi.top_10.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || '#6b7280'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {perbandinganProdi.top_10.map((prodi, idx) => (
                                    <div key={prodi.prodi_id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-500">#{idx + 1}</span>
                                            <span className="text-gray-900">{prodi.prodi}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{prodi.nilai}</span>
                                            <span
                                                className="px-2 py-1 text-xs font-semibold rounded text-white"
                                                style={{ backgroundColor: GRADE_COLORS[prodi.grade as keyof typeof GRADE_COLORS] || '#6b7280' }}
                                            >
                                                {prodi.grade}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom 10 Prodi Terendah */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Bottom 10 Prodi Terendah</h3>
                        </div>
                        <div className="p-6">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={perbandinganProdi.bottom_10}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="prodi" angle={-45} textAnchor="end" height={100} />
                                    <YAxis domain={[0, 4]} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="nilai" fill="#ef4444" name="Nilai">
                                        {perbandinganProdi.bottom_10.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.grade as keyof typeof GRADE_COLORS] || '#6b7280'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {perbandinganProdi.bottom_10.map((prodi, idx) => (
                                    <div key={prodi.prodi_id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-500">#{idx + 1}</span>
                                            <span className="text-gray-900">{prodi.prodi}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{prodi.nilai}</span>
                                            <span
                                                className="px-2 py-1 text-xs font-semibold rounded text-white"
                                                style={{ backgroundColor: GRADE_COLORS[prodi.grade as keyof typeof GRADE_COLORS] || '#6b7280' }}
                                            >
                                                {prodi.grade}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}



