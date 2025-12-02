import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Assignment {
    id: number;
    unit: string;
    criterion: string;
    program: string;
    weight: number;
    status: 'not_started' | 'in_progress' | 'completed';
    deadline: string | null;
    assigned_date: string;
    is_locked: boolean;
    locked_at: string | null;
    locked_by: string | null;
}

interface Props {
    assignments: {
        data: Assignment[];
        links: any;
        meta: any;
    };
    units: Array<{ id: string; name: string }>;
    programs: Array<{ id: number; name: string }>;
    stats: {
        total: number;
        not_started: number;
        in_progress: number;
        completed: number;
    };
    filters: {
        status?: string;
        unit_id?: string;
        program_id?: number;
    };
}

export default function AssignmentsIndex({ assignments, units, programs, stats, filters }: Props) {
    const [status, setStatus] = useState(filters.status || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [programId, setProgramId] = useState(filters.program_id?.toString() || '');

    const handleFilter = () => {
        router.get(route('assessor-internal.assignments.index'), {
            status: status || undefined,
            unit_id: unitId || undefined,
            program_id: programId || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (assignment: Assignment) => {
        if (assignment.is_locked) {
            return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Dikunci</span>;
        }

        switch (assignment.status) {
            case 'completed':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Selesai</span>;
            case 'in_progress':
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Sedang dinilai</span>;
            case 'not_started':
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Belum dinilai</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Unknown</span>;
        }
    };

    const isDeadlinePassed = (deadline: string | null): boolean => {
        if (! deadline) {
            return false;
        }
        return new Date(deadline) < new Date();
    };

    return (
        <DashboardLayout title="Poin Penilaian" subtitle="Daftar Penugasan Penilaian">
            <Head title="Poin Penilaian - Daftar Penugasan" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Total Penugasan</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Belum dinilai</p>
                        <p className="text-2xl font-bold text-gray-600">{stats.not_started}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Sedang dinilai</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Selesai</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                <option value="not_started">Belum dinilai</option>
                                <option value="in_progress">Sedang dinilai</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit/Prodi</label>
                            <select
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                            <select
                                value={programId}
                                onChange={(e) => setProgramId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">Semua</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Assignments Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Daftar Penugasan Penilaian</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prodi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kriteria
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Program
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bobot Poin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignments.data.length > 0 ? (
                                    assignments.data.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{assignment.unit}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{assignment.criterion}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{assignment.program}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{assignment.weight}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(assignment)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {assignment.deadline ? (
                                                    <div className="text-sm">
                                                        <div className={`${isDeadlinePassed(assignment.deadline) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                                            {new Date(assignment.deadline).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </div>
                                                        {isDeadlinePassed(assignment.deadline) && (
                                                            <div className="text-xs text-red-500">Terlambat</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400">-</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('assessor-internal.assignments.evaluate', { assignmentId: assignment.id })}
                                                    className={`${
                                                        assignment.is_locked
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-blue-600 hover:text-blue-900'
                                                    }`}
                                                >
                                                    {assignment.is_locked ? 'Dikunci' : assignment.status === 'not_started' ? 'Mulai Nilai' : 'Edit Nilai'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Tidak ada penugasan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {assignments.links && assignments.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Menampilkan {assignments.meta.from} sampai {assignments.meta.to} dari {assignments.meta.total} penugasan
                            </div>
                            <div className="flex gap-2">
                                {assignments.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-md ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

