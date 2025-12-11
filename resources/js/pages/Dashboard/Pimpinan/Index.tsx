import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface Stats {
    active_faculties: number;
    active_prodi: number;
    readiness_percentage: number;
    prodi_by_grade: {
        unggul: number;
        sangat_baik: number;
        baik: number;
        kurang: number;
    };
    problematic_documents: number;
    incomplete_assessments: number;
}

interface WeeklyProgress {
    week: string;
    week_label: string;
    count: number;
}

interface FakultasDocumentStatus {
    fakultas: string;
    fakultas_id: string;
    lengkap: number;
    tidak_lengkap: number;
    ditolak: number;
    menunggu_revisi: number;
    total: number;
}

interface FakultasStatus {
    fakultas_id: string;
    fakultas: string;
    kesiapan: number;
    nilai_sementara: number;
    grade: string;
    risiko: string;
    status_dokumen: number;
    problematic_documents: number;
}

interface ProdiStatus {
    prodi_id: string;
    prodi: string;
    fakultas: string;
    fakultas_id: string | null;
    progress_dokumen: number;
    nilai_simulasi: number;
    grade: string;
    target_score: number | null;
    target_grade: string | null;
    gap: number | null;
    warnings: string[];
    risk_level: string;
}

interface ProgressData {
    weekly_progress: WeeklyProgress[];
    fakultas_document_status: FakultasDocumentStatus[];
}

interface Props {
    level: 'universitas' | 'fakultas' | 'prodi' | null;
    userRole: string;
    stats: Stats;
    progressData: ProgressData;
    fakultasStatus: FakultasStatus[];
    prodiStatus: ProdiStatus[];
}

const RISK_COLORS = {
    Rendah: '#10b981',
    Sedang: '#f59e0b',
    Tinggi: '#ef4444',
};

const GRADE_COLORS = {
    Unggul: '#10b981',
    'Sangat Baik': '#3b82f6',
    Baik: '#f59e0b',
    Kurang: '#ef4444',
};

