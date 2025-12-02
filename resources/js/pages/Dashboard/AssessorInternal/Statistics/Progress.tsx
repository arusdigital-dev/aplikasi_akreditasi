import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface UpcomingDeadline {
    id: number;
    criterion: string;
    unit: string;
    program: string;
    deadline: string;
    days_remaining: number;
    is_evaluated: boolean;
}

interface PendingAssignment {
    id: number;
    criterion: string;
    unit: string;
    program: string;
    deadline: string | null;
    assigned_date: string;
}

interface Props {
    total_criteria: number;
    evaluated_criteria: number;
    pending_criteria: number;
    progress_percentage: number;
    status_breakdown: {
        not_started: number;
        in_progress: number;
        completed: number;
    };
    upcoming_deadlines: UpcomingDeadline[];
    pending_assignments: PendingAssignment[];
}

const COLORS = {
    not_started: '#9ca3af', // gray
    in_progress: '#f59e0b', // yellow
    completed: '#10b981', // green
};

export default function StatisticsProgress({
    total_criteria,
    evaluated_criteria,
    pending_criteria,
    progress_percentage,
    status_breakdown,
    upcoming_deadlines,
    pending_assignments,
}: Props) {
    const pieData = [
        { name: 'Belum Dimulai', value: status_breakdown.not_started, color: COLORS.not_started },
        { name: 'Sedang Dinilai', value: status_breakdown.in_progress, color: COLORS.in_progress },
        { name: 'Selesai', value: status_breakdown.completed, color: COLORS.completed },
    ];

    return (
        <DashboardLayout title="Progress Penilaian Individu" subtitle="Overview progress penilaian Anda">
            <Head title="Progress Penilaian Individu" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Total Kriteria</p>
                        <p className="text-2xl font-bold text-gray-900">{total_criteria}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Sudah Dinilai</p>
                        <p className="text-2xl font-bold text-green-600">{evaluated_criteria}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{pending_criteria}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="text-2xl font-bold text-blue-600">{progress_percentage.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress Penilaian</span>
                        <span className="text-sm text-gray-600">
                            {evaluated_criteria} / {total_criteria} kriteria
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6">
                        <div
                            className="bg-blue-600 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                            style={{ width: `${progress_percentage}%` }}
                        >
                            <span className="text-xs font-medium text-white">{progress_percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakdown Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Belum Dimulai</span>
                                <span className="text-sm font-medium text-gray-900">{status_breakdown.not_started}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Sedang Dinilai</span>
                                <span className="text-sm font-medium text-gray-900">{status_breakdown.in_progress}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Selesai</span>
                                <span className="text-sm font-medium text-gray-900">{status_breakdown.completed}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-600">Deadline Terdekat</p>
                                <p className="text-lg font-semibold text-blue-900">
                                    {upcoming_deadlines.length > 0
                                        ? `${upcoming_deadlines[0].days_remaining} hari lagi`
                                        : 'Tidak ada'}
                                </p>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-yellow-600">Penugasan Pending</p>
                                <p className="text-lg font-semibold text-yellow-900">{pending_assignments.length}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-600">Tingkat Penyelesaian</p>
                                <p className="text-lg font-semibold text-green-900">{progress_percentage.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Deadline Terdekat (7 Hari ke Depan)</h3>
                    {upcoming_deadlines.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kriteria</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hari Tersisa</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {upcoming_deadlines.map((deadline) => (
                                        <tr key={deadline.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{deadline.criterion}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{deadline.unit}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{deadline.program}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(deadline.deadline).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span
                                                    className={`font-medium ${
                                                        deadline.days_remaining <= 1
                                                            ? 'text-red-600'
                                                            : deadline.days_remaining <= 3
                                                            ? 'text-yellow-600'
                                                            : 'text-gray-900'
                                                    }`}
                                                >
                                                    {deadline.days_remaining} hari
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {deadline.is_evaluated ? (
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                                        Sudah Dinilai
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                                        Belum Dinilai
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium">
                                                <Link
                                                    href={route('assessor-internal.assignments.evaluate', { assignmentId: deadline.id })}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    {deadline.is_evaluated ? 'Edit' : 'Nilai'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">Tidak ada deadline dalam 7 hari ke depan</p>
                    )}
                </div>

                {/* Pending Assignments */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Penugasan Pending</h3>
                    {pending_assignments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kriteria</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodi</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Penugasan</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pending_assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{assignment.criterion}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{assignment.unit}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{assignment.program}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(assignment.assigned_date).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {assignment.deadline
                                                    ? new Date(assignment.deadline).toLocaleDateString('id-ID', {
                                                          year: 'numeric',
                                                          month: 'long',
                                                          day: 'numeric',
                                                      })
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-medium">
                                                <Link
                                                    href={route('assessor-internal.assignments.evaluate', { assignmentId: assignment.id })}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Mulai Nilai
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">Tidak ada penugasan pending</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

