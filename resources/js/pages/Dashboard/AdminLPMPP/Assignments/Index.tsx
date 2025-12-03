import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Link } from '@inertiajs/react';
import { route } from '@/lib/route';

interface Assignment {
    id: string;
    criteria_name: string;
    program_name: string;
    fakultas_name: string;
    prodi_name: string;
    assessor_name: string;
    status: string;
    assigned_date: string;
    deadline: string;
}

interface Props {
    assignments: {
        data: Assignment[];
        links: any[];
        meta: any;
    };
    filters: {
        criteria_id?: string;
        unit_id?: string;
        assessor_id?: string;
        status?: string;
    };
}

export default function AssignmentsIndex({ assignments, filters }: Props) {
    return (
        <>
            <Head title="Penugasan Asesor" />
            <DashboardLayout title="Penugasan Asesor" subtitle="Kelola penugasan asesor untuk evaluasi akreditasi">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Daftar Penugasan</h2>
                        <Link
                            href={route('admin-lpmpp.assignments.create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Buat Penugasan Baru
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kriteria
                                    </th>
                                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Program
                                    </th>
                                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fakultas
                                    </th>
                                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prodi
                                    </th>
                                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Asesor
                                    </th>
                                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assignments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-2 py-1.5 text-center text-xs text-gray-500">
                                            Tidak ada penugasan
                                        </td>
                                    </tr>
                                ) : (
                                    assignments.data.map((assignment) => (
                                        <tr key={assignment.id}>
                                            <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-900">
                                                {assignment.criteria_name}
                                            </td>
                                            <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                                                {assignment.program_name}
                                            </td>
                                            <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                                                {assignment.fakultas_name}
                                            </td>
                                            <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                                                {assignment.prodi_name}
                                            </td>
                                            <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-500">
                                                {assignment.assessor_name || '-'}
                                            </td>
                                            <td className="px-2 py-1.5 whitespace-nowrap">
                                                <span
                                                    className={`px-1 py-0.5 inline-flex text-xs leading-3 font-semibold rounded-full ${
                                                        assignment.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : assignment.status === 'in_progress'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {assignment.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-1.5 whitespace-nowrap text-xs font-medium">
                                                <Link
                                                    href={route('admin-lpmpp.assignments.edit', assignment.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
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

