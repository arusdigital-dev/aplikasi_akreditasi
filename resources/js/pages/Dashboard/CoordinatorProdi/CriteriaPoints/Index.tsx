import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState } from 'react';

interface CriteriaPoint {
    id: number;
    title: string;
    description: string | null;
    max_score: number;
    criterion: {
        name: string;
        standard: {
            name: string;
            program: {
                name: string;
            } | null;
        } | null;
    } | null;
}

interface Criterion {
    id: number;
    name: string;
    standard: string;
    program: string;
}

interface Props {
    criteriaPoints: {
        data: CriteriaPoint[];
        links: any[];
        meta: any;
    };
    criteria: Criterion[];
    filters: {
        criteria_id?: string;
        search?: string;
    };
}

export default function CriteriaPointsIndex({ criteriaPoints, criteria, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [criteriaId, setCriteriaId] = useState(filters.criteria_id || '');

    const handleFilter = () => {
        router.get('/coordinator-prodi/criteria-points', {
            search: search || undefined,
            criteria_id: criteriaId || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Poin Kriteria" />
            <DashboardLayout title="Poin Kriteria" subtitle="Kelola poin kriteria akreditasi">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Daftar Poin Kriteria</h2>
                        <Link
                            href="/coordinator-prodi/criteria-points/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tambah Poin Kriteria
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Cari judul atau deskripsi..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>
                            <div>
                                <select
                                    value={criteriaId}
                                    onChange={(e) => setCriteriaId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Semua Kriteria</option>
                                    {criteria.map((criterion) => (
                                        <option key={criterion.id} value={criterion.id}>
                                            {criterion.name} ({criterion.program})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleFilter}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Program
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Standar
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kriteria
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Judul Poin
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deskripsi
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nilai Maksimal
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {criteriaPoints.data.length > 0 ? (
                                        criteriaPoints.data.map((point) => (
                                            <tr key={point.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {point.criterion?.standard?.program?.name ?? 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {point.criterion?.standard?.name ?? 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {point.criterion?.name ?? 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {point.title}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {point.description ? (
                                                        <span className="truncate max-w-xs block" title={point.description}>
                                                            {point.description}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {point.max_score}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={`/coordinator-prodi/criteria-points/${point.id}/edit`}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                                Tidak ada poin kriteria
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {criteriaPoints.links && criteriaPoints.links.length > 3 && (
                            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {criteriaPoints.meta.from} sampai {criteriaPoints.meta.to} dari {criteriaPoints.meta.total} poin kriteria
                                </div>
                                <div className="flex gap-2">
                                    {criteriaPoints.links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded-md text-sm ${
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
        </>
    );
}
