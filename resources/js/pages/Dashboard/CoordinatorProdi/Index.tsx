import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

interface Stats {
    totalDocuments: number;
    validatedDocuments: number;
    pendingDocuments: number;
    rejectedDocuments: number;
    expiredDocuments: number;
    completenessPercentage: number;
    totalEvaluations: number;
    averageScore: number;
}

interface ProgressChartData {
    date: string;
    count: number;
}

interface DocumentStatusDistribution {
    validated: number;
    pending: number;
    rejected: number;
    expired: number;
}

interface ScoreRecap {
    total_score: number;
    max_possible_score: number;
    percentage: number;
}

interface Target {
    id: string;
    program_id: string;
    program_name: string;
    year: number;
    target_score: number;
    target_grade: string;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    created_at: string;
}

interface Props {
    stats: Stats;
    scoreRecap: ScoreRecap;
    targets: Target[];
    recentNotifications: Notification[];
    progressChartData: ProgressChartData[];
    documentStatusDistribution: DocumentStatusDistribution;
    year: number;
}

export default function CoordinatorProdiIndex({ stats, scoreRecap, targets, recentNotifications, progressChartData, documentStatusDistribution, year }: Props) {
    return (
        <DashboardLayout title="Dashboard Koordinator Prodi" subtitle="Ringkasan progress akreditasi program studi">
            <Head title="Dashboard Koordinator Prodi" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Dokumen</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalDocuments}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Kelengkapan</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completenessPercentage}%</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${stats.completenessPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rata-rata Skor</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.averageScore}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{stats.totalEvaluations} evaluasi</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Dokumen Pending</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingDocuments}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Recap */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rekap Nilai Akreditasi</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Skor</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    {scoreRecap.total_score} / {scoreRecap.max_possible_score}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-blue-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ width: `${Math.min(scoreRecap.percentage, 100)}%` }}
                                >
                                    {scoreRecap.percentage.toFixed(1)}%
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Persentase</span>
                                <span className="font-medium text-gray-900">{scoreRecap.percentage.toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifikasi Terbaru</h2>
                        <div className="space-y-3">
                            {recentNotifications.length > 0 ? (
                                recentNotifications.map((notification) => (
                                    <div key={notification.id} className="border-l-4 border-blue-500 pl-3 py-2">
                                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.created_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Targets and Document Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Targets */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Target Akreditasi</h2>
                            <a
                                href={route('coordinator-prodi.targets.index')}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Lihat Semua
                            </a>
                        </div>
                        {targets.length > 0 ? (
                            <div className="space-y-3">
                                {targets.slice(0, 3).map((target) => (
                                    <div key={target.id} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{target.program_name}</p>
                                                <p className="text-sm text-gray-500">Tahun {target.year}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{target.target_score}</p>
                                                <p className="text-xs text-gray-500 capitalize">{target.target_grade}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Belum ada target yang ditetapkan</p>
                        )}
                    </div>

                    {/* Document Status Distribution */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Dokumen</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Validated</span>
                                </div>
                                <span className="font-medium text-gray-900">{documentStatusDistribution.validated}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Pending</span>
                                </div>
                                <span className="font-medium text-gray-900">{documentStatusDistribution.pending}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Rejected</span>
                                </div>
                                <span className="font-medium text-gray-900">{documentStatusDistribution.rejected}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-500 rounded"></div>
                                    <span className="text-sm text-gray-700">Expired</span>
                                </div>
                                <span className="font-medium text-gray-900">{documentStatusDistribution.expired}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a
                            href={route('coordinator-prodi.documents.index')}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Upload Dokumen</span>
                        </a>
                        <a
                            href={route('coordinator-prodi.reports.completeness')}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Laporan Kelengkapan</span>
                        </a>
                        <a
                            href={route('coordinator-prodi.simulation')}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Simulasi Penilaian</span>
                        </a>
                        <a
                            href={route('coordinator-prodi.score-recap')}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Rekap Nilai</span>
                        </a>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

