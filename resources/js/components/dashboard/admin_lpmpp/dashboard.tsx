import { Link } from '@inertiajs/react';
import SummaryCard from './SummaryCard';
import ProgressChart from './ProgressChart';
import FacultyStatus from './FacultyStatus';
import ProgramStatus from './ProgramStatus';
import { route } from '@/lib/route';

interface Stats {
    totalPrograms?: number;
    inProgress?: number;
    inProgressChange?: number;
    assessorsAssigned?: number;
    problemDocuments?: number;
    totalFakultas?: number;
    totalProdi?: number;
    totalUnits?: number;
}

interface RecentAssignment {
    assessor_name: string;
    program_name: string;
    criteria_name: string;
    assigned_date: string;
    status: 'completed' | 'in_progress' | 'pending';
}

interface ProblemDocument {
    name: string;
    unit_name: string;
    issue_type: string;
}

interface ReadinessStatus {
    unggul: number;
    sangat_baik: number;
    baik: number;
    kurang: number;
}

interface ProgressChartData {
    date: string;
    count: number;
}

interface DocumentCompleteness {
    lengkap: number;
    belum_lengkap: number;
    salah_format: number;
    expired: number;
}

interface FacultyStatusItem {
    name: string;
    completion_percentage: number;
    status_color: string;
    criteria_fulfilled: number;
    total_criteria: number;
    pending_documents: number;
    rejected_documents: number;
}

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

interface Props {
    stats?: Stats;
    recentAssignments?: RecentAssignment[];
    problemDocuments?: ProblemDocument[];
    readinessStatus?: ReadinessStatus;
    progressChartData?: ProgressChartData[];
    documentCompleteness?: DocumentCompleteness;
    facultyStatus?: FacultyStatusItem[];
    programStatus?: ProgramStatusItem[];
}

export default function AdminLPMPPDashboard({
    stats,
    recentAssignments,
    problemDocuments,
    readinessStatus,
    progressChartData,
    documentCompleteness,
    facultyStatus,
    programStatus,
}: Props) {
    return (
        <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export
                            </button>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-blue-700">15 November 2025</span>
                            </div>
                        </div>
                    </div>

                    {/* Overview Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Program */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600">Total Program</h3>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">{stats?.totalPrograms || 0}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Program studi aktif</p>
                        </div>

                        {/* Program Sedang Akreditasi */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600">Sedang Akreditasi</h3>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">{stats?.inProgress || 0}</span>
                                <span className="text-sm text-blue-600 font-medium">+{stats?.inProgressChange || 0}%</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Dari bulan lalu</p>
                        </div>

                        {/* Asesor Terassign */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600">Asesor Terassign</h3>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">{stats?.assessorsAssigned || 0}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Asesor aktif</p>
                        </div>

                        {/* Dokumen Bermasalah */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600">Dokumen Bermasalah</h3>
                                </div>
                                <Link
                                    href="/documents/issues"
                                    className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900">{stats?.problemDocuments || 0}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Perlu perhatian</p>
                        </div>
                    </div>

                    {/* Ringkasan Progress Akreditasi */}
                    {stats && readinessStatus && (
                        <SummaryCard
                            totalFakultas={stats.totalFakultas || 0}
                            totalProdi={stats.totalProdi || 0}
                            totalUnits={stats.totalUnits || 0}
                            readinessStatus={readinessStatus}
                        />
                    )}

                    {/* Progress Chart */}
                    {progressChartData && documentCompleteness && (
                        <ProgressChart progressChartData={progressChartData} documentCompleteness={documentCompleteness} />
                    )}

                    {/* Status per Fakultas */}
                    {facultyStatus && <FacultyStatus facultyStatus={facultyStatus} />}

                    {/* Status per Prodi */}
                    {programStatus && <ProgramStatus programStatus={programStatus} />}

                    {/* Penugasan Asesor Terbaru */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <h2 className="text-lg font-semibold text-gray-900">Penugasan Asesor Terbaru</h2>
                            </div>
                            <Link
                                href={route('assessor-assignments.index')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Lihat Semua →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Asesor</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Program</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Kriteria</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tanggal</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAssignments?.map((assignment, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-900">{assignment.assessor_name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{assignment.program_name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{assignment.criteria_name}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{assignment.assigned_date}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    assignment.status === 'in_progress' ? 'bg-blue-200 text-blue-900' :
                                                    'bg-blue-50 text-blue-700'
                                                }`}>
                                                    {assignment.status === 'completed' ? 'Selesai' :
                                                     assignment.status === 'in_progress' ? 'Sedang' :
                                                     'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) || (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">
                                                Belum ada penugasan asesor
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Dokumen Bermasalah */}
                    {problemDocuments && problemDocuments.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">Dokumen Bermasalah</h2>
                                <Link
                                    href="/documents/issues"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Lihat Semua →
                                </Link>
                            </div>
                            <div className="space-y-3">
                                {problemDocuments.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{doc.name}</h3>
                                                <p className="text-sm text-gray-600">{doc.unit_name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {doc.issue_type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
        </div>
    );
}
