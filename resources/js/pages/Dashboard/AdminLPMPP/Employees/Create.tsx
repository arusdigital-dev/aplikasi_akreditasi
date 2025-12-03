import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm, Link } from '@inertiajs/react';
import { route } from '@/lib/route';

interface Unit {
    id: string;
    name: string;
}

interface Props {
    units: Unit[];
}

export default function CreateEmployee({ units }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nip_nip3k_nik: '',
        employment_status: '',
        employment_type: '',
        gender: '',
        place_of_birth: '',
        date_of_birth: '',
        unit_id: '',
        homebase_unit_id: '',
        study_program: '',
        jabatan_fungsional: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-lpmpp.employees.store'));
    };

    return (
        <>
            <Head title="Tambah Pegawai" />
            <DashboardLayout title="Tambah Pegawai" subtitle="Tambah data pegawai baru">
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
                            {errors.nip_nip3k_nik && <p className="mt-1 text-sm text-red-600">{errors.nip_nip3k_nik}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status Kepegawaian</label>
                                <select
                                    value={data.employment_status}
                                    onChange={(e) => setData('employment_status', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Pilih Status</option>
                                    <option value="pns">PNS</option>
                                    <option value="pppk">PPPK</option>
                                    <option value="kontrak">Kontrak</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Jenis Kepegawaian</label>
                                <select
                                    value={data.employment_type}
                                    onChange={(e) => setData('employment_type', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Pilih Jenis</option>
                                    <option value="tenaga_pendidik">Tenaga Pendidik</option>
                                    <option value="tenaga_kependidikan">Tenaga Kependidikan</option>
                                </select>
                            </div>
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
                            {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
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

