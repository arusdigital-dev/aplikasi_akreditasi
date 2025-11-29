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

export default function DocumentsCreate({ programs }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
        program_id: '',
        category: '',
        year: new Date().getFullYear(),
        metadata: {
            fakultas: '',
            prodi: '',
            dosen: '',
            tendik: '',
            description: '',
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('coordinator-prodi.documents.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <DashboardLayout title="Upload Dokumen" subtitle="Upload dokumen akreditasi dengan metadata lengkap">
            <Head title="Upload Dokumen" />

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            File Dokumen <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setData('file', file);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                        />
                        {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                        <p className="mt-1 text-xs text-gray-500">Format: PDF, DOC, DOCX. Maksimal 10MB</p>
                    </div>

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

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            placeholder="Contoh: Dokumen Visi Misi, Dokumen Kurikulum, dll"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                        />
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
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

                    {/* Metadata */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata Tambahan (Opsional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fakultas</label>
                                <input
                                    type="text"
                                    value={data.metadata.fakultas}
                                    onChange={(e) => setData('metadata', { ...data.metadata, fakultas: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prodi</label>
                                <input
                                    type="text"
                                    value={data.metadata.prodi}
                                    onChange={(e) => setData('metadata', { ...data.metadata, prodi: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dosen Terkait</label>
                                <input
                                    type="text"
                                    value={data.metadata.dosen}
                                    onChange={(e) => setData('metadata', { ...data.metadata, dosen: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tendik Terkait</label>
                                <input
                                    type="text"
                                    value={data.metadata.tendik}
                                    onChange={(e) => setData('metadata', { ...data.metadata, tendik: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                            <textarea
                                value={data.metadata.description}
                                onChange={(e) => setData('metadata', { ...data.metadata, description: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                        <a
                            href={route('coordinator-prodi.documents.index')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Mengupload...' : 'Upload Dokumen'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

