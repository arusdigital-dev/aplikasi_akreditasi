import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

interface Stats {
    total_documents: number;
    pending_evaluations: number;
    completed_evaluations: number;
}

interface EvaluationStatusStats {
    valid: number;
    invalid: number;
    minor_revision: number;
    major_revision: number;
}

interface RecentAssignment {
    id: number;
    criterion_name: string;
    program_name: string;
    unit_name: string;
    assigned_date: string;
    deadline: string | null;
}

interface RecentEvaluationNote {
    id: number;
    document_name: string;
    criterion_name: string;
    status: string;
    created_at: string;
}

interface Props {
    stats: Stats;
    evaluationStatusStats: EvaluationStatusStats;
    recentAssignments: RecentAssignment[];
    recentEvaluationNotes: RecentEvaluationNote[];
}

export default function AssessorInternalIndex({ stats, evaluationStatusStats, recentAssignments, recentEvaluationNotes }: Props) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            valid: { label: 'Valid', className: 'bg-green-100 text-green-800' },
            invalid: { label: 'Tidak Valid', className: 'bg-red-100 text-red-800' },
            minor_revision: { label: 'Perlu Perbaikan Minor', className: 'bg-yellow-100 text-yellow-800' },
            major_revision: { label: 'Perlu Perbaikan Mayor', className: 'bg-orange-100 text-orange-800' },
        };

        const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.className}`}>
                {statusInfo.label}
            </span>
        );
    };

    return (
        <DashboardLayout title="Dashboard Asesor Internal" subtitle="Ringkasan evaluasi dan penugasan">
            <Head title="Dashboard Asesor Internal" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Dokumen</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total_documents}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Menunggu Evaluasi</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending_evaluations}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Selesai Dievaluasi</p>
                                <p className="text-2xl font-bold text-green-600 mt-2">{stats.completed_evaluations}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={route('assessor-internal.evaluation-documents.index')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                            Lihat Daftar Dokumen Evaluasi
                        </Link>
                    </div>
                </div>

                {/* Evaluation Status Statistics */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Status Evaluasi</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{evaluationStatusStats.valid}</p>
                            <p className="text-sm text-gray-600 mt-1">Valid</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{evaluationStatusStats.invalid}</p>
                            <p className="text-sm text-gray-600 mt-1">Tidak Valid</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{evaluationStatusStats.minor_revision}</p>
                            <p className="text-sm text-gray-600 mt-1">Perbaikan Minor</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">{evaluationStatusStats.major_revision}</p>
                            <p className="text-sm text-gray-600 mt-1">Perbaikan Mayor</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Assignments */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Penugasan Terbaru</h3>
                        {recentAssignments.length > 0 ? (
                            <div className="space-y-3">
                                {recentAssignments.map((assignment) => (
                                    <div key={assignment.id} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                                        <p className="text-sm font-medium text-gray-900">{assignment.criterion_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{assignment.program_name} - {assignment.unit_name}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Ditugaskan: {assignment.assigned_date}
                                            {assignment.deadline && ` • Deadline: ${assignment.deadline}`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Tidak ada penugasan terbaru</p>
                        )}
                    </div>

                    {/* Recent Evaluation Notes */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluasi Terbaru</h3>
                        {recentEvaluationNotes.length > 0 ? (
                            <div className="space-y-3">
                                {recentEvaluationNotes.map((note) => (
                                    <div key={note.id} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{note.document_name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{note.criterion_name}</p>
                                                <p className="text-xs text-gray-400 mt-1">{note.created_at}</p>
                                            </div>
                                            <div className="ml-3">
                                                {getStatusBadge(note.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Tidak ada evaluasi terbaru</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

