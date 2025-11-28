interface FacultyScore {
    fakultas: string;
    average_score: number;
    total_evaluations: number;
}

interface LowScoreCriterion {
    id: number;
    name: string;
    program_name: string;
    average_score: number;
    max_score: number;
}

interface IncompleteReviewer {
    id: string;
    name: string;
    email: string;
    total_assignments: number;
    completed_assignments: number;
    pending_assignments: number;
    completion_rate: number;
}

interface Props {
    facultyScores: FacultyScore[];
    lowScoreCriteria: LowScoreCriterion[];
    incompleteReviewers: IncompleteReviewer[];
}

export default function AssessorEvaluationStats({ facultyScores, lowScoreCriteria, incompleteReviewers }: Props) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Statistik Penilaian Asesor</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Average Score per Faculty */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Rata-rata Nilai per Fakultas</h3>
                    <div className="space-y-3">
                        {facultyScores.length > 0 ? (
                            facultyScores.map((faculty, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-gray-900">{faculty.fakultas}</p>
                                        <p className="text-lg font-bold text-gray-900">{faculty.average_score}</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{faculty.total_evaluations} evaluasi</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Belum ada data evaluasi</p>
                        )}
                    </div>
                </div>

                {/* Criteria with Lowest Scores */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Kriteria dengan Nilai Terendah</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {lowScoreCriteria.length > 0 ? (
                            lowScoreCriteria.map((criterion) => {
                                const percentage = criterion.max_score > 0 ? (criterion.average_score / criterion.max_score) * 100 : 0;
                                return (
                                    <div key={criterion.id} className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-sm font-medium text-gray-900 mb-1">{criterion.name}</p>
                                        <p className="text-xs text-gray-600 mb-2">{criterion.program_name}</p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        percentage < 50 ? 'bg-red-600' : percentage < 70 ? 'bg-yellow-600' : 'bg-green-600'
                                                    }`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-700">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {criterion.average_score} / {criterion.max_score}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500">Belum ada data evaluasi</p>
                        )}
                    </div>
                </div>

                {/* Incomplete Reviewers */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Reviewer Belum Menyelesaikan Penilaian</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {incompleteReviewers.length > 0 ? (
                            incompleteReviewers.map((reviewer) => (
                                <div key={reviewer.id} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{reviewer.name}</p>
                                            <p className="text-xs text-gray-500">{reviewer.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-red-600">{reviewer.pending_assignments}</p>
                                            <p className="text-xs text-gray-500">pending</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${reviewer.completion_rate}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-700">{reviewer.completion_rate}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {reviewer.completed_assignments} / {reviewer.total_assignments} selesai
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Semua reviewer sudah menyelesaikan penilaian</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


