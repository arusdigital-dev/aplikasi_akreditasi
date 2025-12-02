import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface GapAnalysisProdi {
    prodi_id: string;
    prodi: string;
    fakultas: string;
    target_score: number | null;
    target_grade: string | null;
    realisasi: number;
    gap: number | null;
    rekomendasi: string[];
}

interface GapAnalysisFakultas {
    fakultas_id: string;
    fakultas: string;
    kriteria_lemah: Array<{
        kriteria: string;
        nilai_rata_rata: number;
    }>;
    nilai_per_kriteria: Array<{
        kriteria: string;
        nilai_rata_rata: number;
    }>;
    prioritas_tindakan: string[];
}

interface EarlyWarnings {
    low_completeness: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        completeness: number;
    }>;
    low_score: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        score: number;
    }>;
    problematic_criteria: Array<{
        prodi_id: string;
        prodi: string;
        criteria: string;
        score: number;
    }>;
    upcoming_deadlines: Array<{
        prodi_id: string;
        prodi: string;
        criteria: string;
        deadline: string;
        days_left: number;
    }>;
}

interface PrioritizationMatrix {
    high_risk: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        score: number;
        completeness: number;
        problematic_documents: number;
        incomplete_assessments: number;
        risk_score: number;
    }>;
    medium_risk: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        score: number;
        completeness: number;
        problematic_documents: number;
        incomplete_assessments: number;
        risk_score: number;
    }>;
    low_risk: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        score: number;
        completeness: number;
        problematic_documents: number;
        incomplete_assessments: number;
        risk_score: number;
    }>;
    top_performers: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        score: number;
        completeness: number;
        problematic_documents: number;
        incomplete_assessments: number;
        risk_score: number;
    }>;
}

interface RiskDashboard {
    heatmap_data: Array<{
        fakultas_id?: string;
        fakultas?: string;
        prodi_id?: string;
        prodi?: string;
        risk_score: number;
        risk_level: string;
    }>;
    risk_factors: Array<{
        category: string;
        count: number;
        avg_score: number;
    }>;
    risk_trends: Array<{
        week: string;
        week_label: string;
        risk_score: number;
    }>;
    projections: Array<{
        prodi_id: string;
        prodi: string;
        fakultas: string;
        current_score: number;
        projected_score: number;
        target_score: number | null;
        projected_grade: string;
        gap_if_no_action: number | null;
    }>;
}

interface Props {
    level: 'universitas' | 'fakultas' | 'prodi' | null;
    userRole: string;
    gapAnalysisProdi: GapAnalysisProdi[];
    gapAnalysisFakultas: GapAnalysisFakultas[];
    earlyWarnings: EarlyWarnings;
    prioritizationMatrix: PrioritizationMatrix;
    riskDashboard: RiskDashboard;
}

const getGapColor = (gap: number | null): string => {
    if (gap === null) {
        return '#6b7280';
    }
    if (gap >= 0) {
        return '#10b981';
    }
    if (gap >= -0.3) {
        return '#f59e0b';
    }
    return '#ef4444';
};

