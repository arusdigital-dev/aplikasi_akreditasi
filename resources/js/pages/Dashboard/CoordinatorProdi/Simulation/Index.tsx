import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Program {
    id: string;
    name: string;
}

interface Standard {
    standard_id: string;
    standard_name: string;
    weight: number;
    criteria: Criteria[];
    simulated_score: number;
    max_score: number;
    percentage: number;
}

interface Criteria {
    criteria_id: string;
    criteria_name: string;
    weight: number;
    simulated_score: number;
    max_score: number;
    percentage: number;
    based_on: string;
}

interface Target {
    target_score: number;
    target_grade: string;
    gap_score: number;
    gap_percentage: number;
}

interface Props {
    simulationData: {
        program_id: string;
        program_name: string;
        year: number;
        standards: Standard[];
        total_score: number;
        max_possible_score: number;
        total_percentage: number;
        grade: string;
        target?: Target;
    };
    programs: Program[];
}

export default function SimulationIndex({ simulationData, programs }: Props) {
    const [selectedProgram, setSelectedProgram] = useState(simulationData.program_id || (programs.length > 0 ? programs[0].id : ''));
    const [year, setYear] = useState(simulationData.year);

    const handleFilter = () => {
        if (!selectedProgram && programs.length > 0) {
            setSelectedProgram(programs[0].id);
        }
        router.get(route('coordinator-prodi.simulation'), {
            program_id: selectedProgram || programs[0]?.id,
            year: year,
        });
    };

    if (!simulationData.program_id && programs.length === 0) {
        return (
            <DashboardLayout title="Simulasi Penilaian" subtitle="Simulasi penilaian berdasarkan standar BAN-PT/LAM">
                <Head title="Simulasi Penilaian" />
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">Tidak ada program studi yang dapat diakses</p>
                </div>
            </DashboardLayout>
        );
    }

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'Unggul':
                return 'bg-green-100 text-green-800';
            case 'Sangat Baik':
                return 'bg-blue-100 text-blue-800';
            case 'Baik':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-red-100 text-red-800';
        }
    };

    return (
        <DashboardLayout title="Simulasi Penilaian" subtitle="Simulasi penilaian berdasarkan standar BAN-PT/LAM">
            <Head title="Simulasi Penilaian" />

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
                                Simulasi
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{simulationData.program_name}</h2>
                            <p className="text-sm text-gray-500">Tahun {simulationData.year}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                                {simulationData.total_score.toFixed(2)} / {simulationData.max_possible_score.toFixed(2)}
                            </div>
                            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block ${getGradeColor(simulationData.grade)}`}>
                                {simulationData.grade}
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-blue-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${Math.min(simulationData.total_percentage, 100)}%` }}
                        >
                            {simulationData.total_percentage.toFixed(1)}%
                        </div>
                    </div>
                    {simulationData.target && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Target Akreditasi</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {simulationData.target.target_grade} ({simulationData.target.target_score})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Gap</p>
                                    <p className={`text-lg font-semibold ${simulationData.target.gap_score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {simulationData.target.gap_score >= 0 ? '+' : ''}{simulationData.target.gap_score.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Standards */}
                <div className="space-y-4">
                    {simulationData.standards.map((standard) => (
                        <div key={standard.standard_id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{standard.standard_name}</h3>
                                    <p className="text-sm text-gray-500">Bobot: {standard.weight}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-gray-900">
                                        {standard.simulated_score.toFixed(2)} / {standard.max_score.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-500">{standard.percentage.toFixed(1)}%</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(standard.percentage, 100)}%` }}
                                ></div>
                            </div>
                            <div className="space-y-3">
                                {standard.criteria.map((criterion) => (
                                    <div key={criterion.criteria_id} className="border-l-4 border-gray-300 pl-4 py-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{criterion.criteria_name}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Berdasarkan: {criterion.based_on === 'evaluations' ? 'Evaluasi Asesor' : criterion.based_on === 'document_completeness' ? 'Kelengkapan Dokumen' : 'Default'}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {criterion.simulated_score.toFixed(2)} / {criterion.max_score.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-500">{criterion.percentage.toFixed(1)}%</p>
                                            </div>
                                        </div>
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

