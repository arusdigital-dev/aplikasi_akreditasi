import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm } from '@inertiajs/react';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Cycle {
    id: string;
    cycle_name: string;
    prodi?: {
        id: string;
        name: string;
        fakultas?: { name: string } | null;
    } | null;
    lam?: { id: string; code: string; name: string } | null;
}

interface UserLite {
    id: string;
    name: string;
    email: string;
}

interface Assignment {
    id: string;
    status: string;
    assigned_date: string | null;
    deadline: string | null;
    notes?: string | null;
    accreditation_cycle?: Cycle | null;
    assessor?: UserLite | null;
    assigned_by?: UserLite | null;
}

interface Props {
    assignments: {
        data: Assignment[];
        links: any[];
        meta: any;
    };
    cycles: Cycle[];
    externalAssessors: UserLite[];
    filters: {
        status?: string;
        cycle_id?: string;
    };
}

export default function AccreditationAssessorAssignmentsIndex({ assignments, cycles, externalAssessors, filters }: Props) {
    const [status, setStatus] = useState(filters.status || '');
    const [cycleFilter, setCycleFilter] = useState(filters.cycle_id || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        accreditation_cycle_id: '',
        assessor_id: '',
        deadline: '',
        notes: '',
    });

    const handleFilter = () => {
        router.get(route('admin-lpmpp.accreditation-assessor-assignments.index'), {
            status: status || undefined,
            cycle_id: cycleFilter || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-lpmpp.accreditation-assessor-assignments.assign'), {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Penugasan Asesor Akreditasi" />
            <DashboardLayout title="Penugasan Asesor Akreditasi" subtitle="Assign asesor eksternal ke siklus akreditasi">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Daftar Penugasan</h2>
                                <div className="flex gap-4">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Diterima</option>
                                        <option value="completed">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                    <select
                                        value={cycleFilter}
                                        onChange={(e) => setCycleFilter(e.target.value)}
                                        className="rounded-md border-gray-300 shadow-sm"
                                    >
                                        <option value="">Semua Siklus</option>
                                        {cycles.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.cycle_name} - {c.prodi?.name || 'N/A'}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleFilter}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Terapkan
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asesor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siklus</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAM</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {assignments.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Tidak ada penugasan</td>
                                            </tr>
                                        ) : (
                                            assignments.data.map((a) => (
                                                <tr key={a.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.assessor?.name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.accreditation_cycle?.cycle_name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.accreditation_cycle?.prodi?.name || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.accreditation_cycle?.lam?.code || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.assigned_date || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            a.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                            a.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.deadline || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assign Asesor Eksternal</h2>
                            <form onSubmit={handleAssign} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Siklus Akreditasi *</label>
                                    <select
                                        value={data.accreditation_cycle_id}
                                        onChange={(e) => setData('accreditation_cycle_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="">Pilih Siklus</option>
                                        {cycles.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.cycle_name} - {c.prodi?.name || 'N/A'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.accreditation_cycle_id && <p className="mt-1 text-sm text-red-600">{errors.accreditation_cycle_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Asesor Eksternal *</label>
                                    <select
                                        value={data.assessor_id}
                                        onChange={(e) => setData('assessor_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="">Pilih Asesor</option>
                                        {externalAssessors.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assessor_id && <p className="mt-1 text-sm text-red-600">{errors.assessor_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Deadline</label>
                                    <input
                                        type="date"
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    />
                                    {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Catatan</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        rows={3}
                                    />
                                    {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Mengassign...' : 'Assign'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

