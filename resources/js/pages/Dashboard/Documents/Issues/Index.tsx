import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

interface Program {
    id: number;
    name: string;
    fakultas: string;
}

interface Unit {
    id: string;
    name: string;
}

interface Document {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    issue_type: string;
    issue_status: string;
    expired_at: string | null;
    rejection_notes: string | null;
    year: number | null;
    category: string | null;
    assignment: {
        criterion: {
            name: string;
            standard: {
                program: {
                    name: string;
                    fakultas: string;
                };
            } | null;
        } | null;
        assessor: {
            name: string;
        } | null;
        unit: {
            name: string;
        } | null;
    } | null;
    program: {
        name: string;
        fakultas: string;
    } | null;
    uploaded_by: {
        name: string;
    } | null;
    created_at: string;
}

interface Props {
    documents?: {
        data: Document[];
        links: any;
        meta: any;
    };
    programs?: Program[];
    units?: Unit[];
    fakultas?: string[];
    years?: number[];
    filters?: {
        fakultas?: string;
        program_id?: string;
        year?: number;
        category?: string;
        issue_type?: string;
        issue_status?: string;
    };
}

const issueTypeLabels: Record<string, string> = {
    expired: 'Expired',
    wrong_format: 'Salah Format',
    missing_metadata: 'Metadata Kurang',
    not_validated: 'Belum Validasi',
    rejected: 'Ditolak',
};

const issueStatusLabels: Record<string, string> = {
    pending: 'Pending',
    rejected: 'Ditolak',
    resolved: 'Selesai',
};

export default function DocumentsIssuesIndex({ 
    documents = { data: [], links: [], meta: { total: 0, from: 0, to: 0 } }, 
    programs = [], 
    units = [], 
    fakultas = [], 
    years = [], 
    filters = {} 
}: Props) {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key: string, value: string | number | null) => {
        const newFilters = { ...localFilters, [key]: value || undefined };
        setLocalFilters(newFilters);
        router.get(route('documents.issues.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) {
            return bytes + ' B';
        }
        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <>
            <Head title="Dokumen Bermasalah" />
            <DashboardLayout
                title="Dokumen Bermasalah"
                subtitle="Kelola dan monitor dokumen yang memiliki masalah"
            >
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fakultas</label>
                                <select
                                    value={localFilters.fakultas || ''}
                                    onChange={(e) => handleFilterChange('fakultas', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="">Semua Fakultas</option>
                                    {(fakultas ?? []).map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
                                <select
                                    value={localFilters.program_id || ''}
                                    onChange={(e) => handleFilterChange('program_id', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="">Semua Program</option>
                                    {(programs ?? []).map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                                <select
                                    value={localFilters.year || ''}
                                    onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="">Semua Tahun</option>
                                    {(years ?? []).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                <input
                                    type="text"
                                    value={localFilters.category || ''}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    placeholder="Kategori"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Masalah</label>
                                <select
                                    value={localFilters.issue_type || ''}
                                    onChange={(e) => handleFilterChange('issue_type', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="">Semua Jenis</option>
                                    {Object.entries(issueTypeLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={localFilters.issue_status || ''}
                                    onChange={(e) => handleFilterChange('issue_status', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                >
                                    <option value="">Semua Status</option>
                                    {Object.entries(issueStatusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Dokumen Bermasalah ({documents?.meta?.total ?? documents?.data?.length ?? 0})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dokumen
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Program/Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jenis Masalah
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Upload
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(documents?.data ?? []).map((document) => (
                                        <tr key={document.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{document.file_name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {document.file_type?.toUpperCase()} • {formatFileSize(document.file_size || 0)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {document.program?.name || document.assignment?.unit?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {document.program?.fakultas || document.assignment?.criterion?.standard?.program?.fakultas || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                    {issueTypeLabels[document.issue_type] || document.issue_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        document.issue_status === 'resolved'
                                                            ? 'bg-green-100 text-green-800'
                                                            : document.issue_status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {issueStatusLabels[document.issue_status] || document.issue_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{document.uploaded_by?.name || 'N/A'}</div>
                                                <div className="text-xs">{new Date(document.created_at).toLocaleDateString('id-ID')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={route('documents.issues.show', document.id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Detail
                                                </Link>
                                                <a
                                                    href={route('documents.issues.download', document.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!documents?.data || documents.data.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Tidak ada dokumen bermasalah
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {documents?.links && documents.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    {documents.meta && (
                                        <>
                                            Menampilkan {documents.meta.from} sampai {documents.meta.to} dari {documents.meta.total} dokumen
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {documents.links.map((link: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-1 text-sm rounded-lg ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
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

