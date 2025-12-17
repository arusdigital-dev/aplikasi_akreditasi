import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useEffect, useState } from 'react';

type Rubric = {
    id?: number;
    score: number;
    label?: string | null;
    description: string;
    order_index?: number;
};

type Indicator = {
    id?: number;
    code: string;
    name: string;
    description?: string | null;
    document_requirements?: string[] | null;
    weight?: number;
    order_index?: number;
    is_auto_scorable?: boolean;
    auto_scoring_rules?: Record<string, any> | null;
    rubrics: Rubric[];
};

type Element = {
    id?: number;
    code: string;
    name: string;
    description?: string | null;
    weight?: number;
    order_index?: number;
    indicators: Indicator[];
};

type Standard = {
    id?: number;
    code: string;
    name: string;
    description?: string | null;
    weight?: number;
    order_index?: number;
    elements: Element[];
};

type LamInfo = {
    id: number | string;
    name: string;
    code: string;
    description?: string | null;
    min_score_scale: number;
    max_score_scale: number;
    accreditation_levels?: string[] | null;
};

type Props = {
    lam: LamInfo;
    standards: Standard[];
};

export default function AdminLPMPPLAMEdit({ lam, standards: initialStandards }: Props) {
    const [standards, setStandards] = useState<Standard[]>(initialStandards ?? []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        setStandards(initialStandards ?? []);
    }, [initialStandards]);

    const addStandard = () => {
        const nextIndex = standards.length + 1;
        setStandards([
            ...standards,
            { code: `K${nextIndex}`, name: '', description: '', weight: 0, order_index: nextIndex, elements: [] },
        ]);
    };

    const removeStandard = (index: number) => {
        const next = [...standards];
        next.splice(index, 1);
        setStandards(next);
    };

    const updateStandard = (index: number, patch: Partial<Standard>) => {
        const next = [...standards];
        next[index] = { ...next[index], ...patch };
        setStandards(next);
    };

    const addElement = (sIndex: number) => {
        const std = standards[sIndex];
        const nextOrder = (std.elements?.length ?? 0) + 1;
        const next = [...standards];
        next[sIndex] = {
            ...std,
            elements: [
                ...(std.elements ?? []),
                { code: `E${nextOrder}`, name: '', description: '', weight: 0, order_index: nextOrder, indicators: [] },
            ],
        };
        setStandards(next);
    };

    const removeElement = (sIndex: number, eIndex: number) => {
        const next = [...standards];
        const els = [...(next[sIndex].elements ?? [])];
        els.splice(eIndex, 1);
        next[sIndex].elements = els;
        setStandards(next);
    };

    const updateElement = (sIndex: number, eIndex: number, patch: Partial<Element>) => {
        const next = [...standards];
        const els = [...(next[sIndex].elements ?? [])];
        els[eIndex] = { ...els[eIndex], ...patch };
        next[sIndex].elements = els;
        setStandards(next);
    };

    const addIndicator = (sIndex: number, eIndex: number) => {
        const next = [...standards];
        const els = [...(next[sIndex].elements ?? [])];
        const el = els[eIndex];
        const nextOrder = (el.indicators?.length ?? 0) + 1;
        els[eIndex] = {
            ...el,
            indicators: [
                ...(el.indicators ?? []),
                {
                    code: `I${nextOrder}`,
                    name: '',
                    description: '',
                    document_requirements: [],
                    weight: 0,
                    order_index: nextOrder,
                    is_auto_scorable: false,
                    auto_scoring_rules: null,
                    rubrics: [
                        { score: 4, label: 'Sangat Baik', description: '' },
                        { score: 3, label: 'Baik', description: '' },
                        { score: 2, label: 'Cukup', description: '' },
                        { score: 1, label: 'Kurang', description: '' },
                    ],
                },
            ],
        };
        next[sIndex].elements = els;
        setStandards(next);
    };

    const removeIndicator = (sIndex: number, eIndex: number, iIndex: number) => {
        const next = [...standards];
        const els = [...(next[sIndex].elements ?? [])];
        const inds = [...(els[eIndex].indicators ?? [])];
        inds.splice(iIndex, 1);
        els[eIndex].indicators = inds;
        next[sIndex].elements = els;
        setStandards(next);
    };

    const updateIndicator = (sIndex: number, eIndex: number, iIndex: number, patch: Partial<Indicator>) => {
        const next = [...standards];
        const els = [...(next[sIndex].elements ?? [])];
        const inds = [...(els[eIndex].indicators ?? [])];
        inds[iIndex] = { ...inds[iIndex], ...patch };
        els[eIndex].indicators = inds;
        next[sIndex].elements = els;
        setStandards(next);
    };

    const updateRubric = (sIndex: number, eIndex: number, iIndex: number, rIndex: number, patch: Partial<Rubric>) => {
        const next = [...standards];
        const els = [...(next[sIndex].elements ?? [])];
        const inds = [...(els[eIndex].indicators ?? [])];
        const rubrics = [...(inds[iIndex].rubrics ?? [])];
        rubrics[rIndex] = { ...rubrics[rIndex], ...patch };
        inds[iIndex].rubrics = rubrics;
        els[eIndex].indicators = inds;
        next[sIndex].elements = els;
        setStandards(next);
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await router.post(route('admin-lpmpp.lam.structure.update', lam.id), { standards }, { preserveScroll: true });
            setSuccess('Struktur LAM berhasil disimpan');
        } catch (e: any) {
            setError('Gagal menyimpan perubahan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Head title={`Kelola LAM - ${lam.name}`} />
            <DashboardLayout title={`Kelola LAM: ${lam.name}`} subtitle={`${lam.code} • Skala ${lam.min_score_scale}-${lam.max_score_scale}`}>
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Struktur</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={addStandard}
                                    className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Tambah Standard
                                </button>
                                <button
                                    onClick={save}
                                    disabled={saving}
                                    className={`px-3 py-2 rounded-lg text-sm ${
                                        saving ? 'bg-gray-400 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </div>
                        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                        {success && <div className="mb-4 text-sm text-green-700">{success}</div>}
                        <div className="space-y-6">
                            {standards.map((std, sIndex) => (
                                <div key={sIndex} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                                            <input
                                                value={std.code ?? ''}
                                                onChange={(e) => updateStandard(sIndex, { code: e.target.value })}
                                                className="border border-gray-300 rounded-lg px-3 py-2"
                                                placeholder="Kode Standard"
                                            />
                                            <input
                                                value={std.name ?? ''}
                                                onChange={(e) => updateStandard(sIndex, { name: e.target.value })}
                                                className="border border-gray-300 rounded-lg px-3 py-2"
                                                placeholder="Nama Standard"
                                            />
                                            <input
                                                type="number"
                                                value={std.weight ?? 0}
                                                onChange={(e) => updateStandard(sIndex, { weight: Number(e.target.value) })}
                                                className="border border-gray-300 rounded-lg px-3 py-2"
                                                placeholder="Bobot"
                                            />
                                            <button
                                                onClick={() => removeStandard(sIndex)}
                                                className="px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <textarea
                                            value={std.description ?? ''}
                                            onChange={(e) => updateStandard(sIndex, { description: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="Deskripsi"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-gray-900">Elemen</h3>
                                            <button
                                                onClick={() => addElement(sIndex)}
                                                className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                Tambah Elemen
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {(std.elements ?? []).map((el, eIndex) => (
                                                <div key={eIndex} className="border rounded-lg p-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                                        <input
                                                            value={el.code ?? ''}
                                                            onChange={(e) => updateElement(sIndex, eIndex, { code: e.target.value })}
                                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                                            placeholder="Kode Elemen"
                                                        />
                                                        <input
                                                            value={el.name ?? ''}
                                                            onChange={(e) => updateElement(sIndex, eIndex, { name: e.target.value })}
                                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                                            placeholder="Nama Elemen"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={el.weight ?? 0}
                                                            onChange={(e) => updateElement(sIndex, eIndex, { weight: Number(e.target.value) })}
                                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                                            placeholder="Bobot"
                                                        />
                                                        <button
                                                            onClick={() => removeElement(sIndex, eIndex)}
                                                            className="px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                        <div />
                                                    </div>
                                                    <div className="mt-3">
                                                        <textarea
                                                            value={el.description ?? ''}
                                                            onChange={(e) => updateElement(sIndex, eIndex, { description: e.target.value })}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                            placeholder="Deskripsi"
                                                        />
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-sm font-semibold text-gray-900">Indikator</h4>
                                                            <button
                                                                onClick={() => addIndicator(sIndex, eIndex)}
                                                                className="px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-700"
                                                            >
                                                                Tambah Indikator
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {(el.indicators ?? []).map((ind, iIndex) => (
                                                                <div key={iIndex} className="border rounded-lg p-3">
                                                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                                                        <input
                                                                            value={ind.code ?? ''}
                                                                            onChange={(e) =>
                                                                                updateIndicator(sIndex, eIndex, iIndex, { code: e.target.value })
                                                                            }
                                                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                                                            placeholder="Kode Indikator"
                                                                        />
                                                                        <input
                                                                            value={ind.name ?? ''}
                                                                            onChange={(e) =>
                                                                                updateIndicator(sIndex, eIndex, iIndex, { name: e.target.value })
                                                                            }
                                                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                                                            placeholder="Nama Indikator"
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            value={ind.weight ?? 0}
                                                                            onChange={(e) =>
                                                                                updateIndicator(sIndex, eIndex, iIndex, {
                                                                                    weight: Number(e.target.value),
                                                                                })
                                                                            }
                                                                            className="border border-gray-300 rounded-lg px-3 py-2"
                                                                            placeholder="Bobot"
                                                                        />
                                                                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={ind.is_auto_scorable ?? false}
                                                                                onChange={(e) =>
                                                                                    updateIndicator(sIndex, eIndex, iIndex, {
                                                                                        is_auto_scorable: e.target.checked,
                                                                                    })
                                                                                }
                                                                            />
                                                                            Auto Scoring
                                                                        </label>
                                                                        <button
                                                                            onClick={() => removeIndicator(sIndex, eIndex, iIndex)}
                                                                            className="px-3 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700"
                                                                        >
                                                                            Hapus
                                                                        </button>
                                                                        <div />
                                                                    </div>
                                                                    <div className="mt-3">
                                                                        <textarea
                                                                            value={ind.description ?? ''}
                                                                            onChange={(e) =>
                                                                                updateIndicator(sIndex, eIndex, iIndex, {
                                                                                    description: e.target.value,
                                                                                })
                                                                            }
                                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                                            placeholder="Deskripsi"
                                                                        />
                                                                    </div>
                                                                    <div className="mt-3">
                                                                        <div className="text-sm font-semibold text-gray-900 mb-2">
                                                                            Rubrik Penilaian
                                                                        </div>
                                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                            {ind.rubrics.map((rb, rIndex) => (
                                                                                <div key={rIndex} className="border rounded-lg p-3">
                                                                                    <div className="text-xs text-gray-600 mb-2">Skor {rb.score}</div>
                                                                                    <input
                                                                                        value={rb.label ?? ''}
                                                                                        onChange={(e) =>
                                                                                            updateRubric(sIndex, eIndex, iIndex, rIndex, {
                                                                                                label: e.target.value,
                                                                                            })
                                                                                        }
                                                                                        className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                                                                                        placeholder="Label"
                                                                                    />
                                                                                    <textarea
                                                                                        value={rb.description ?? ''}
                                                                                        onChange={(e) =>
                                                                                            updateRubric(sIndex, eIndex, iIndex, rIndex, {
                                                                                                description: e.target.value,
                                                                                            })
                                                                                        }
                                                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                                                        placeholder="Deskripsi"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
