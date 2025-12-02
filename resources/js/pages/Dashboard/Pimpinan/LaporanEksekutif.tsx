import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface AvailableReport {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface Props {
    level: 'universitas' | 'fakultas' | 'prodi' | null;
    userRole: string;
    availableReports: AvailableReport[];
}

const iconMap: Record<string, string> = {
    university: '🏛️',
    building: '🏢',
    list: '📋',
    warning: '⚠️',
    chart: '📊',
    document: '📄',
};

export default function LaporanEksekutif({ level, userRole, availableReports }: Props) {
    const [downloading, setDownloading] = useState<string | null>(null);

    const handleDownload = (reportId: string, format: 'pdf' | 'excel') => {
        setDownloading(`${reportId}-${format}`);
        router.get(route('pimpinan.laporan-eksekutif.download', { reportType: reportId, format }), {}, {
            onFinish: () => {
                setDownloading(null);
            },
        });
    };

    return (
        <DashboardLayout title="Laporan Eksekutif" subtitle="Laporan siap download berformat formal LPMPP / BAN-PT">
            <Head title="Laporan Eksekutif" />

            <div className="space-y-6">
                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">Informasi</h4>
                            <p className="text-sm text-blue-700">
                                Laporan ini bersifat read-only dan tidak dapat diedit. Anda dapat melihat preview dan mendownload laporan dalam format PDF atau Excel.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Available Reports */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableReports.map((report) => (
                        <div key={report.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{iconMap[report.icon] || '📄'}</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={() => handleDownload(report.id, 'pdf')}
                                    disabled={downloading === `${report.id}-pdf`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {downloading === `${report.id}-pdf` ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Mengunduh...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>PDF</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleDownload(report.id, 'excel')}
                                    disabled={downloading === `${report.id}-excel`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {downloading === `${report.id}-excel` ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Mengunduh...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Excel</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Report Contents Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Isi Laporan Eksekutif</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Summary Akreditasi</div>
                                <div className="text-xs text-gray-500">Ringkasan capaian akreditasi</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Grafik Pencapaian</div>
                                <div className="text-xs text-gray-500">Visualisasi data pencapaian</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Nilai Rata-rata Fakultas</div>
                                <div className="text-xs text-gray-500">Perbandingan antar fakultas</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Daftar Prodi Berisiko</div>
                                <div className="text-xs text-gray-500">Prodi dengan risiko rendah/tinggi</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 md:col-span-2">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Saran Tindakan Strategis</div>
                                <div className="text-xs text-gray-500">Rekomendasi perbaikan dan pengembangan</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}



