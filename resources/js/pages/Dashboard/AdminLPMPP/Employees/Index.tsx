import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Employee {
    id: string;
    name: string;
    nip_nip3k_nik: string | null;
    employment_status: string | null;
    employment_type: string | null;
    unit: {
        id: string;
        name: string;
    } | null;
    homebase_unit: {
        id: string;
        name: string;
    } | null;
}

interface Unit {
    id: string;
    name: string;
}

interface Props {
    employees: {
        data: Employee[];
        links: any[];
        meta: any;
    };
    units: Unit[];
    filters: {
        unit_id?: string;
        employment_status?: string;
        employment_type?: string;
        search?: string;
    };
}

export default function EmployeesIndex({ employees, units, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [unitId, setUnitId] = useState(filters.unit_id || '');
    const [employmentStatus, setEmploymentStatus] = useState(filters.employment_status || '');
    const [employmentType, setEmploymentType] = useState(filters.employment_type || '');

    const handleFilter = () => {
        router.get(route('admin-lpmpp.employees.index'), {
            search: search || undefined,
            unit_id: unitId || undefined,
            employment_status: employmentStatus || undefined,
            employment_type: employmentType || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Master Data Pegawai" />
            <DashboardLayout title="Master Data Pegawai" subtitle="Kelola data pegawai">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Daftar Pegawai</h2>
                        <div className="flex gap-4">
                            <Link
                                href={route('admin-lpmpp.employees.sync')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Sinkronisasi
                            </Link>
                            <Link
                                href={route('admin-lpmpp.employees.create')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Tambah Pegawai
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Cari nama atau NIP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>
                            <div>
                                <select
                                    value={unitId}
                                    onChange={(e) => setUnitId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Semua Unit</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={employmentStatus}
                                    onChange={(e) => setEmploymentStatus(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="pns">PNS</option>
                                    <option value="pppk">PPPK</option>
                                    <option value="kontrak">Kontrak</option>
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

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NIP/NIP3K/NIK
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Unit
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
                                {employees.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada data pegawai
                                        </td>
                                    </tr>
                                ) : (
                                    employees.data.map((employee) => (
                                        <tr key={employee.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {employee.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {employee.nip_nip3k_nik || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {employee.unit?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {employee.employment_status || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={route('admin-lpmpp.employees.show', employee.id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Detail
                                                </Link>
                                                <Link
                                                    href={route('admin-lpmpp.employees.edit', employee.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
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

