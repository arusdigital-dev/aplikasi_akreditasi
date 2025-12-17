import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Rubric = { score: number; description: string };

interface Criteria {
    id: number;
    name: string;
    description: string;
    weight: number;
    order_index: number;
    criteriaPoints?: {
        id: number;
        title: string;
        description: string | null;
        max_score: number;
        rubrics?: Rubric[];
        order_index?: number;
    }[];
}

interface Standard {
    id: string;
    name: string;
    description: string;
    weight: number;
    order_index: number;
    criteria: Criteria[];
}

interface Program {
    id: string;
    name: string;
    jenjang: string;
    fakultas: string;
    criteria_points_base_scale?: number;
    lam_name?: string;
}

interface Props {
    program: (Program & {
        standards: Standard[];
    }) | null;
    programs?: (Program & { standards?: Standard[] })[];
}

export default function StandardsIndex({ program, programs = [] }: Props) {
    const [selectedProgram, setSelectedProgram] = useState(program?.id || '');
    const [newCriterion, setNewCriterion] = useState<{ name: string; description: string; order_index: number }>({ name: '', description: '', order_index: 1 });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [criterionToDelete, setCriterionToDelete] = useState<Criteria | null>(null);
    const [lamName, setLamName] = useState<string>('');
    const formatScore = (v: any) => {
        const n = typeof v === 'number' ? v : parseFloat(v);
        return Number.isFinite(n) ? n.toFixed(2) : '-';
    };
    const getPointWeight = (p: any) =>
        p?.max_score ?? p?.weight ?? p?.score ?? p?.bobot ?? (typeof p === 'number' ? p : undefined);

    const [newProgram, setNewProgram] = useState<{ name: string; jenjang: string; fakultas: string }>({ name: '', jenjang: '', fakultas: '' });
    if (!program && programs.length === 0) {
        return (
            <DashboardLayout title="Kriteria Akreditasi" subtitle="Kelola kriteria akreditasi">
                <Head title="Kriteria Akreditasi" />
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Tambah Program Studi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                            type="text"
                            placeholder="Nama Program Studi"
                            value={newProgram.name}
                            onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Jenjang (mis. S1)"
                            value={newProgram.jenjang}
                            onChange={(e) => setNewProgram({ ...newProgram, jenjang: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Fakultas"
                            value={newProgram.fakultas}
                            onChange={(e) => setNewProgram({ ...newProgram, fakultas: e.target.value })}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        <button
                            className="px-3 py-2 bg-green-600 text-white rounded-md text-sm"
                            onClick={() => {
                                if (!newProgram.name || !newProgram.jenjang || !newProgram.fakultas) return;
                                router.post(route('coordinator-prodi.programs.store'), {
                                    name: newProgram.name,
                                    jenjang: newProgram.jenjang,
                                    fakultas: newProgram.fakultas,
                                });
                            }}
                        >
                            Simpan Program Studi
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const currentProgram = program || (programs.length > 0 ? programs[0] : null);

    useEffect(() => {
        if (!currentProgram) {
            setLamName('');
            return;
        }
        const name = (currentProgram as any).lam_name || '';
        setLamName(typeof name === 'string' ? name : '');
    }, [currentProgram?.id]);

    const persistLamName = undefined as unknown as (name: string) => void;

    // Removed frontend-only add/remove criteria point logic

    const renderPointRows = (criterion: Criteria, std?: Standard) => {
        const points = ((criterion as any).criteriaPoints ?? (criterion as any).criteria_points ?? []).sort((a: any, b: any) => {
            const ao = a?.order_index ?? 0;
            const bo = b?.order_index ?? 0;
            return ao - bo;
        });
        if (points.length === 0) {
            return (
                <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada poin kriteria</td>
                </tr>
            );
        }
        return points.map((point: any, pidx: number) => (
            <tr key={point.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{pidx + 1}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{`${std?.order_index ?? '-'}.${criterion.order_index}.${point.order_index ?? (pidx + 1)}`}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatScore(getPointWeight(point))}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{point.title}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                    {point.description ? (
                        <span className="truncate max-w-xs block" title={point.description}>
                            {point.description}
                        </span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{point.rubrics?.find((r: Rubric) => r.score === 4)?.description ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{point.rubrics?.find((r: Rubric) => r.score === 3)?.description ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{point.rubrics?.find((r: Rubric) => r.score === 2)?.description ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{point.rubrics?.find((r: Rubric) => r.score === 1)?.description ?? '-'}</td>
            </tr>
        ));
    };
    return (
        <DashboardLayout title="Kriteria Akreditasi" subtitle="Kelola kriteria akreditasi">
            <Head title="Kriteria Akreditasi" />

            <div className="space-y-6">
                {/* Program Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    {programs.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
                            <select
                                value={selectedProgram || currentProgram?.id || ''}
                                onChange={(e) => {
                                    setSelectedProgram(e.target.value);
                                    router.get(route('coordinator-prodi.standards'), {
                                        program_id: e.target.value,
                                    });
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                {programs.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {currentProgram && (
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">{currentProgram.name}</h2>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                {currentProgram.jenjang && <span>Jenjang: {currentProgram.jenjang}</span>}
                                {currentProgram.fakultas && <span>Fakultas: {currentProgram.fakultas}</span>}
                                {lamName && <span>LAM: {lamName}</span>}
                            </div>
                        </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">Tambahkan Kriteria Akreditasi.</p>
                    </div>
                    {currentProgram && (
                        <div className="mt-4 border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Tambah Kriteria Baru</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    placeholder="Nama kriteria"
                                    value={newCriterion.name}
                                    onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Nama LAM"
                                    value={lamName}
                                    onChange={(e) => setLamName(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Urutan"
                                    value={newCriterion.order_index}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        const num = v === '' ? 0 : parseInt(v, 10);
                                        setNewCriterion({ ...newCriterion, order_index: Number.isNaN(num) ? 0 : num });
                                    }}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                                <button
                                    className="px-3 py-2 bg-green-600 text-white rounded-md text-sm"
                                    onClick={() => {
                                        const defaultStandardId = (currentProgram.standards || [])[0]?.id || '';
                                        if (!newCriterion.name || !defaultStandardId) return;
                                        router.post(
                                            route('coordinator-prodi.criteria.store'),
                                            {
                                                standard_id: Number(defaultStandardId),
                                                program_id: Number(currentProgram.id),
                                                name: newCriterion.name,
                                                description: newCriterion.description,
                                                weight: 0,
                                                order_index: newCriterion.order_index,
                                                lam_name: lamName.trim() || undefined,
                                            },
                                            {
                                                onSuccess: () => {
                                                    toast.success('Kriteria berhasil dibuat');
                                                    setNewCriterion({ name: '', description: '', order_index: 1 });
                                                    if (lamName.trim()) {
                                                        setLamName(lamName.trim());
                                                    }
                                                },
                                                onError: () => {
                                                    toast.error('Gagal membuat kriteria');
                                                },
                                            }
                                        );
                                    }}
                                >
                                    Simpan Kriteria
                                </button>
                            </div>
                            <textarea
                                placeholder="Deskripsi (opsional)"
                                value={newCriterion.description}
                                onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })}
                                className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                rows={2}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {(() => {
                        const allCriteria: Criteria[] = (currentProgram?.standards || []).flatMap((s) => s.criteria || []);
                        return allCriteria.length > 0 ? allCriteria.map((criterion: Criteria, idx: number) => {
                            const std = (currentProgram?.standards || []).find((s) => s.criteria?.some((c) => c.id === criterion.id));
                            return (
                                <div key={criterion.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="mb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{criterion.name}</h3>
                                                {criterion.description && (
                                                    <p className="text-sm text-gray-600 mt-2">{criterion.description}</p>
                                                )}
                                                <div className="mt-2 text-sm text-gray-700">
                                                    {(() => {
                                                        const pts = (criterion as any).criteriaPoints ?? (criterion as any).criteria_points ?? [];
                                                        const sum = pts.reduce((acc: number, p: any) => {
                                                            const w = getPointWeight(p);
                                                            const n = typeof w === 'number' ? w : parseFloat(w);
                                                            return acc + (Number.isFinite(n) ? n : 0);
                                                        }, 0);
                                                        return <>Total Bobot: {formatScore(sum)}</>;
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <button
                                                    className="px-3 py-2 bg-red-600 text-white rounded-md text-sm"
                                                    onClick={() => {
                                                        setCriterionToDelete(criterion);
                                                        setShowDeleteModal(true);
                                                    }}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                                                value={(typeof currentProgram?.criteria_points_base_scale === 'number' && currentProgram?.criteria_points_base_scale > 0)
                                                                    ? String(currentProgram?.criteria_points_base_scale)
                                                                    : (typeof window !== 'undefined'
                                                                        ? (window.localStorage.getItem('criteriaPointsBaseScale') || '400')
                                                                        : '400')}
                                                                disabled
                                                                className="ml-2 w-24 rounded-md border border-gray-300 px-2 py-1 text-xs bg-gray-100 text-gray-600"
                                                                placeholder="400"
                                                            />
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elemen Penilaian LAM</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskriptor</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sangat baik = 4</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baik = 3</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cukup = 2</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kurang = 1</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {renderPointRows(criterion, std)}
                                                </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    {/* Frontend add criteria point section removed */}
                                </div>
                            );
                        }) : (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <p className="text-gray-500">Belum ada kriteria untuk program ini</p>
                            </div>
                        );
                    })()}
                </div>

                {(!currentProgram || (currentProgram as any).standards?.length === 0) && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">Belum ada kriteria yang ditetapkan untuk program ini</p>
                    </div>
                )}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Hapus</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Anda yakin ingin menghapus kriteria "{criterionToDelete?.name}"?
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
                                        if (!criterionToDelete) return;
                                        router.delete(route('coordinator-prodi.criteria.destroy', criterionToDelete.id), {
                                            preserveScroll: true,
                                            preserveState: true,
                                            onSuccess: () => {
                                                toast.success('Kriteria berhasil dihapus');
                                                setShowDeleteModal(false);
                                                setCriterionToDelete(null);
                                            },
                                            onError: () => {
                                                toast.error('Gagal menghapus kriteria');
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
    );
}
