import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Program {
    id: string;
    name: string;
}

interface Criteria {
    criteria_id: string;
    criteria_name: string;
    documents_required: number;
    documents_available: number;
    status: 'lengkap' | 'belum_lengkap';
    missing_documents: string[];
}

interface Standard {
    standard_id: string;
    standard_name: string;
    total_criteria: number;
    completed_criteria: number;
    completion_percentage: number;
    criteria: Criteria[];
}

interface ProgramData {
    program_id: string;
    program_name: string;
    standards: Standard[];
    total_criteria: number;
    completed_criteria: number;
    completion_percentage: number;
}

interface Props {
    completenessData: ProgramData[];
    programs: Program[];
    filters: {
        program_id?: string;
        year?: number;
    };
}

export default function CompletenessReport({ completenessData, programs, filters }: Props) {
    const [selectedProgram, setSelectedProgram] = useState(filters.program_id || '');
    const [year, setYear] = useState(filters.year || new Date().getFullYear());

    const handleFilter = () => {
        router.get(route('coordinator-prodi.reports.completeness'), {
            program_id: selectedProgram || undefined,
            year: year,
        });
    };

    return (
        <DashboardLayout title="Laporan Kelengkapan Dokumen" subtitle="Laporan otomatis kelengkapan dokumen akreditasi">
            <Head title="Laporan Kelengkapan Dokumen" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program Studi</label>
                            <select
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua Program</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                min="2020"
                                max="2030"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
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

                {/* Programs */}
                {completenessData.map((programData) => (
                    <div key={programData.program_id} className="bg-white rounded-lg shadow p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">{programData.program_name}</h2>
                            <div className="mt-2 flex items-center gap-6">
                                <div>
                                    <span className="text-sm text-gray-600">Total Kriteria:</span>
                                    <span className="ml-2 font-semibold text-gray-900">{programData.total_criteria}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Lengkap:</span>
                                    <span className="ml-2 font-semibold text-green-600">{programData.completed_criteria}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Kelengkapan:</span>
                                    <span className="ml-2 font-semibold text-gray-900">{programData.completion_percentage.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${
                                        programData.completion_percentage >= 90
                                            ? 'bg-green-600'
                                            : programData.completion_percentage >= 75
                                            ? 'bg-blue-600'
                                            : programData.completion_percentage >= 50
                                            ? 'bg-yellow-600'
                                            : 'bg-red-600'
                                    }`}
                                    style={{ width: `${Math.min(programData.completion_percentage, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Standards */}
                        <div className="space-y-4">
                            {programData.standards.map((standard) => (
                                <div key={standard.standard_id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900">{standard.standard_name}</h3>
                                        <div className="text-sm text-gray-600">
                                            {standard.completed_criteria} / {standard.total_criteria} kriteria lengkap
                                            ({standard.completion_percentage.toFixed(1)}%)
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {standard.criteria.map((criterion) => (
                                            <div
                                                key={criterion.criteria_id}
                                                className={`p-3 rounded-lg border-l-4 ${
                                                    criterion.status === 'lengkap'
                                                        ? 'bg-green-50 border-green-500'
                                                        : 'bg-yellow-50 border-yellow-500'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{criterion.criteria_name}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Dokumen: {criterion.documents_available} / {criterion.documents_required}
                                                        </p>
                                                        {criterion.missing_documents.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs font-medium text-red-600">Dokumen yang belum ada:</p>
                                                                <ul className="text-xs text-red-600 list-disc list-inside mt-1">
                                                                    {criterion.missing_documents.map((doc, idx) => (
                                                                        <li key={idx}>{doc}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {criterion.status === 'lengkap' ? (
                                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                                                Lengkap
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                                                Belum Lengkap
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {completenessData.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-500">Tidak ada data kelengkapan dokumen</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

