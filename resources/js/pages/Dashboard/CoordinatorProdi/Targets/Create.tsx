import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

interface Program {
    id: string;
    name: string;
}

interface Props {
    programs: Program[];
}

export default function TargetsCreate({ programs }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        program_id: '',
        year: new Date().getFullYear(),
        target_score: 0,
        target_grade: 'baik',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('coordinator-prodi.targets.store'), {
            onSuccess: () => {
                // Redirect will be handled by controller
            },
        });
    };

    return (
        <DashboardLayout title="Set Target Akreditasi" subtitle="Tetapkan target akreditasi untuk program studi">
            <Head title="Set Target Akreditasi" />

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Program */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Program Studi <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.program_id}
                            onChange={(e) => setData('program_id', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                        >
                            <option value="">Pilih Program Studi</option>
                            {programs.map((program) => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))}
                        </select>
                        {errors.program_id && <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>}
                    </div>

                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tahun <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={data.year}
                            onChange={(e) => setData('year', parseInt(e.target.value))}
                            min="2020"
                            max="2030"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                        />
                        {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                    </div>

                    {/* Target Score */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Skor <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={data.target_score}
                            onChange={(e) => setData('target_score', parseFloat(e.target.value))}
                            min="0"
                            max="400"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                        />
                        {errors.target_score && <p className="mt-1 text-sm text-red-600">{errors.target_score}</p>}
                        <p className="mt-1 text-xs text-gray-500">Skor maksimal: 400</p>
                    </div>

                    {/* Target Grade */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Grade <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.target_grade}
                            onChange={(e) => setData('target_grade', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                        >
                            <option value="baik">Baik</option>
                            <option value="sangat_baik">Sangat Baik</option>
                            <option value="unggul">Unggul</option>
                        </select>
                        {errors.target_grade && <p className="mt-1 text-sm text-red-600">{errors.target_grade}</p>}
                    </div>

                    {/* Grade Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Informasi Grade:</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• <strong>Unggul:</strong> Skor ≥ 361 (90.25%)</li>
                            <li>• <strong>Sangat Baik:</strong> Skor ≥ 301 (75.25%)</li>
                            <li>• <strong>Baik:</strong> Skor ≥ 201 (50.25%)</li>
                            <li>• <strong>Kurang:</strong> Skor &lt; 201</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                        <a
                            href={route('coordinator-prodi.targets.index')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Target'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

