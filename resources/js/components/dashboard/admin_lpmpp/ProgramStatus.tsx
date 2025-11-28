interface ProgramStatusItem {
    id: number;
    name: string;
    fakultas: string;
    jenjang: string;
    progress_percentage: number;
    simulated_score: number;
    nearest_deadline: string | null;
    pic_name: string;
    has_issues: boolean;
    completed_criteria: number;
    total_criteria: number;
}

interface ProgramStatusProps {
    programStatus: ProgramStatusItem[];
}

export default function ProgramStatus({ programStatus }: ProgramStatusProps) {
    const getProgressColor = (percentage: number): string => {
        if (percentage >= 90) {
            return 'bg-green-600';
        }
        if (percentage >= 75) {
            return 'bg-blue-600';
        }
        if (percentage >= 50) {
            return 'bg-yellow-600';
        }
        return 'bg-red-600';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Status per Prodi</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Prodi</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fakultas</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Progress</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nilai Sementara</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Poin Simulasi</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Deadline</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">PIC</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Notifikasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {programStatus.length > 0 ? (
                            programStatus.map((program) => (
                                <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{program.name}</p>
                                            <p className="text-xs text-gray-500">{program.jenjang}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">{program.fakultas}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${getProgressColor(program.progress_percentage)}`}
                                                    style={{ width: `${Math.min(program.progress_percentage, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 w-12">
                                                {program.progress_percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {program.completed_criteria} / {program.total_criteria} kriteria
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-sm font-semibold text-gray-900">{program.simulated_score}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-sm text-gray-700">{program.simulated_score}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        {program.nearest_deadline ? (
                                            <p className="text-sm text-gray-700">{program.nearest_deadline}</p>
                                        ) : (
                                            <p className="text-sm text-gray-400">-</p>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-sm text-gray-700">{program.pic_name}</p>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {program.has_issues && (
                                            <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-500">
                                    Belum ada data program studi
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

