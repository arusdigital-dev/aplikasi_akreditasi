import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface ReadinessStatus {
    unggul: number;
    sangat_baik: number;
    baik: number;
    kurang: number;
}

interface ProgressChartData {
    date: string;
    count: number;
}

interface DocumentCompleteness {
    lengkap: number;
    belum_lengkap: number;
    salah_format: number;
    expired: number;
}

interface PointsSummary {
    total_points: number;
    average_points: number;
    points_by_criteria: Array<{
        criteria: string;
        total_points: number;
        average_points: number;
        count: number;
    }>;
    points_by_standard: Array<{
        standard: string;
        total_points: number;
        average_points: number;
        count: number;
    }>;
}

interface Props {
    readinessStatus: ReadinessStatus;
    progressChartData: ProgressChartData[];
    documentCompleteness: DocumentCompleteness;
    pointsSummary: PointsSummary;
    filters: {
        program_id?: string;
        unit_id?: string;
    };
}

export default function Statistics({
    readinessStatus,
    progressChartData,
    documentCompleteness,
    pointsSummary,
    filters,
}: Props) {
    return (
        <>
            <Head title="Rekap & Statistik Akreditasi" />
            <DashboardLayout title="Rekap & Statistik Akreditasi" subtitle="Grafik status, kelengkapan, dan poin akreditasi">
                <div className="space-y-6">
                    {/* Readiness Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Kesiapan Akreditasi</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">{readinessStatus.unggul}</div>
                                <div className="text-sm text-gray-600 mt-1">Unggul</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-3xl font-bold text-yellow-600">{readinessStatus.sangat_baik}</div>
                                <div className="text-sm text-gray-600 mt-1">Sangat Baik</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">{readinessStatus.baik}</div>
                                <div className="text-sm text-gray-600 mt-1">Baik</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-3xl font-bold text-red-600">{readinessStatus.kurang}</div>
                                <div className="text-sm text-gray-600 mt-1">Kurang</div>
                            </div>
                        </div>
                    </div>

                    {/* Document Completeness */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kelengkapan Dokumen</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{documentCompleteness.lengkap}</div>
                                <div className="text-sm text-gray-600 mt-1">Lengkap</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {documentCompleteness.belum_lengkap}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Belum Lengkap</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">
                                    {documentCompleteness.salah_format}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Salah Format</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{documentCompleteness.expired}</div>
                                <div className="text-sm text-gray-600 mt-1">Expired</div>
                            </div>
                        </div>
                    </div>

                    {/* Points Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rekap Poin</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="text-sm text-gray-600">Total Poin</div>
                                <div className="text-2xl font-bold text-blue-600">{pointsSummary.total_points}</div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="text-sm text-gray-600">Rata-rata Poin</div>
                                <div className="text-2xl font-bold text-green-600">{pointsSummary.average_points}</div>
                            </div>
                        </div>

                        {pointsSummary.points_by_criteria.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-md font-semibold text-gray-900 mb-3">Poin per Kriteria</h3>
                                <div className="space-y-2">
                                    {pointsSummary.points_by_criteria.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-700">{item.criteria}</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {item.average_points} / {item.count} evaluasi
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

