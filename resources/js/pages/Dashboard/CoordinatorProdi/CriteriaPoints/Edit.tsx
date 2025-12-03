import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Criterion {
    id: number;
    name: string;
    standard: string;
    program: string;
}

interface CriteriaPoint {
    id: number;
    criteria_id: number;
    title: string;
    description: string | null;
    max_score: number;
    criterion: {
        name: string;
        standard: string;
        program: string;
    };
}

interface Props {
    criteriaPoint: CriteriaPoint;
    criteria: Criterion[];
}

export default function EditCriteriaPoint({ criteriaPoint, criteria }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        criteria_id: criteriaPoint.criteria_id.toString(),
        title: criteriaPoint.title,
        description: criteriaPoint.description || '',
        max_score: criteriaPoint.max_score.toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/coordinator-prodi/criteria-points/${criteriaPoint.id}`);
    };

    return (
        <>
            <Head title="Edit Poin Kriteria" />
            <DashboardLayout title="Edit Poin Kriteria" subtitle={`Edit poin kriteria: ${criteriaPoint.title}`}>
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kriteria <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.criteria_id}
                                onChange={(e) => setData('criteria_id', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Kriteria</option>
                                {criteria.map((criterion) => (
                                    <option key={criterion.id} value={criterion.id}>
                                        {criterion.name} - {criterion.standard} ({criterion.program})
                                    </option>
                                ))}
                            </select>
                            {errors.criteria_id && <p className="mt-1 text-sm text-red-600">{errors.criteria_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Judul Poin Kriteria <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Masukkan judul poin kriteria"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm"
                                rows={4}
                                placeholder="Masukkan deskripsi poin kriteria (opsional)"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nilai Maksimal <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.max_score}
                                onChange={(e) => setData('max_score', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                            {errors.max_score && <p className="mt-1 text-sm text-red-600">{errors.max_score}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Link
                                href="/coordinator-prodi/criteria-points"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}

