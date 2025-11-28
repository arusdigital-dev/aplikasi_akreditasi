import { useState } from 'react';

interface CriteriaDetail {
    id: number;
    name: string;
    score: number;
    max_score: number;
    percentage: number;
}

interface ProgramScore {
    id: number;
    name: string;
    fakultas: string;
    jenjang: string;
    total_score: number;
    max_score: number;
    percentage: number;
    criteria_details: CriteriaDetail[];
    strong_criteria: CriteriaDetail[];
    weak_criteria: CriteriaDetail[];
    suggestions: string[];
}

interface Props {
    programScores: ProgramScore[];
}

export default function AccreditationRecap({ programScores }: Props) {
    const [selectedProgram, setSelectedProgram] = useState<ProgramScore | null>(
        programScores.length > 0 ? programScores[0] : null
    );

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) {
            return 'text-green-600';
        }
        if (percentage >= 60) {
            return 'text-yellow-600';
        }
        return 'text-red-600';
    };

    const getScoreBgColor = (percentage: number) => {
        if (percentage >= 80) {
            return 'bg-green-100';
        }
        if (percentage >= 60) {
            return 'bg-yellow-100';
        }
        return 'bg-red-100';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Rekap Nilai Akreditasi</h2>

            {/* Program List */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Daftar Program Studi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {programScores.map((program) => (
                        <button
                            key={program.id}
                            onClick={() => setSelectedProgram(program)}
                            className={`text-left p-4 border rounded-lg transition-colors ${
                                selectedProgram?.id === program.id
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-900">{program.name}</p>
                                <span className={`text-lg font-bold ${getScoreColor(program.percentage)}`}>
                                    {program.percentage}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">{program.fakultas}</p>
                            <p className="text-xs text-gray-500">{program.jenjang}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Program Details */}
            {selectedProgram && (
                <div className="space-y-6">
                    {/* Total Score */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{selectedProgram.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {selectedProgram.fakultas} - {selectedProgram.jenjang}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Nilai Total</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {selectedProgram.total_score} / {selectedProgram.max_score}
                                </p>
                                <p className={`text-lg font-semibold ${getScoreColor(selectedProgram.percentage)}`}>
                                    {selectedProgram.percentage}%
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full ${getScoreBgColor(selectedProgram.percentage)}`}
                                style={{ width: `${Math.min(selectedProgram.percentage, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Gap Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Strong Criteria */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Kriteria Kuat (≥80%)
                            </h3>
                            <div className="space-y-2">
                                {selectedProgram.strong_criteria.length > 0 ? (
                                    selectedProgram.strong_criteria.map((criterion) => (
                                        <div key={criterion.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
                                            <p className="text-sm font-medium text-gray-900 mb-1">{criterion.name}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-600">
                                                    {criterion.score} / {criterion.max_score}
                                                </p>
                                                <span className="text-xs font-semibold text-green-700">
                                                    {criterion.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Belum ada kriteria yang mencapai ≥80%</p>
                                )}
                            </div>
                        </div>

                        {/* Weak Criteria */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                Kriteria Lemah (&lt;60%)
                            </h3>
                            <div className="space-y-2">
                                {selectedProgram.weak_criteria.length > 0 ? (
                                    selectedProgram.weak_criteria.map((criterion) => (
                                        <div key={criterion.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                                            <p className="text-sm font-medium text-gray-900 mb-1">{criterion.name}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-600">
                                                    {criterion.score} / {criterion.max_score}
                                                </p>
                                                <span className="text-xs font-semibold text-red-700">
                                                    {criterion.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Tidak ada kriteria yang perlu perhatian khusus</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Automatic Suggestions */}
                    {selectedProgram.suggestions.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                                Saran Otomatis
                            </h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                                {selectedProgram.suggestions.map((suggestion, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <p className="text-sm text-gray-900">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Criteria Details */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Detail Semua Kriteria</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kriteria</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nilai</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Maksimum</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Persentase</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProgram.criteria_details.map((criterion) => (
                                        <tr key={criterion.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900">{criterion.name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{criterion.score}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{criterion.max_score}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${
                                                                criterion.percentage >= 80
                                                                    ? 'bg-green-600'
                                                                    : criterion.percentage >= 60
                                                                    ? 'bg-yellow-600'
                                                                    : 'bg-red-600'
                                                            }`}
                                                            style={{ width: `${Math.min(criterion.percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-medium ${getScoreColor(criterion.percentage)}`}>
                                                        {criterion.percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


