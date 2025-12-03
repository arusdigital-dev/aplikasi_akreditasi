import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

interface Props {
    type: string;
    data: any;
    format?: string;
}

export default function ReportsPreview({ type, data, format = 'pdf' }: Props) {
    const getTypeLabel = (t: string) => {
        switch (t) {
            case 'completeness':
                return 'Kelengkapan Dokumen';
            case 'evaluation':
                return 'Penilaian Asesor';
            case 'executive':
                return 'Laporan Eksekutif';
            default:
                return t;
        }
    };

    return (
        <>
            <Head title="Preview Laporan" />
            <DashboardLayout title="Preview Laporan" subtitle="Preview data laporan sebelum generate">
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Preview Laporan - {getTypeLabel(type)}
                            </h2>
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                Format: {format.toUpperCase()}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded overflow-auto max-h-[600px]">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('admin-lpmpp.reports.index')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

