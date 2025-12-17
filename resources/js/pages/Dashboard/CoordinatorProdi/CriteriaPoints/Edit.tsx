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
    order_index?: number;
    rubrics?: { score: number; description: string }[];
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
        order_index: (criteriaPoint.order_index ?? '').toString(),
        rubric_4: criteriaPoint.rubrics?.find(r => r.score === 4)?.description ?? '',
        rubric_3: criteriaPoint.rubrics?.find(r => r.score === 3)?.description ?? '',
        rubric_2: criteriaPoint.rubrics?.find(r => r.score === 2)?.description ?? '',
        rubric_1: criteriaPoint.rubrics?.find(r => r.score === 1)?.description ?? '',
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
                                        {criterion.name} ({criterion.program})
                                    </option>
                                ))}
                            </select>
                            {errors.criteria_id && <p className="mt-1 text-sm text-red-600">{errors.criteria_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Elemen Penilaian LAM <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="Masukkan elemen penilaian LAM"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deskriptor</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm"
                                rows={4}
                                placeholder="Masukkan deskriptor (opsional)"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bobot <span className="text-red-500">*</span>
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

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Urutan</label>
                            <input
                                type="number"
                                value={data.order_index}
                                onChange={(e) => setData('order_index', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm"
                                placeholder="1"
                                min="1"
                            />
                            {errors.order_index && <p className="mt-1 text-sm text-red-600">{errors.order_index}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sangat Baik = 4</label>
                                <textarea
                                    value={data.rubric_4}
                                    onChange={(e) => setData('rubric_4', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                    rows={3}
                                    placeholder="Deskripsi rubrik untuk skor 4"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Baik = 3</label>
                                <textarea
                                    value={data.rubric_3}
                                    onChange={(e) => setData('rubric_3', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                    rows={3}
                                    placeholder="Deskripsi rubrik untuk skor 3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cukup = 2</label>
                                <textarea
                                    value={data.rubric_2}
                                    onChange={(e) => setData('rubric_2', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                    rows={3}
                                    placeholder="Deskripsi rubrik untuk skor 2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kurang = 1</label>
                                <textarea
                                    value={data.rubric_1}
                                    onChange={(e) => setData('rubric_1', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                    rows={3}
                                    placeholder="Deskripsi rubrik untuk skor 1"
                                />
                            </div>
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

