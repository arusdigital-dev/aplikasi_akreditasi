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
    programs?: Program[];
}

export default function StandardsIndex({ program, programs = [] }: Props) {
    const [selectedProgram, setSelectedProgram] = useState(program?.id || '');

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
        <DashboardLayout title="Standar & Kriteria Akreditasi" subtitle="Lihat standar dan kriteria akreditasi (Read-only)">
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
                        <p className="text-sm text-blue-800">
                            <strong>Info:</strong> Halaman ini hanya untuk melihat standar dan kriteria akreditasi. Tidak dapat diubah.
                        </p>
                    </div>
                </div>

                {/* Standards */}
                <div className="space-y-4">
                    {currentProgram?.standards?.map((standard) => (
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
                                {standard.criteria.map((criterion) => (
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {(!currentProgram || currentProgram.standards?.length === 0) && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">Belum ada standar yang ditetapkan untuk program ini</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

