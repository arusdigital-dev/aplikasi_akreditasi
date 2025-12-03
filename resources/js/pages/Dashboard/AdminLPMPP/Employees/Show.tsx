import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

interface Employee {
    id: string;
    name: string;
    nip_nip3k_nik: string | null;
    employment_status: string | null;
    employment_type: string | null;
    gender: string | null;
    place_of_birth: string | null;
    date_of_birth: string | null;
    unit: {
        id: string;
        name: string;
    } | null;
    homebase_unit: {
        id: string;
        name: string;
    } | null;
    study_program: string | null;
    management_position: string | null;
    jabatan_struktural: string | null;
    jabatan_fungsional: string | null;
    pangkat: string | null;
    golongan: string | null;
    education_level: string | null;
}

interface Props {
    employee: Employee;
}

export default function ShowEmployee({ employee }: Props) {
    return (
        <>
            <Head title={`Detail Pegawai - ${employee.name}`} />
            <DashboardLayout title={`Detail Pegawai`} subtitle={employee.name}>
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Informasi Pegawai</h2>
                            <Link
                                href={route('admin-lpmpp.employees.edit', employee.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Edit
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama</label>
                                <p className="mt-1 text-sm text-gray-900">{employee.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIP/NIP3K/NIK</label>
                                <p className="mt-1 text-sm text-gray-900">{employee.nip_nip3k_nik || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Kepegawaian</label>
                                <p className="mt-1 text-sm text-gray-900">{employee.employment_status || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jenis Kepegawaian</label>
                                <p className="mt-1 text-sm text-gray-900">{employee.employment_type || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Unit</label>
                                <p className="mt-1 text-sm text-gray-900">{employee.unit?.name || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Homebase Unit</label>
                                <p className="mt-1 text-sm text-gray-900">{employee.homebase_unit?.name || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Program Studi</label>
                                <p className="mt-1 text-sm text-gray-900">{employee.study_program || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jabatan Fungsional</label>
                                <p className="mt-1 text-sm text-gray-900">{employee.jabatan_fungsional || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link
                            href={route('admin-lpmpp.employees.index')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Kembali
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

