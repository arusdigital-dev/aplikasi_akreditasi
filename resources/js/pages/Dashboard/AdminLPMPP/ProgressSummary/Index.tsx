import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface ProgressData {
    name: string;
    completion_percentage?: number;
    progress?: number;
    status_color?: string;
    criteria_fulfilled?: number;
    total_criteria?: number;
    pending_documents?: number;
    rejected_documents?: number;
    total_assignments?: number;
    completed_assignments?: number;
}

interface Props {
    filter: string;
    data: ProgressData[];
    filters: {
        unit_id?: string;
        program_id?: string;
        fakultas?: string;
    };
}

export default function ProgressSummary({ filter, data, filters }: Props) {
    return (
        <>
            <Head title="Progress Akreditasi" />
            <DashboardLayout title="Progress Akreditasi" subtitle="Ringkasan progress akreditasi per Fakultas / Prodi / Unit">
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Progress Akreditasi - {filter === 'fakultas' ? 'Fakultas' : filter === 'prodi' ? 'Program Studi' : 'Unit'}
                        </h2>
                        <div className="space-y-4">
                            {data.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Tidak ada data</p>
                            ) : (
                                data.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {item.completion_percentage ?? item.progress ?? 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    item.status_color === 'green'
                                                        ? 'bg-green-500'
                                                        : item.status_color === 'yellow'
                                                        ? 'bg-yellow-500'
                                                        : item.status_color === 'orange'
                                                        ? 'bg-orange-500'
                                                        : 'bg-red-500'
                                                }`}
                                                style={{
                                                    width: `${item.completion_percentage ?? item.progress ?? 0}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-2">
                                            {item.criteria_fulfilled !== undefined && (
                                                <>
                                                    <div>
                                                        <span className="font-medium">Kriteria Terpenuhi:</span>{' '}
                                                        {item.criteria_fulfilled} / {item.total_criteria}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Dokumen Pending:</span>{' '}
                                                        {item.pending_documents ?? 0}
                                                    </div>
                                                </>
                                            )}
                                            {item.completed_assignments !== undefined && (
                                                <>
                                                    <div>
                                                        <span className="font-medium">Selesai:</span>{' '}
                                                        {item.completed_assignments} / {item.total_assignments}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

