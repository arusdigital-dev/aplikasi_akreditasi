import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FormEvent } from 'react';

interface Unit {
    id: string;
    name: string;
    type: string;
}

interface Role {
    id: string;
    name: string;
}

interface Props {
    units: Unit[];
    roles: Role[];
}

export default function EmployeesCreate({ units, roles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nip_nip3k_nik: '',
        email: '',
        employment_status: '',
        employment_type: '',
        gender: '',
        place_of_birth: '',
        date_of_birth: '',
        unit_id: '',
        homebase_unit_id: '',
        study_program: '',
        management_position: '',
        jabatan_struktural: '',
        jabatan_fungsional: '',
        pangkat: '',
        golongan: '',
        tmt_golongan: '',
        tmt_jabatan_fungsional: '',
        kum: '',
        education_level: '',
        status_keaktifan: 'Aktif',
        role_id: '',
        additional_notes: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('employees.store'));
    };

    return (
        <>
            <Head title="Tambah Pegawai" />
            <DashboardLayout title="Tambah Pegawai" subtitle="Tambahkan data pegawai baru">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NIP/NIP3K/NIK</label>
                                    <input
                                        type="text"
                                        value={data.nip_nip3k_nik}
                                        onChange={(e) => setData('nip_nip3k_nik', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                    {errors.nip_nip3k_nik && <p className="mt-1 text-sm text-red-600">{errors.nip_nip3k_nik}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (SSO Gmail)</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                    <select
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">Pilih</option>
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                                    <input
                                        type="text"
                                        value={data.place_of_birth}
                                        onChange={(e) => setData('place_of_birth', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Employment Information */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kepegawaian</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Pegawai</label>
                                    <select
                                        value={data.employment_status}
                                        onChange={(e) => setData('employment_status', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">Pilih</option>
                                        <option value="pns">PNS</option>
                                        <option value="pppk">PPPK</option>
                                        <option value="kontrak">Kontrak</option>
                                        <option value="honorer">Honorer</option>
                                        <option value="cpns">CPNS</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Tenaga</label>
                                    <select
                                        value={data.employment_type}
                                        onChange={(e) => setData('employment_type', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">Pilih</option>
                                        <option value="tenaga_pendidik">Tenaga Pendidik</option>
                                        <option value="tenaga_kependidikan">Tenaga Kependidikan</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                                    <select
                                        value={data.unit_id}
                                        onChange={(e) => setData('unit_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">Pilih Fakultas</option>
                                        {units.filter((u) => u.type === 'fakultas').map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                                    <input
                                        type="text"
                                        value={data.study_program}
                                        onChange={(e) => setData('study_program', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Nama program studi"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={data.status_keaktifan}
                                        onChange={(e) => setData('status_keaktifan', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Tidak Aktif">Tidak Aktif</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Role Assignment */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Sistem</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={data.role_id}
                                        onChange={(e) => setData('role_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">Pilih Role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role_id && <p className="mt-1 text-sm text-red-600">{errors.role_id}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4">
                            <Link
                                href={route('employees.index')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Pegawai'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}


