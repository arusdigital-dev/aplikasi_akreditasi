import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm, Link } from '@inertiajs/react';
import { route } from '@/lib/route';

interface Employee {
    id: string;
    name: string;
    nip_nip3k_nik: string | null;
    employment_status: string | null;
    employment_type: string | null;
    unit_id: string | null;
    homebase_unit_id: string | null;
    study_program: string | null;
    jabatan_fungsional: string | null;
}

interface Unit {
    id: string;
    name: string;
}

interface Props {
    employee: Employee;
    units: Unit[];
}

export default function EditEmployee({ employee, units }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: employee.name,
        nip_nip3k_nik: employee.nip_nip3k_nik || '',
        employment_status: employee.employment_status || '',
        employment_type: employee.employment_type || '',
        unit_id: employee.unit_id || '',
        homebase_unit_id: employee.homebase_unit_id || '',
        study_program: employee.study_program || '',
        jabatan_fungsional: employee.jabatan_fungsional || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin-lpmpp.employees.update', employee.id));
    };

    return (
        <>
            <Head title={`Edit Pegawai - ${employee.name}`} />
            <DashboardLayout title="Edit Pegawai" subtitle={employee.name}>
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">NIP/NIP3K/NIK</label>
                            <input
                                type="text"
                                value={data.nip_nip3k_nik}
                                onChange={(e) => setData('nip_nip3k_nik', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <select
                                value={data.unit_id}
                                onChange={(e) => setData('unit_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                                <option value="">Pilih Unit</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link
                                href={route('admin-lpmpp.employees.index')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </Link>
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

