import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CriteriaPoint {
    id: number;
    title: string;
    description: string | null;
    max_score: number;
    criterion: {
        name: string;
        order_index?: number;
        standard: {
            name: string;
            order_index?: number;
            program: {
                name: string;
            } | null;
        } | null;
    } | null;
    rubrics?: {
        score: number;
        description: string;
    }[];
    order_index?: number;
}

interface Criterion {
    id: number;
    name: string;
    standard: string;
    standard_id?: string | number | null;
    program: string;
    program_id?: number | null;
    program_base_scale?: number;
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
    const [baseScaleInput, setBaseScaleInput] = useState<string>('400');
    const [currentProgramId, setCurrentProgramId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pointToDelete, setPointToDelete] = useState<CriteriaPoint | null>(null);
    const formatScore = (v: any) => {
        const n = typeof v === 'number' ? v : parseFloat(v);
        return Number.isFinite(n) ? n.toFixed(2) : '-';
    };

    useEffect(() => {
        const s = typeof window !== 'undefined' ? window.localStorage.getItem('criteriaPointsBaseScale') : null;
        if (s) {
            setBaseScaleInput(s);
        }
    }, []);

    useEffect(() => {
        const selected = criteriaId ? criteria.find((c) => String(c.id) === String(criteriaId)) : undefined;
        if (selected?.program_id) {
            setCurrentProgramId(selected.program_id ?? null);
            if (typeof selected.program_base_scale === 'number' && selected.program_base_scale > 0) {
                setBaseScaleInput(String(selected.program_base_scale));
            }
        } else {
            setCurrentProgramId(null);
        }
    }, [criteriaId, criteria]);

    useEffect(() => {
        const numeric = parseFloat(baseScaleInput);
        if (currentProgramId) {
            const t = setTimeout(() => {
                if (!Number.isNaN(numeric) && numeric > 0) {
                    router.put(`/coordinator-prodi/programs/${currentProgramId}/criteria-points/base-scale`, { criteria_points_base_scale: numeric }, { preserveScroll: true, preserveState: true });
                }
            }, 400);
            return () => clearTimeout(t);
        } else {
            if (typeof window !== 'undefined') {
                const t = setTimeout(() => {
                    if (baseScaleInput === '') {
                        window.localStorage.removeItem('criteriaPointsBaseScale');
                    } else {
                        window.localStorage.setItem('criteriaPointsBaseScale', baseScaleInput);
                    }
                }, 200);
                return () => clearTimeout(t);
            }
        }
    }, [baseScaleInput, currentProgramId]);

    const handleFilter = () => {
        router.get('/coordinator-prodi/criteria-points', {
            search: search || undefined,
            criteria_id: criteriaId || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const groupedByCriterion = (() => {
        const groups: Record<string, { criterionName: string; standardName: string | null; programName: string | null; points: CriteriaPoint[] }> = {};
        for (const p of criteriaPoints.data) {
            const key = String((p.criterion as any)?.id ?? 'unknown');
            if (!groups[key]) {
                groups[key] = {
                    criterionName: p.criterion?.name ?? 'Tanpa Kriteria',
                    standardName: p.criterion?.standard?.name ?? null,
                    programName: p.criterion?.standard?.program?.name ?? null,
                    points: [],
                };
            }
            groups[key].points.push(p);
        }
        return Object.values(groups);
    })();

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

                    {groupedByCriterion.length > 0 ? (
                        <div className="space-y-6">
                            {groupedByCriterion.map((group, gi) => (
                                <div key={`${group.criterionName}-${gi}`} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            <span className="font-semibold text-gray-900">Kriteria: {group.criterionName}</span>
                                            {group.programName && (
                                                <span className="ml-2 text-gray-500">• Program: {group.programName}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Urut</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Bujur</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Bobot dari
                                                        <input
                                                            type="number"
                                                            value={baseScaleInput}
                                                            onChange={(e) => setBaseScaleInput(e.target.value)}
                                                            className="ml-2 w-24 rounded-md border border-gray-300 px-2 py-1 text-xs"
                                                            placeholder="400"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elemen Penilaian LAM</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskriptor</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sangat baik = 4</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baik = 3</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cukup = 2</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kurang = 1</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {group.points.map((point, index) => (
                                                    <tr key={point.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{point.order_index ?? (index + 1)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {(point.criterion?.standard?.order_index ?? '-')}.{(point.criterion?.order_index ?? '-')}.{point.order_index ?? (index + 1)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatScore(point.max_score)}</td>
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
                                                        <td className="px-4 py-3 text-sm text-gray-900">{point.rubrics?.find(r => r.score === 4)?.description ?? '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{point.rubrics?.find(r => r.score === 3)?.description ?? '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{point.rubrics?.find(r => r.score === 2)?.description ?? '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{point.rubrics?.find(r => r.score === 1)?.description ?? '-'}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    href={`/coordinator-prodi/criteria-points/${point.id}/edit`}
                                                                    className="px-3 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    className="px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700"
                                                                    onClick={() => {
                                                                        setPointToDelete(point);
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                >
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-12 text-center text-sm text-gray-500">Tidak ada poin kriteria</div>
                    )}

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
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Konfirmasi Hapus</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Anda yakin ingin menghapus poin kriteria "{pointToDelete?.title}"?
                                </p>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!pointToDelete) return;
                                            router.delete(`/coordinator-prodi/criteria-points/${pointToDelete.id}`, {
                                                preserveScroll: true,
                                                preserveState: true,
                                                onSuccess: () => {
                                                    toast.success('Poin kriteria berhasil dihapus');
                                                    setShowDeleteModal(false);
                                                    setPointToDelete(null);
                                                },
                                                onError: () => {
                                                    toast.error('Gagal menghapus poin kriteria');
                                                },
                                            });
                                        }}
                                        className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}
