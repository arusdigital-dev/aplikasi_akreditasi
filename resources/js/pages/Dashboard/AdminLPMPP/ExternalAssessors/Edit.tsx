import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm, Link } from '@inertiajs/react';
import { route } from '@/lib/route';

interface Assessor {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
}

interface Props {
    assessor: Assessor;
}

export default function EditExternalAssessor({ assessor }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: assessor.name,
        email: assessor.email,
        is_active: assessor.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin-lpmpp.external-assessors.update', assessor.id));
    };

    const handleDeactivate = () => {
        if (!confirm('Nonaktifkan asesor ini?')) return;
        router.delete(route('admin-lpmpp.external-assessors.destroy', assessor.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Edit Asesor Eksternal" />
            <DashboardLayout title="Edit Asesor Eksternal" subtitle="Perbarui akun asesor eksternal">
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
                            <label className="block text-sm font-medium text-gray-700">Email *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <label htmlFor="is_active" className="text-sm text-gray-700">
                                Aktif
                            </label>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleDeactivate}
                                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                            >
                                Nonaktifkan
                            </button>
                            <div className="flex gap-4">
                                <Link
                                    href={route('admin-lpmpp.external-assessors.index')}
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
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}