export default function InsightKesiapan({
    level,
    userRole,
    gapAnalysisProdi,
    gapAnalysisFakultas,
    earlyWarnings,
    prioritizationMatrix,
    riskDashboard,
}: Props) {
    const [selectedFakultas, setSelectedFakultas] = useState<string | null>(null);

    // Prepare horizontal bar chart data for gap analysis
    const gapChartData = gapAnalysisProdi.map((item) => ({
        prodi: item.prodi,
        target: item.target_score ?? 0,
        realisasi: item.realisasi,
        gap: item.gap ?? 0,
    }));

    const selectedFakultasData = selectedFakultas
        ? gapAnalysisFakultas.find((f) => f.fakultas_id === selectedFakultas)
        : null;

    const totalWarnings =
        earlyWarnings.low_completeness.length +
        earlyWarnings.low_score.length +
        earlyWarnings.problematic_criteria.length +
        earlyWarnings.upcoming_deadlines.length;

    return (
        <DashboardLayout title="Insight Kesiapan Akreditasi" subtitle="Gap Analysis dan Early Warning System">
            <Head title="Insight Kesiapan Akreditasi" />

            <div className="space-y-6">
                {/* Early Warning System Summary */}
                {totalWarnings > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-900 mb-2">Early Warning System</h3>
                                <p className="text-sm text-red-700 mb-4">
                                    Terdapat <strong>{totalWarnings} peringatan</strong> yang memerlukan perhatian segera
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {earlyWarnings.low_completeness.length > 0 && (
                                        <div className="bg-white rounded p-3">
                                            <div className="text-2xl font-bold text-red-600">{earlyWarnings.low_completeness.length}</div>
                                            <div className="text-xs text-gray-600">Kelengkapan &lt;70%</div>
                                        </div>
                                    )}
                                    {earlyWarnings.low_score.length > 0 && (
                                        <div className="bg-white rounded p-3">
                                            <div className="text-2xl font-bold text-red-600">{earlyWarnings.low_score.length}</div>
                                            <div className="text-xs text-gray-600">Nilai &lt;2.75</div>
                                        </div>
                                    )}
                                    {earlyWarnings.problematic_criteria.length > 0 && (
                                        <div className="bg-white rounded p-3">
                                            <div className="text-2xl font-bold text-red-600">{earlyWarnings.problematic_criteria.length}</div>
                                            <div className="text-xs text-gray-600">Kriteria Bermasalah</div>
                                        </div>
                                    )}
                                    {earlyWarnings.upcoming_deadlines.length > 0 && (
                                        <div className="bg-white rounded p-3">
                                            <div className="text-2xl font-bold text-red-600">{earlyWarnings.upcoming_deadlines.length}</div>
                                            <div className="text-xs text-gray-600">Deadline 7 Hari</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gap Analysis per Prodi */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Gap Analysis per Prodi</h3>
                    <div className="space-y-6">
                        {gapAnalysisProdi.map((item) => (
                            <div key={item.prodi_id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900">{item.prodi}</h4>
                                        {level === 'universitas' && (
                                            <p className="text-sm text-gray-500">{item.fakultas}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {item.target_score !== null ? (
                                            <>
                                                <div className="text-sm text-gray-600">
                                                    Target: <span className="font-medium">{item.target_score}</span> ({item.target_grade})
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Realisasi: <span className="font-medium">{item.realisasi}</span>
                                                </div>
                                                <div className={`text-sm font-semibold mt-1 ${
                                                    item.gap !== null && item.gap < 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    Gap: {item.gap !== null ? (item.gap > 0 ? '+' : '') + item.gap : 'N/A'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-sm text-gray-400">Tidak ada target</div>
                                        )}
                                    </div>
                                </div>

                                {/* Horizontal Gap Bar */}
                                {item.target_score !== null && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                                <div
                                                    className="absolute left-0 top-0 h-6 bg-blue-500 rounded-l-full"
                                                    style={{ width: `${(item.realisasi / 4) * 100}%` }}
                                                />
                                                <div
                                                    className="absolute top-0 h-6 border-r-2 border-red-500"
                                                    style={{ left: `${(item.target_score / 4) * 100}%` }}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-600 w-16 text-right">
                                                {item.gap !== null ? (item.gap > 0 ? '+' : '') + item.gap : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Realisasi: {item.realisasi}</span>
                                            <span>Target: {item.target_score}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Rekomendasi */}
                                {item.rekomendasi.length > 0 && (
                                    <div className="bg-yellow-50 rounded-lg p-3">
                                        <h5 className="text-sm font-semibold text-yellow-900 mb-2">Rekomendasi:</h5>
                                        <ul className="space-y-1">
                                            {item.rekomendasi.map((rec, idx) => (
                                                <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                                                    <span className="text-yellow-600">•</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Gap Chart */}
                    {gapChartData.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Visualisasi Gap Analysis</h4>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={gapChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 4]} />
                                    <YAxis dataKey="prodi" type="category" width={150} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="target" fill="#ef4444" name="Target" />
                                    <Bar dataKey="realisasi" fill="#3b82f6" name="Realisasi" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Gap Analysis per Fakultas */}
                {level === 'universitas' && gapAnalysisFakultas.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Gap Analysis per Fakultas</h3>
                            <select
                                value={selectedFakultas || ''}
                                onChange={(e) => setSelectedFakultas(e.target.value || null)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">Pilih Fakultas</option>
                                {gapAnalysisFakultas.map((fakultas) => (
                                    <option key={fakultas.fakultas_id} value={fakultas.fakultas_id}>
                                        {fakultas.fakultas}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedFakultasData && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">
                                        Kriteria Paling Lemah - {selectedFakultasData.fakultas}
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedFakultasData.kriteria_lemah.map((kriteria, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-900">{kriteria.kriteria}</span>
                                                <span className="text-sm font-bold text-red-600">{kriteria.nilai_rata_rata}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">Nilai Rata-rata per Kriteria</h4>
                                    <div className="space-y-2">
                                        {selectedFakultasData.nilai_per_kriteria.map((kriteria, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-48 text-sm text-gray-700">{kriteria.kriteria}</div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full ${
                                                            kriteria.nilai_rata_rata >= 3.5 ? 'bg-green-500' :
                                                            kriteria.nilai_rata_rata >= 3.0 ? 'bg-blue-500' :
                                                            kriteria.nilai_rata_rata >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${(kriteria.nilai_rata_rata / 4) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="w-16 text-sm font-medium text-gray-900 text-right">
                                                    {kriteria.nilai_rata_rata}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">Prioritas Tindakan yang Disarankan</h4>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <ul className="space-y-2">
                                            {selectedFakultasData.prioritas_tindakan.map((tindakan, idx) => (
                                                <li key={idx} className="text-sm text-blue-900 flex items-start gap-2">
                                                    <span className="text-blue-600">→</span>
                                                    <span>{tindakan}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Early Warning Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Low Completeness */}
                    {earlyWarnings.low_completeness.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Prodi dengan Kelengkapan &lt;70%
                            </h3>
                            <div className="space-y-2">
                                {earlyWarnings.low_completeness.map((item) => (
                                    <div key={item.prodi_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{item.prodi}</div>
                                            {level === 'universitas' && (
                                                <div className="text-xs text-gray-500">{item.fakultas}</div>
                                            )}
                                        </div>
                                        <div className="text-sm font-bold text-red-600">{item.completeness}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Low Score */}
                    {earlyWarnings.low_score.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Prodi dengan Nilai &lt;2.75
                            </h3>
                            <div className="space-y-2">
                                {earlyWarnings.low_score.map((item) => (
                                    <div key={item.prodi_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{item.prodi}</div>
                                            {level === 'universitas' && (
                                                <div className="text-xs text-gray-500">{item.fakultas}</div>
                                            )}
                                        </div>
                                        <div className="text-sm font-bold text-red-600">{item.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Problematic Criteria */}
                    {earlyWarnings.problematic_criteria.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Kriteria Paling Sering Bermasalah
                            </h3>
                            <div className="space-y-2">
                                {earlyWarnings.problematic_criteria.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{item.criteria}</div>
                                            <div className="text-xs text-gray-500">{item.prodi}</div>
                                        </div>
                                        <div className="text-sm font-bold text-orange-600">{item.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Deadlines */}
                    {earlyWarnings.upcoming_deadlines.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Deadline 7 Hari Lagi
                            </h3>
                            <div className="space-y-2">
                                {earlyWarnings.upcoming_deadlines.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{item.criteria}</div>
                                            <div className="text-xs text-gray-500">{item.prodi}</div>
                                            <div className="text-xs text-gray-400">{item.deadline}</div>
                                        </div>
                                        <div className="text-sm font-bold text-yellow-600">
                                            {item.days_left} hari
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Prioritization Matrix */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Prioritization Matrix</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* High Risk */}
                        <div className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-red-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                High Risk – Immediate Attention ({prioritizationMatrix.high_risk.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {prioritizationMatrix.high_risk.length > 0 ? (
                                    prioritizationMatrix.high_risk.map((item) => (
                                        <div key={item.prodi_id} className="bg-white rounded p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-sm font-medium text-gray-900">{item.prodi}</div>
                                                <div className="text-sm font-bold text-red-600">{item.risk_score}</div>
                                            </div>
                                            {level === 'universitas' && (
                                                <div className="text-xs text-gray-500 mb-1">{item.fakultas}</div>
                                            )}
                                            <div className="text-xs text-gray-600">
                                                Score: {item.score} | Completeness: {item.completeness}% | Issues: {item.problematic_documents + item.incomplete_assessments}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500 text-center py-4">Tidak ada prodi dengan risiko tinggi</div>
                                )}
                            </div>
                        </div>

                        {/* Medium Risk */}
                        <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Medium Risk – Needs Improvement ({prioritizationMatrix.medium_risk.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {prioritizationMatrix.medium_risk.length > 0 ? (
                                    prioritizationMatrix.medium_risk.map((item) => (
                                        <div key={item.prodi_id} className="bg-white rounded p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-sm font-medium text-gray-900">{item.prodi}</div>
                                                <div className="text-sm font-bold text-yellow-600">{item.risk_score}</div>
                                            </div>
                                            {level === 'universitas' && (
                                                <div className="text-xs text-gray-500 mb-1">{item.fakultas}</div>
                                            )}
                                            <div className="text-xs text-gray-600">
                                                Score: {item.score} | Completeness: {item.completeness}% | Issues: {item.problematic_documents + item.incomplete_assessments}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500 text-center py-4">Tidak ada prodi dengan risiko sedang</div>
                                )}
                            </div>
                        </div>

                        {/* Low Risk */}
                        <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Low Risk – On Track ({prioritizationMatrix.low_risk.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {prioritizationMatrix.low_risk.length > 0 ? (
                                    prioritizationMatrix.low_risk.map((item) => (
                                        <div key={item.prodi_id} className="bg-white rounded p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-sm font-medium text-gray-900">{item.prodi}</div>
                                                <div className="text-sm font-bold text-blue-600">{item.risk_score}</div>
                                            </div>
                                            {level === 'universitas' && (
                                                <div className="text-xs text-gray-500 mb-1">{item.fakultas}</div>
                                            )}
                                            <div className="text-xs text-gray-600">
                                                Score: {item.score} | Completeness: {item.completeness}%
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500 text-center py-4">Tidak ada prodi dengan risiko rendah</div>
                                )}
                            </div>
                        </div>

                        {/* Top Performers */}
                        <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Top Performers – No Action Needed ({prioritizationMatrix.top_performers.length})
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {prioritizationMatrix.top_performers.length > 0 ? (
                                    prioritizationMatrix.top_performers.map((item) => (
                                        <div key={item.prodi_id} className="bg-white rounded p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-sm font-medium text-gray-900">{item.prodi}</div>
                                                <div className="text-sm font-bold text-green-600">{item.score}</div>
                                            </div>
                                            {level === 'universitas' && (
                                                <div className="text-xs text-gray-500 mb-1">{item.fakultas}</div>
                                            )}
                                            <div className="text-xs text-gray-600">
                                                Score: {item.score} | Completeness: {item.completeness}% | Risk: {item.risk_score}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500 text-center py-4">Tidak ada top performers</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Risiko Real-Time */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Risiko Real-Time</h3>

                    {/* Heatmap Risiko */}
                    <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Heatmap Risiko</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {riskDashboard.heatmap_data.map((item, idx) => {
                                const name = item.fakultas || item.prodi || 'Unknown';
                                const riskColor = item.risk_level === 'High' ? 'bg-red-500' :
                                    item.risk_level === 'Medium' ? 'bg-yellow-500' :
                                    item.risk_level === 'Low' ? 'bg-blue-500' : 'bg-green-500';

                                return (
                                    <div key={idx} className={`${riskColor} rounded-lg p-4 text-white`}>
                                        <div className="text-sm font-medium mb-1">{name}</div>
                                        <div className="text-xs opacity-90 mb-2">{item.risk_level} Risk</div>
                                        <div className="text-lg font-bold">{item.risk_score.toFixed(1)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Faktor Penyebab Risiko */}
                    {riskDashboard.risk_factors.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Faktor Penyebab Risiko</h4>
                            <div className="space-y-2">
                                {riskDashboard.risk_factors.map((factor, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{factor.category}</div>
                                            <div className="text-xs text-gray-500">{factor.count} kasus</div>
                                        </div>
                                        <div className="text-sm font-bold text-red-600">{factor.avg_score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trend Risiko */}
                    {riskDashboard.risk_trends.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Trend Risiko (4 Minggu Terakhir)</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={riskDashboard.risk_trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week_label" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="risk_score"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        name="Risk Score"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Proyeksi Akreditasi */}
                    {riskDashboard.projections.length > 0 && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-4">Proyeksi Akreditasi (Jika Tidak Ada Perbaikan)</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prodi</th>
                                            {level === 'universitas' && (
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fakultas</th>
                                            )}
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nilai Saat Ini</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Proyeksi</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gap (No Action)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {riskDashboard.projections.map((proj) => (
                                            <tr key={proj.prodi_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm text-gray-900">{proj.prodi}</td>
                                                {level === 'universitas' && (
                                                    <td className="px-4 py-2 text-sm text-gray-500">{proj.fakultas}</td>
                                                )}
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">{proj.current_score}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-orange-600">{proj.projected_score}</span>
                                                        <span className="text-xs text-gray-500">({proj.projected_grade})</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {proj.target_score !== null ? proj.target_score : '-'}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                    {proj.gap_if_no_action !== null ? (
                                                        <span className={`font-medium ${
                                                            proj.gap_if_no_action < 0 ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                            {proj.gap_if_no_action > 0 ? '+' : ''}{proj.gap_if_no_action}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

