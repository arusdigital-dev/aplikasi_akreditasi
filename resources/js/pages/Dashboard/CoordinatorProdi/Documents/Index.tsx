import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Document {
    id: string;
    file_name: string;
    category: string;
    year: number;
    file_size: number;
    status: string;
    validated_at: string | null;
    validated_by: { name: string } | null;
    rejected_at: string | null;
    rejection_notes: string | null;
    created_at: string;
    metadata: Record<string, any>;
}

interface Props {
    documents: {
        data: Document[];
        links: any;
        meta: any;
    };
    categories: string[];
    years: number[];
    stats: {
        total: number;
        validated: number;
        pending: number;
        rejected: number;
    };
    filters: {
        category?: string;
        status?: string;
        year?: number;
        search?: string;
    };
}

export default function DocumentsIndex({ documents, categories, years, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [status, setStatus] = useState(filters.status || '');
    const [year, setYear] = useState(filters.year?.toString() || '');

    const handleFilter = () => {
        router.get(route('coordinator-prodi.documents.index'), {
            search: search || undefined,
            category: category || undefined,
            status: status || undefined,
            year: year || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getStatusBadge = (doc: Document) => {
        if (doc.validated_at) {
            return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Validated</span>;
        }
        if (doc.rejected_at) {
            return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">Rejected</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Pending</span>;
    };

    return (
        <DashboardLayout title="Daftar Dokumen" subtitle="Kelola dokumen akreditasi program studi">
            <Head title="Daftar Dokumen" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Validated</p>
                        <p className="text-2xl font-bold text-green-600">{stats.validated}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama file..."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                <option value="validated">Validated</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                {years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Daftar Dokumen</h3>
                        <Link
                            href={route('coordinator-prodi.documents.create')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                            + Upload Dokumen
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama File
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tahun
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ukuran
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.data.length > 0 ? (
                                    documents.data.map((document) => (
                                        <tr key={document.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{document.file_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{document.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{document.year}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{formatFileSize(document.file_size)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(document)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {document.created_at 
                                                        ? new Date(document.created_at).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                        : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <a
                                                    href={route('coordinator-prodi.documents.download', { id: document.id })}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada dokumen
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {documents.links && documents.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Menampilkan {documents.meta.from} sampai {documents.meta.to} dari {documents.meta.total} dokumen
                            </div>
                            <div className="flex gap-2">
                                {documents.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-md ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

