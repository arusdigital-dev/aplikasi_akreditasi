import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Assignment {
    id: string;
    cycle: {
        id?: string;
        name?: string;
        prodi?: string;
        fakultas?: string;
        lam?: string;
    };
    assigned_date?: string | null;
    deadline?: string | null;
    status: string;
}

interface Props {
    assignments: {
        data: Assignment[];
        links: any[];
        meta: any;
    };
    filters: {
        status?: string;
    };
}

export default function AccreditationAssignmentsIndex({ assignments, filters }: Props) {
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get(route('assessor-internal.accreditation-assignments.index'), {
            status: status || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Penugasan Akreditasi (LAM)" />
            <DashboardLayout title="Penugasan Akreditasi (LAM)" subtitle="Daftar penugasan asesor untuk siklus akreditasi">
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="in_progress">Sedang Berjalan</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                            <div>
                                <button
                                    onClick={handleFilter}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Siklus Akreditasi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prodi / Fakultas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        LAM
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal / Deadline
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada penugasan akreditasi
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.data.map((a) => (
                                        <tr key={a.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {a.cycle?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {a.cycle?.prodi || '-'}{a.cycle?.fakultas ? ` / ${a.cycle.fakultas}` : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {a.cycle?.lam || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {a.assigned_date || '-'}{a.deadline ? ` / ${a.deadline}` : ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    a.status === 'completed' ? 'bg-green-100 text-green-800'
                                                    : a.status === 'in_progress' ? 'bg-blue-100 text-blue-800'
                                                    : a.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    href={route('assessor-internal.accreditation-assignments.evaluate', { assignmentId: a.id })}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Input Skor
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
