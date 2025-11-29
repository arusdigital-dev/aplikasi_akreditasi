import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useForm } from '@inertiajs/react';

interface Program {
    id: string;
    name: string;
}

interface Target {
    id: string;
    program_id: string;
    program_name: string;
    year: number;
    target_score: number;
    target_grade: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    targets: Target[];
    programs: Program[];
}

export default function TargetsIndex({ targets, programs }: Props) {
    const { delete: deleteTarget } = useForm({});

    const handleDelete = (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus target ini?')) {
            deleteTarget(route('coordinator-prodi.targets.delete', { id }), {
                preserveScroll: true,
            });
        }
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'unggul':
                return 'bg-green-100 text-green-800';
            case 'sangat_baik':
                return 'bg-blue-100 text-blue-800';
            case 'baik':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatGrade = (grade: string) => {
        return grade.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <DashboardLayout title="Target Akreditasi" subtitle="Kelola target akreditasi program studi">
            <Head title="Target Akreditasi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Target Akreditasi</h2>
                        <p className="text-sm text-gray-500 mt-1">Set dan kelola target akreditasi untuk program studi</p>
                    </div>
                    <Link
                        href={route('coordinator-prodi.targets.create')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                        + Set Target Baru
                    </Link>
                </div>

                {/* Targets List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Program Studi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tahun
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Target Skor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Target Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dibuat
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {targets.length > 0 ? (
                                targets.map((target) => (
                                    <tr key={target.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{target.program_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{target.year}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{target.target_score}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getGradeColor(target.target_grade)}`}>
                                                {formatGrade(target.target_grade)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(target.created_at).toLocaleDateString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(target.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Belum ada target yang ditetapkan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}

