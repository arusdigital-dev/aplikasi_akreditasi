import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState } from 'react';

interface Assessor {
    id: string;
    name: string;
    email: string;
    unit_name: string;
}

interface Assignment {
    id: number;
    assessor: Assessor;
    criterion?: {
        id: number;
        name: string;
        standard?: {
            name: string;
            program?: {
                name: string;
            };
        };
    };
    unit?: {
        id: string;
        name: string;
    };
    assignment_type: string;
    access_level: string;
    deadline: string | null;
    status: string;
    assigned_date: string;
}

interface MonitoringStats {
    active_assessors: number;
    total_assignments: number;
    completed_assignments: number;
    overdue_assignments: number;
    assessors_progress: Array<{
        id: string;
        name: string;
        email: string;
        total: number;
        completed: number;
        progress: number;
    }>;
}

interface Props {
    assignments: {
        data: Assignment[];
        links: any;
        meta: any;
    };
    assessors: Assessor[];
    monitoringStats: MonitoringStats;
    filters: {
        assessor_id?: string;
        status?: string;
        assignment_type?: string;
    };
}

export default function AssessorAssignmentsIndex({
    assignments,
    assessors,
    monitoringStats,
    filters,
}: Props) {
    const { data, setData, get } = useForm({
        assessor_id: filters.assessor_id || '',
        status: filters.status || '',
        assignment_type: filters.assignment_type || '',
    });

    const handleFilter = () => {
        get(route('assessor-assignments.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUnassign = (assignmentId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus penugasan ini?')) {
            router.delete(route('assessor-assignments.destroy', assignmentId), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
            in_progress: { label: 'Sedang', className: 'bg-blue-100 text-blue-800' },
            completed: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
            cancelled: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
        };

        const statusInfo = statusMap[status] || statusMap.pending;
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                {statusInfo.label}
            </span>
        );
    };

    const getAccessLevelLabel = (level: string) => {
        const levelMap: Record<string, string> = {
            read_only: 'Read Only',
            read_write: 'Read + Write',
            full_access: 'Full Access',
        };
        return levelMap[level] || level;
    };

    return (
        <>
            <Head title="Penugasan Asesor" />
            <DashboardLayout title="Penugasan Asesor" subtitle="Kelola penugasan asesor untuk fakultas, prodi, dan kriteria">
                <div className="space-y-6">
                    {/* Monitoring Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-600 mb-1">Asesor Aktif</p>
                            <p className="text-2xl font-bold text-gray-900">{monitoringStats.active_assessors}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Penugasan</p>
                            <p className="text-2xl font-bold text-gray-900">{monitoringStats.total_assignments}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-600 mb-1">Selesai</p>
                            <p className="text-2xl font-bold text-green-600">{monitoringStats.completed_assignments}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-600 mb-1">Terlambat</p>
                            <p className="text-2xl font-bold text-red-600">{monitoringStats.overdue_assignments}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asesor</label>
                                <select
                                    value={data.assessor_id}
                                    onChange={(e) => setData('assessor_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua Asesor</option>
                                    {assessors.map((assessor) => (
                                        <option key={assessor.id} value={assessor.id}>
                                            {assessor.name} ({assessor.unit_name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">Sedang</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Penugasan</label>
                                <select
                                    value={data.assignment_type}
                                    onChange={(e) => setData('assignment_type', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua Tipe</option>
                                    <option value="criteria">Kriteria</option>
                                    <option value="unit">Unit</option>
                                    <option value="program">Program</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleFilter}
                                    className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Daftar Penugasan</h2>
                        <Link
                            href={route('assessor-assignments.create')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Assign Asesor
                        </Link>
                    </div>

                    {/* Assignments Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Asesor</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipe</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Target</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Akses</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Deadline</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.data.length > 0 ? (
                                        assignments.data.map((assignment) => (
                                            <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{assignment.assessor.name}</p>
                                                        <p className="text-xs text-gray-500">{assignment.assessor.email}</p>
                                                        <p className="text-xs text-gray-400">{assignment.assessor.unit_name}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-gray-700 capitalize">{assignment.assignment_type}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {assignment.assignment_type === 'criteria' && assignment.criterion && (
                                                        <div>
                                                            <p className="text-sm text-gray-900">{assignment.criterion.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {assignment.criterion.standard?.program?.name || 'N/A'}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {assignment.assignment_type === 'unit' && assignment.unit && (
                                                        <p className="text-sm text-gray-900">{assignment.unit.name}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm text-gray-700">{getAccessLevelLabel(assignment.access_level)}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {assignment.deadline ? (
                                                        <p className="text-sm text-gray-700">{assignment.deadline}</p>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">-</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">{getStatusBadge(assignment.status)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route('assessor-assignments.show', assignment.id)}
                                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                                        >
                                                            Detail
                                                        </Link>
                                                        <Link
                                                            href={route('assessor-assignments.edit', assignment.id)}
                                                            className="text-gray-600 hover:text-gray-700 text-sm"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleUnassign(assignment.id)}
                                                            className="text-red-600 hover:text-red-700 text-sm"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-gray-500">
                                                Belum ada penugasan asesor
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Progress per Assessor */}
                    {monitoringStats.assessors_progress.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Penilaian per Asesor</h3>
                            <div className="space-y-4">
                                {monitoringStats.assessors_progress.map((assessor) => (
                                    <div key={assessor.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900">{assessor.name}</p>
                                                <p className="text-sm text-gray-500">{assessor.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">{assessor.progress}%</p>
                                                <p className="text-xs text-gray-500">
                                                    {assessor.completed} / {assessor.total} selesai
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all"
                                                style={{ width: `${Math.min(assessor.progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}