export default function PimpinanIndex({ level, userRole, stats, progressData, fakultasStatus, prodiStatus }: Props) {
    const [selectedFakultas, setSelectedFakultas] = useState<string | null>(null);
    const [gradeFilter, setGradeFilter] = useState<string>('all');
    const [riskFilter, setRiskFilter] = useState<string>('all');

    const getLevelTitle = () => {
        switch (level) {
            case 'universitas':
                return 'Dashboard Eksekutif - Universitas';
            case 'fakultas':
                return 'Dashboard Eksekutif - Fakultas';
            case 'prodi':
                return 'Dashboard Eksekutif - Program Studi';
            default:
                return 'Dashboard Eksekutif';
        }
    };

    const getLevelSubtitle = () => {
        switch (level) {
            case 'universitas':
                return 'Overview kondisi akreditasi seluruh universitas';
            case 'fakultas':
                return 'Overview kondisi akreditasi fakultas';
            case 'prodi':
                return 'Overview kondisi akreditasi program studi';
            default:
                return 'Overview kondisi akreditasi';
        }
    };

    // Filter prodi status
    const filteredProdiStatus = prodiStatus.filter((prodi) => {
        if (selectedFakultas && prodi.fakultas_id !== selectedFakultas) {
            return false;
        }
        if (gradeFilter !== 'all' && prodi.grade !== gradeFilter) {
            return false;
        }
        if (riskFilter !== 'all' && prodi.risk_level !== riskFilter) {
            return false;
        }
        return true;
    });

    // Get unique fakultas for filter
    const uniqueFakultas = Array.from(
        new Set(
            prodiStatus
                .map((p) => p.fakultas_id)
                .filter((id): id is string => !!id)
        )
    );

    return (
        <DashboardLayout title={getLevelTitle()} subtitle={getLevelSubtitle()}>
            <Head title="Dashboard Eksekutif" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Active Faculties */}
                    {level === 'universitas' && (
                        <Link
                            href="#"
                            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Fakultas Aktif</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_faculties}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Active Prodi */}
                    <Link
                        href="#"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Prodi Aktif</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_prodi}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Readiness Percentage */}
                    <Link
                        href="#"
                        className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Kesiapan Akreditasi</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.readiness_percentage.toFixed(1)}%</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${stats.readiness_percentage}%` }}
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Prodi by Grade */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600 mb-4">Prodi Berdasarkan Kategori</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Unggul</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{stats.prodi_by_grade.unggul}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Sangat Baik</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{stats.prodi_by_grade.sangat_baik}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Baik</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{stats.prodi_by_grade.baik}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Kurang</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{stats.prodi_by_grade.kurang}</span>
                            </div>
                        </div>
                    </div>

                    {/* Problematic Documents */}
                    <Link
                        href="#"
                        className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
                            stats.problematic_documents > 0 ? 'border-l-4 border-yellow-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Dokumen Bermasalah</p>
                                <p className={`text-3xl font-bold mt-2 ${
                                    stats.problematic_documents > 0 ? 'text-yellow-600' : 'text-gray-900'
                                }`}>
                                    {stats.problematic_documents}
                                </p>
                                {stats.problematic_documents > 0 && (
                                    <p className="text-xs text-yellow-600 mt-1">Perlu perhatian</p>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                stats.problematic_documents > 0 ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                                <svg className={`w-6 h-6 ${
                                    stats.problematic_documents > 0 ? 'text-yellow-600' : 'text-gray-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Incomplete Assessments */}
                    <Link
                        href="#"
                        className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
                            stats.incomplete_assessments > 0 ? 'border-l-4 border-orange-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Penilaian Belum Selesai</p>
                                <p className={`text-3xl font-bold mt-2 ${
                                    stats.incomplete_assessments > 0 ? 'text-orange-600' : 'text-gray-900'
                                }`}>
                                    {stats.incomplete_assessments}
                                </p>
                                {stats.incomplete_assessments > 0 && (
                                    <p className="text-xs text-orange-600 mt-1">Perlu tindak lanjut</p>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                stats.incomplete_assessments > 0 ? 'bg-orange-100' : 'bg-gray-100'
                            }`}>
                                <svg className={`w-6 h-6 ${
                                    stats.incomplete_assessments > 0 ? 'text-orange-600' : 'text-gray-600'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Progress Akreditasi Universitas */}
                {level === 'universitas' && (
                    <div className="space-y-6">
                        {/* Line Chart - Weekly Progress */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Akreditasi per Minggu</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={progressData.weekly_progress}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week_label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Akumulasi Dokumen" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Stacked Bar Chart - Fakultas Document Status */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Dokumen per Fakultas</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={progressData.fakultas_document_status}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="fakultas" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="lengkap" stackId="a" fill="#10b981" name="Lengkap" />
                                    <Bar dataKey="tidak_lengkap" stackId="a" fill="#f59e0b" name="Tidak Lengkap" />
                                    <Bar dataKey="ditolak" stackId="a" fill="#ef4444" name="Ditolak" />
                                    <Bar dataKey="menunggu_revisi" stackId="a" fill="#6366f1" name="Menunggu Revisi" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Status per Fakultas */}
                {level === 'universitas' && fakultasStatus.length > 0 && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Status per Fakultas</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fakultas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kesiapan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Sementara</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risiko</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Dokumen</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fakultasStatus.map((fakultas) => (
                                        <tr key={fakultas.fakultas_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{fakultas.fakultas}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{fakultas.kesiapan}%</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{fakultas.nilai_sementara}</span>
                                                    <span
                                                        className="px-2 py-1 text-xs font-semibold rounded text-white"
                                                        style={{ backgroundColor: GRADE_COLORS[fakultas.grade as keyof typeof GRADE_COLORS] || '#6b7280' }}
                                                    >
                                                        {fakultas.grade}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="px-2 py-1 text-xs font-semibold rounded text-white"
                                                    style={{ backgroundColor: RISK_COLORS[fakultas.risiko as keyof typeof RISK_COLORS] || '#6b7280' }}
                                                >
                                                    {fakultas.risiko}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{fakultas.status_dokumen}% lengkap</div>
                                                {fakultas.problematic_documents > 0 && (
                                                    <div className="text-xs text-yellow-600 mt-1">
                                                        {fakultas.problematic_documents} dokumen bermasalah
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedFakultas(fakultas.fakultas_id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Status per Prodi */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Status per Prodi</h3>
                            <div className="flex items-center gap-4">
                                {level === 'universitas' && uniqueFakultas.length > 0 && (
                                    <select
                                        value={selectedFakultas || 'all'}
                                        onChange={(e) => setSelectedFakultas(e.target.value === 'all' ? null : e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">Semua Fakultas</option>
                                        {uniqueFakultas.map((fakultasId) => {
                                            const fakultas = prodiStatus.find((p) => p.fakultas_id === fakultasId);
                                            return (
                                                <option key={fakultasId} value={fakultasId}>
                                                    {fakultas?.fakultas || fakultasId}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}
                                <select
                                    value={gradeFilter}
                                    onChange={(e) => setGradeFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="all">Semua Kategori</option>
                                    <option value="Unggul">Unggul</option>
                                    <option value="Sangat Baik">Sangat Baik</option>
                                    <option value="Baik">Baik</option>
                                    <option value="Kurang">Kurang</option>
                                </select>
                                <select
                                    value={riskFilter}
                                    onChange={(e) => setRiskFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="all">Semua Risiko</option>
                                    <option value="Rendah">Rendah</option>
                                    <option value="Sedang">Sedang</option>
                                    <option value="Tinggi">Tinggi</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodi</th>
                                    {level === 'universitas' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fakultas</th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress Dokumen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai Simulasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target vs Realisasi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warning</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProdiStatus.length > 0 ? (
                                    filteredProdiStatus.map((prodi) => (
                                        <tr key={prodi.prodi_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{prodi.prodi}</div>
                                            </td>
                                            {level === 'universitas' && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{prodi.fakultas}</div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${
                                                                prodi.progress_dokumen >= 90 ? 'bg-green-500' :
                                                                prodi.progress_dokumen >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${prodi.progress_dokumen}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-900">{prodi.progress_dokumen}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{prodi.nilai_simulasi}</span>
                                                    <span
                                                        className="px-2 py-1 text-xs font-semibold rounded text-white"
                                                        style={{ backgroundColor: GRADE_COLORS[prodi.grade as keyof typeof GRADE_COLORS] || '#6b7280' }}
                                                    >
                                                        {prodi.grade}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {prodi.target_score !== null ? (
                                                    <div className="text-sm">
                                                        <div className="text-gray-900">
                                                            Target: {prodi.target_score} ({prodi.target_grade})
                                                        </div>
                                                        <div className={`text-xs ${prodi.gap !== null && prodi.gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            Gap: {prodi.gap !== null ? (prodi.gap > 0 ? '+' : '') + prodi.gap : 'N/A'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Tidak ada target</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {prodi.warnings.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {prodi.warnings.map((warning, idx) => (
                                                            <div key={idx} className="text-xs text-yellow-600 flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                                {warning}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={level === 'universitas' ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada data untuk ditampilkan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
