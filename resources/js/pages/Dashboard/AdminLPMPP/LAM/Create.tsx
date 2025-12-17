import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

type Defaults = {
    min_score_scale: number;
    max_score_scale: number;
    is_active: boolean;
    accreditation_levels: string[];
};

type Props = {
    defaults: Defaults;
};

export default function AdminLPMPPLAMCreate({ defaults }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        min_score_scale: String(defaults?.min_score_scale ?? 1),
        max_score_scale: String(defaults?.max_score_scale ?? 4),
        is_active: defaults?.is_active ?? true,
        accreditation_levels: (defaults?.accreditation_levels ?? []).join(','),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-lpmpp.lam.store'));
    };

    return (
        <>
            <Head title="Tambah LAM" />
            <DashboardLayout title="Tambah LAM" subtitle="Buat LAM baru untuk menyusun standar, elemen, indikator, dan rubrik">
                <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                                    placeholder="Misal: LAM INFOKOM"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kode</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                                    placeholder="Misal: LAM_INFOKOM"
                                    required
                                />
                                {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                                rows={3}
                            />
                            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Skala Minimal</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={data.min_score_scale}
                                    onChange={(e) => setData('min_score_scale', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                                    required
                                />
                                {errors.min_score_scale && <p className="mt-1 text-xs text-red-600">{errors.min_score_scale}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Skala Maksimal</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={data.max_score_scale}
                                    onChange={(e) => setData('max_score_scale', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                                    required
                                />
                                {errors.max_score_scale && <p className="mt-1 text-xs text-red-600">{errors.max_score_scale}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active as boolean}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">Aktif</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Level Akreditasi (opsional)</label>
                            <input
                                type="text"
                                value={data.accreditation_levels as string}
                                onChange={(e) => setData('accreditation_levels', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                                placeholder="Unggul,Baik Sekali,Baik,Tidak Terakreditasi"
                            />
                            {errors.accreditation_levels && <p className="mt-1 text-xs text-red-600">{errors.accreditation_levels}</p>}
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <Link
                                href={route('admin-lpmpp.lam.index')}
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

