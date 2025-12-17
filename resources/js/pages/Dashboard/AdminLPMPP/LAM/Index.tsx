import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

type LAMItem = {
    id: number | string;
    name: string;
    code: string;
    description?: string | null;
    is_active: boolean;
};

type Props = {
    lams: LAMItem[];
};

export default function AdminLPMPPLAMIndex({ lams }: Props) {
    return (
        <>
            <Head title="Kelola LAM" />
            <DashboardLayout title="Kelola LAM" subtitle="Menyusun skema LAM: standar, elemen, indikator, rubrik">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Daftar LAM</h2>
                        <Link
                            href={route('admin-lpmpp.lam.create')}
                            className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Tambah LAM
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-600">
                                    <th className="px-4 py-2">Nama</th>
                                    <th className="px-4 py-2">Kode</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lams.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    lams.map((lam) => (
                                        <tr key={lam.id} className="border-t">
                                            <td className="px-4 py-2">
                                                <div className="font-medium text-gray-900">{lam.name}</div>
                                                <div className="text-xs text-gray-500">{lam.description ?? '-'}</div>
                                            </td>
                                            <td className="px-4 py-2">{lam.code}</td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                                                        lam.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {lam.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <Link
                                                    href={route('admin-lpmpp.lam.edit', lam.id)}
                                                    className="px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700"
                                                >
                                                    Kelola
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
