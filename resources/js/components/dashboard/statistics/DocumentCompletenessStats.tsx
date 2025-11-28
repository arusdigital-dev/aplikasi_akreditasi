import { Link } from '@inertiajs/react';

interface GrowthChartData {
    month: string;
    count: number;
}

interface SlowProgram {
    id: number;
    name: string;
    fakultas: string;
    completion_rate: number;
    total_criteria: number;
    completed_criteria: number;
}

interface ProblemDocument {
    id: number;
    program_name: string;
    criterion_name: string;
    assessor_name: string;
    issue_type: string;
    deadline: string | null;
    assigned_date: string | null;
}

interface Props {
    growthChart: GrowthChartData[];
    slowPrograms: SlowProgram[];
    problemDocuments: ProblemDocument[];
    totalProblemDocuments: number;
}

export default function DocumentCompletenessStats({
    growthChart,
    slowPrograms,
    problemDocuments,
    totalProblemDocuments,
}: Props) {
    const maxCount = Math.max(...growthChart.map((d) => d.count), 1);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Statistik Kelengkapan Dokumen</h2>

                {/* Growth Chart */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Grafik Pertumbuhan Dokumen Terkumpul</h3>
                    <div className="flex items-end gap-2 h-64">
                        {growthChart.map((data, index) => {
                            const height = (data.count / maxCount) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                                        <div
                                            className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                                            style={{ height: `${height}%` }}
                                            title={`${data.month}: ${data.count} dokumen`}
                                        />
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600 text-center transform -rotate-45 origin-top-left whitespace-nowrap">
                                        {data.month}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex justify-center gap-4 text-sm text-gray-600">
                        {growthChart.map((data, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                <span>
                                    {data.month}: {data.count} dokumen
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slow Programs */}
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Prodi dengan Progress Terlambat</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Prodi</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fakultas</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Progress</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kriteria</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slowPrograms.length > 0 ? (
                                    slowPrograms.map((program) => (
                                        <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900">{program.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{program.fakultas}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${
                                                                program.completion_rate < 30
                                                                    ? 'bg-red-600'
                                                                    : program.completion_rate < 60
                                                                    ? 'bg-yellow-600'
                                                                    : 'bg-green-600'
                                                            }`}
                                                            style={{ width: `${program.completion_rate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-700">{program.completion_rate}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {program.completed_criteria} / {program.total_criteria}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-500">
                                            Tidak ada data prodi
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Problem Documents Indicator */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Dokumen Bermasalah</h3>
                        <Link
                            href={route('assessor-assignments.index')}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Lihat Semua →
                        </Link>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-red-900">{totalProblemDocuments}</p>
                                <p className="text-sm text-red-700">Dokumen memerlukan perhatian</p>
                            </div>
                        </div>
                        {problemDocuments.length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {problemDocuments.slice(0, 5).map((doc) => (
                                    <div key={doc.id} className="bg-white rounded p-2 text-sm">
                                        <p className="font-medium text-gray-900">{doc.program_name}</p>
                                        <p className="text-gray-600">
                                            {doc.criterion_name} - {doc.assessor_name}
                                        </p>
                                        <p className="text-red-600 text-xs">Masalah: {doc.issue_type}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


