import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm } from '@inertiajs/react';
import { route } from '@/lib/route';

interface Assignment {
    id: string;
    criteria_id: string;
    unit_id: string;
    assessor_id?: string;
    assigned_date: string;
    deadline: string;
    access_level: string;
    status: string;
    notes?: string;
}

interface Criterion {
    id: string;
    name: string;
}

interface Unit {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

interface Props {
    assignment: Assignment;
    criteria: Criterion[];
    units: Unit[];
    assessors: User[];
}

export default function EditAssignment({ assignment, criteria, units, assessors }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        criteria_id: assignment.criteria_id,
        unit_id: assignment.unit_id,
        assessor_id: assignment.assessor_id || '',
        assigned_date: assignment.assigned_date,
        deadline: assignment.deadline,
        access_level: assignment.access_level,
        status: assignment.status,
        notes: assignment.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin-lpmpp.assignments.update', assignment.id));
    };

    return (
        <>
            <Head title="Edit Penugasan Asesor" />
            <DashboardLayout title="Edit Penugasan Asesor" subtitle="Edit penugasan asesor">
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
                        {/* Similar form fields as Create, but with existing data */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <div className="flex justify-end gap-4">
                            <a
                                href={route('admin-lpmpp.assignments.index')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}

