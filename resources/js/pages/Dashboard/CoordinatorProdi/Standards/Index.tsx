import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Criteria {
    id: string;
    name: string;
    description: string;
    weight: number;
    order_index: number;
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
}

interface Props {
    program: (Program & {
        standards: Standard[];
    }) | null;
    programs?: (Program & { standards?: Standard[] })[];
}

export default function StandardsIndex({ program, programs = [] }: Props) {
    const [selectedProgram, setSelectedProgram] = useState(program?.id || '');
    const [newCriterion, setNewCriterion] = useState<{ name: string; description: string; weight: number; order_index: number; standard_id: string }>({ name: '', description: '', weight: 1, order_index: 1, standard_id: '' });
    const [assessorScope, setAssessorScope] = useState('LKPS');

    if (!program && programs.length === 0) {
        return (
            <DashboardLayout title="Standar & Kriteria Akreditasi" subtitle="Lihat standar dan kriteria akreditasi (Read-only)">
                <Head title="Standar & Kriteria Akreditasi" />
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">Tidak ada program studi yang dapat diakses</p>
                </div>
            </DashboardLayout>
        );
    }

    const currentProgram = program || (programs.length > 0 ? programs[0] : null);

    return (
        <DashboardLayout title="Standar & Kriteria Akreditasi" subtitle="Kelola standar dan kriteria akreditasi">
            <Head title="Standar & Kriteria Akreditasi" />

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
                            </div>
                        </div>
                    )}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">Tambahkan kriteria baru pada standar dan ajukan penunjukan asesor.</p>
                    </div>
                </div>

                {/* Standards */}
                <div className="space-y-4">
                    {currentProgram?.standards?.map((standard: Standard) => (
                        <div key={standard.id} className="bg-white rounded-lg shadow p-6">
                            <div className="mb-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">{standard.name}</h3>
                                    <span className="text-sm text-gray-500">Bobot: {standard.weight}</span>
                                </div>
                                {standard.description && (
                                    <p className="text-sm text-gray-600 mt-2">{standard.description}</p>
                                )}
                            </div>

                            {/* Criteria */}
                            <div className="space-y-3">
                                {standard.criteria.map((criterion: Criteria) => (
                                    <div
                                        key={criterion.id}
                                        className="border-l-4 border-gray-300 pl-4 py-3 bg-gray-50 rounded-r-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                                                {criterion.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                                                )}
                                            </div>
                                            <div className="ml-4 text-right">
                                                <span className="text-sm text-gray-500">Bobot: {criterion.weight}</span>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={assessorScope}
                                                        onChange={(e) => setAssessorScope(e.target.value)}
                                                        placeholder="Kategori (mis. LKPS)"
                                                        className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                                                    />
                                                    <button
                                                        className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs"
                                                        onClick={() => {
                                                            router.post(route('coordinator-prodi.assessor-requests.store'), {
                                                                criteria_id: criterion.id,
                                                                scope_category: assessorScope,
                                                            });
                                                        }}
                                                    >
                                                        Ajukan Asesor
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 border-t pt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Tambah Kriteria Baru</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nama kriteria"
                                        value={newCriterion.name}
                                        onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value, standard_id: standard.id })}
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Bobot"
                                        value={newCriterion.weight}
                                        onChange={(e) => setNewCriterion({ ...newCriterion, weight: parseFloat(e.target.value), standard_id: standard.id })}
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Urutan"
                                        value={newCriterion.order_index}
                                        onChange={(e) => setNewCriterion({ ...newCriterion, order_index: parseInt(e.target.value), standard_id: standard.id })}
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    />
                                    <button
                                        className="px-3 py-2 bg-green-600 text-white rounded-md text-sm"
                                        onClick={() => {
                                            if (!newCriterion.name) return;
                                            router.post(route('coordinator-prodi.criteria.store'), {
                                                standard_id: standard.id,
                                                name: newCriterion.name,
                                                description: newCriterion.description,
                                                weight: newCriterion.weight,
                                                order_index: newCriterion.order_index,
                                            });
                                        }}
                                    >
                                        Simpan Kriteria
                                    </button>
                                </div>
                                <textarea
                                    placeholder="Deskripsi (opsional)"
                                    value={newCriterion.description}
                                    onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value, standard_id: standard.id })}
                                    className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    rows={2}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {(!currentProgram || (currentProgram as any).standards?.length === 0) && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">Belum ada standar yang ditetapkan untuk program ini</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

