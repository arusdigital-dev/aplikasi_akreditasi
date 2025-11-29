import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Program {
    id: string;
    name: string;
}

interface CriteriaPoint {
    id: string;
    title: string;
    description: string;
    max_score: number;
}

interface Criteria {
    id: string;
    name: string;
    description: string;
    weight: number;
    order_index: number;
    criteria_points: CriteriaPoint[];
}

interface Standard {
    id: string;
    name: string;
    description: string;
    weight: number;
    order_index: number;
    criteria: Criteria[];
}

interface Props {
    standards: Standard[];
    totalWeight: number;
    program: Program | null;
    programs?: Program[];
    filters: {
        standard_id?: string;
        criteria_id?: string;
    };
}

export default function CriteriaPointsIndex({ standards, totalWeight, program, programs = [], filters }: Props) {
    const [selectedStandard, setSelectedStandard] = useState(filters.standard_id || '');
    const [selectedProgram, setSelectedProgram] = useState(program?.id || '');

    const handleFilter = () => {
        if (!selectedProgram && programs.length > 0) {
            setSelectedProgram(programs[0].id);
        }
        router.get(route('coordinator-prodi.criteria-points'), {
            program_id: selectedProgram || program?.id || programs[0]?.id,
            standard_id: selectedStandard || undefined,
        });
    };

    if (!program && programs.length === 0) {
        return (
            <DashboardLayout title="Poin Kriteria" subtitle="Lihat bobot dan standar poin kriteria akreditasi">
                <Head title="Poin Kriteria" />
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">Tidak ada program studi yang dapat diakses</p>
                </div>
            </DashboardLayout>
        );
    }

    const currentProgram = program || (programs.length > 0 ? programs[0] : null);

    const filteredStandards = selectedStandard
        ? standards.filter((std) => std.id === selectedStandard)
        : standards;

    return (
        <DashboardLayout title="Poin Kriteria" subtitle="Lihat bobot dan standar poin kriteria akreditasi">
            <Head title="Poin Kriteria" />

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {programs.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
                                <select
                                    value={selectedProgram || currentProgram?.id || ''}
                                    onChange={(e) => {
                                        setSelectedProgram(e.target.value);
                                        router.get(route('coordinator-prodi.criteria-points'), {
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Standard</label>
                            <select
                                value={selectedStandard}
                                onChange={(e) => setSelectedStandard(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua Standard</option>
                                {standards.map((standard) => (
                                    <option key={standard.id} value={standard.id}>
                                        {standard.name}
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
                    {currentProgram && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{currentProgram.name}</h2>
                            <p className="text-sm text-gray-500 mt-1">Total Bobot: {totalWeight}</p>
                        </div>
                    )}
                </div>

                {/* Standards */}
                <div className="space-y-4">
                    {filteredStandards.map((standard) => (
                        <div key={standard.id} className="bg-white rounded-lg shadow p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{standard.name}</h3>
                                {standard.description && (
                                    <p className="text-sm text-gray-600 mt-1">{standard.description}</p>
                                )}
                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                    <span>Bobot: {standard.weight}</span>
                                    <span>Kriteria: {standard.criteria.length}</span>
                                </div>
                            </div>

                            {/* Criteria */}
                            <div className="space-y-4">
                                {standard.criteria.map((criterion) => (
                                    <div key={criterion.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                                        <div className="mb-2">
                                            <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                                            {criterion.description && (
                                                <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                                            )}
                                            <div className="mt-2 text-xs text-gray-500">
                                                Bobot: {criterion.weight}
                                            </div>
                                        </div>

                                        {/* Criteria Points */}
                                        {criterion.criteria_points.length > 0 ? (
                                            <div className="mt-3 space-y-2">
                                                {criterion.criteria_points.map((point) => (
                                                    <div
                                                        key={point.id}
                                                        className="bg-white border border-gray-200 rounded-lg p-3"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{point.title}</p>
                                                                {point.description && (
                                                                    <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="ml-4 text-right">
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {point.max_score} poin
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Belum ada poin kriteria</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

