import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm } from '@inertiajs/react';
import { route } from '@/lib/route';
import { useEffect, useState } from 'react';

interface Report {
    id: string;
    file_path: string;
    file_url?: string;
    created_at: string;
    program: {
        id: string;
        name: string;
    } | null;
    generated_by: {
        id: string;
        name: string;
    } | null;
}

interface Props {
    reports: {
        data: Report[];
        links: any[];
        meta: any;
    };
    flash?: {
        success?: string;
        error?: string;
        download_url?: string;
        report_id?: string;
    };
}

export default function ReportsIndex({ reports, flash }: Props) {
    const page = usePage();
    const pageFlash = (page.props as any).flash || flash;
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'completeness',
        program_id: '',
        unit_id: '',
        format: 'pdf',
    });

    useEffect(() => {
        if (pageFlash?.success) {
            setAlertMessage(pageFlash.success);
            setAlertType('success');
            setShowAlert(true);
            if (pageFlash.download_url) {
                setDownloadUrl(pageFlash.download_url);
            }
            setTimeout(() => setShowAlert(false), 8000);
        }
        if (pageFlash?.error) {
            setAlertMessage(pageFlash.error);
            setAlertType('error');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 8000);
        }
    }, [pageFlash]);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        setShowAlert(false);
        setDownloadUrl(null);
        
        post(route('admin-lpmpp.reports.generate'), {
            preserveScroll: true,
            onSuccess: (page) => {
                console.log('Report generated successfully', page);
                // Flash message will be handled by useEffect
            },
            onError: (errors) => {
                console.error('Error generating report:', errors);
                if (errors && Object.keys(errors).length > 0) {
                    const firstError = Object.values(errors)[0] as string;
                    setAlertMessage(firstError || 'Terjadi kesalahan saat generate laporan');
                } else {
                    setAlertMessage('Terjadi kesalahan saat generate laporan. Silakan coba lagi.');
                }
                setAlertType('error');
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 8000);
            },
        });
    };

    return (
        <>
            <Head title="Cetak & Simpan Laporan" />
            <DashboardLayout title="Cetak & Simpan Laporan" subtitle="Generate laporan akreditasi versi standar LPMPP">
                <div className="space-y-6">
                    {showAlert && (
                        <div
                            className={`rounded-lg p-4 ${
                                alertType === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-medium">{alertMessage}</p>
                                <button
                                    onClick={() => setShowAlert(false)}
                                    className="ml-4 text-gray-400 hover:text-gray-600"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                            {downloadUrl && alertType === 'success' && (
                                <div className="mt-2">
                                    <a
                                        href={downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium underline hover:no-underline"
                                    >
                                        Download Laporan
                                    </a>
                                </div>
                            )}
                            {pageFlash?.download_url && alertType === 'success' && !downloadUrl && (
                                <div className="mt-2">
                                    <a
                                        href={pageFlash.download_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium underline hover:no-underline"
                                    >
                                        Download Laporan
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Laporan Baru</h2>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipe Laporan</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="completeness">Kelengkapan Dokumen</option>
                                        <option value="evaluation">Penilaian Asesor</option>
                                        <option value="executive">Laporan Eksekutif</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Format</label>
                                    <select
                                        value={data.format}
                                        onChange={(e) => setData('format', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                        <option value="word">Word</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Generating...' : 'Generate'}
                                    </button>
                                </div>
                            </div>
                            {errors.type && (
                                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                            )}
                            {errors.format && (
                                <p className="mt-1 text-sm text-red-600">{errors.format}</p>
                            )}
                            {errors.program_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>
                            )}
                            {errors.unit_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>
                            )}
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="text-lg font-semibold text-gray-900 p-6 border-b">Daftar Laporan</h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Program
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Dibuat Oleh
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada laporan
                                        </td>
                                    </tr>
                                ) : (
                                    reports.data.map((report) => (
                                        <tr key={report.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {report.program && report.program.name ? report.program.name : 'Semua Program'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {report.generated_by?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {report.created_at 
                                                    ? new Date(report.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <a
                                                    href={route('admin-lpmpp.reports.download', report.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

