import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Document {
    id: string;
    file_name: string;
    category: string;
    year: number;
    uploaded_at: string;
    criterion: string;
    fakultas: string;
    prodi: string;
    evaluation_status: 'pending' | 'completed';
    assignment_id: number | null;
}

interface Prodi {
    id: string;
    name: string;
    fakultas_name: string;
}

interface Props {
    documents: {
        data: Document[];
        links: any;
        meta: any;
    };
    prodis: Prodi[];
    categories: string[];
    years: number[];
    stats: {
        total: number;
        pending: number;
        completed: number;
    };
    filters: {
        prodi_id?: string;
        category?: string;
        year?: number;
        evaluation_status?: string;
        search?: string;
    };
}

export default function EvaluationDocumentsIndex({ documents, prodis, categories, years, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [prodiId, setProdiId] = useState(filters.prodi_id || '');
    const [category, setCategory] = useState(filters.category || '');
    const [year, setYear] = useState(filters.year?.toString() || '');
    const [evaluationStatus, setEvaluationStatus] = useState(filters.evaluation_status || '');

    const handleFilter = () => {
        router.get(route('assessor-internal.evaluation-documents.index'), {
            search: search || undefined,
            prodi_id: prodiId || undefined,
            category: category || undefined,
            year: year || undefined,
            evaluation_status: evaluationStatus || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getEvaluationStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Selesai</span>;
            case 'pending':
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Pending</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Unknown</span>;
        }
    };

    return (
        <DashboardLayout title="Evaluasi Simulasi" subtitle="Daftar Dokumen untuk Evaluasi">
            <Head title="Evaluasi Simulasi - Daftar Dokumen" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Total Dokumen</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Menunggu Evaluasi</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Selesai Dievaluasi</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama file, kategori, atau kriteria..."
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
                            <select
                                value={prodiId}
                                onChange={(e) => setProdiId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                {prodis.map((prodi) => (
                                    <option key={prodi.id} value={prodi.id}>
                                        {prodi.name} ({prodi.fakultas_name})
                                    </option>
                                ))}
                            </select>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status Evaluasi</label>
                            <select
                                value={evaluationStatus}
                                onChange={(e) => setEvaluationStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleFilter}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                            Filter
                        </button>
                    </div>
                </div>

                {/* Documents Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Daftar Dokumen untuk Evaluasi</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Dokumen yang sudah dikumpulkan Prodi dan dikonversi ke format standar LPMPP
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Dokumen
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kriteria
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fakultas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Program Studi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Upload
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status Evaluasi
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
                                                {document.category && (
                                                    <div className="text-xs text-gray-500 mt-1">{document.category}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{document.criterion}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{document.fakultas}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{document.prodi}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(document.uploaded_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getEvaluationStatusBadge(document.evaluation_status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-3">
                                                    {document.evaluation_status === 'completed' && document.assignment_id && (
                                                        <Link
                                                            href={route('assessor-internal.evaluation-documents.history', { documentId: document.id })}
                                                            className="text-gray-600 hover:text-gray-900"
                                                            title="Riwayat Evaluasi"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={route('assessor-internal.evaluation-documents.evaluate', { documentId: document.id })}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        {document.evaluation_status === 'completed' ? 'Lihat/Edit' : 'Evaluasi'}
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada dokumen untuk dievaluasi
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

