import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState } from 'react';

interface Employee {
    id: string;
    name: string;
    nip_nip3k_nik: string | null;
    employment_status: string | null;
    employment_type: string | null;
    gender: string | null;
    unit: {
        id: string;
        name: string;
    } | null;
    study_program: string | null;
    status_keaktifan: string | null;
    primary_role_assignment: {
        role: {
            id: string;
            name: string;
        };
    } | null;
    user: {
        id: string;
        email: string;
    } | null;
}

interface Unit {
    id: string;
    name: string;
    type: string;
}

interface Role {
    id: string;
    name: string;
}

interface StudyProgram {
    value: string;
    label: string;
}

interface Props {
    employees: {
        data: Employee[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
        unit_id?: string;
        study_program?: string;
        role_id?: string;
        status?: string;
    };
    units: Unit[];
    roles: Role[];
    studyPrograms: StudyProgram[];
}

export default function EmployeesIndex({ employees, filters, units, roles, studyPrograms }: Props) {
    const { data, setData, get } = useForm({
        search: filters.search || '',
        unit_id: filters.unit_id || '',
        study_program: filters.study_program || '',
        role_id: filters.role_id || '',
        status: filters.status || '',
    });

    const [showImportModal, setShowImportModal] = useState(false);
    const { data: importData, setData: setImportData, post: importPost, processing: importProcessing } = useForm({
        file: null as File | null,
    });

    const handleFilter = () => {
        get(route('employees.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (employeeId: string, employeeName: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus pegawai "${employeeName}"?`)) {
            router.delete(route('employees.destroy', employeeId), {
                preserveScroll: true,
            });
        }
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        importPost(route('employees.import'), {
            forceFormData: true,
            onSuccess: () => {
                setShowImportModal(false);
                setImportData('file', null);
            },
        });
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) {
            return null;
        }

        const isActive = status.toLowerCase().includes('aktif');
        return (
            <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
            >
                {status}
            </span>
        );
    };

    return (
        <>
            <Head title="Master Data Pegawai" />
            <DashboardLayout title="Master Data Pegawai" subtitle="Kelola data pegawai LPMPP, asesor, dosen, dan tendik">
                <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Daftar Pegawai</h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                </svg>
                                Import CSV
                            </button>
                            <Link
                                href={route('employees.create')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Tambah Pegawai
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                                <input
                                    type="text"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                    placeholder="Nama atau NIP..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                                <select
                                    value={data.unit_id}
                                    onChange={(e) => setData('unit_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua</option>
                                    {units.filter((u) => u.type === 'fakultas').map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prodi</label>
                                <select
                                    value={data.study_program}
                                    onChange={(e) => setData('study_program', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua</option>
                                    {studyPrograms.map((program) => (
                                        <option key={program.value} value={program.value}>
                                            {program.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={data.role_id}
                                    onChange={(e) => setData('role_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
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
                                    <option value="">Semua</option>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={handleFilter}
                                className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Employees Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nama</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">NIP/NIK</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fakultas</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Prodi</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Role</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.data.length > 0 ? (
                                        employees.data.map((employee) => (
                                            <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {employee.employment_type || 'N/A'} - {employee.employment_status || 'N/A'}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-700">{employee.nip_nip3k_nik || '-'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-700">{employee.user?.email || '-'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-700">{employee.unit?.name || '-'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-700">{employee.study_program || '-'}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm text-gray-700">
                                                        {employee.primary_role_assignment?.role?.name || '-'}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4">{getStatusBadge(employee.status_keaktifan)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route('employees.show', employee.id)}
                                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                                        >
                                                            Detail
                                                        </Link>
                                                        <Link
                                                            href={route('employees.edit', employee.id)}
                                                            className="text-gray-600 hover:text-gray-700 text-sm"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(employee.id, employee.name)}
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
                                            <td colSpan={8} className="py-8 text-center text-gray-500">
                                                Belum ada data pegawai
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {employees.links && employees.links.length > 3 && (
                            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {employees.meta.from} sampai {employees.meta.to} dari {employees.meta.total} pegawai
                                </div>
                                <div className="flex gap-2">
                                    {employees.links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm rounded-lg ${
                                                link.active
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Data Pegawai</h3>
                            <form onSubmit={handleImport}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">File CSV/Excel</label>
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={(e) => setImportData('file', e.target.files?.[0] || null)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format: CSV dengan header sesuai template SIMPEG UMRAH
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportData('file', null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={importProcessing || !importData.file}
                                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        {importProcessing ? 'Mengimpor...' : 'Import'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}


