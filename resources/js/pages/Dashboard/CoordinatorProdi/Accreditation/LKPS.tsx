import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Document {
    id: string;
    file_name: string;
    file_type: string | null;
    file_size: number | null;
    category: string | null;
    year: number | null;
    uploaded_by: {
        name: string;
    } | null;
    created_at: string;
}

interface Cycle {
    id: string;
    cycle_name: string;
    lam: {
        id: number;
        name: string;
    };
}

interface Prodi {
    id: string;
    name: string;
    fakultas_name: string;
}

interface Props {
    cycle: Cycle | null;
    documents: Document[];
    prodi: Prodi | null;
}

export default function AccreditationLKPS({ cycle, documents, prodi }: Props) {
    const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
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

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate file before submit
        if (!data.file) {
            alert('File dokumen harus dipilih.');
            return;
        }

        const fileExtension = data.file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['pdf', 'doc', 'docx'];
        
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
            alert('File harus berformat PDF, DOC, atau DOCX.');
            return;
        }

        if (data.file.size > 10 * 1024 * 1024) {
            alert('Ukuran file maksimal 10MB.');
            return;
        }

        post(route('coordinator-prodi.documents.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setActiveTab('list');
                router.reload();
            },
        });
    };

    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleDelete = (documentId: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
            router.delete(route('coordinator-prodi.documents.delete', documentId), {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    // Jika tidak ada cycle, tampilkan pesan error
    if (!cycle) {
        return (
            <>
                <Head title="LKPS - Laporan Kinerja Program Studi" />
                <DashboardLayout
                    title="LKPS - Laporan Kinerja Program Studi"
                    subtitle="Siklus Akreditasi Tidak Ditemukan"
                >
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Siklus Akreditasi</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Belum ada siklus akreditasi yang tersedia. Silakan buat siklus akreditasi terlebih dahulu.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('coordinator-prodi.accreditation.cycles')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Buat Siklus Akreditasi
                                </Link>
                            </div>
                        </div>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    return (
        <>
            <Head title="LKPS - Laporan Kinerja Program Studi" />
            <DashboardLayout
                title="LKPS - Laporan Kinerja Program Studi"
                subtitle={`${cycle.cycle_name} - ${cycle.lam.name}`}
            >
                <div className="space-y-6">
                    {/* Info Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Tentang LKPS</h3>
                        <p className="text-sm text-blue-700">
                            Laporan Kinerja Program Studi (LKPS) adalah dokumen yang berisi data dan informasi 
                            tentang kinerja program studi dalam periode tertentu. LKPS digunakan sebagai 
                            bahan evaluasi dalam proses akreditasi.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab('list')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                                        activeTab === 'list'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Daftar Dokumen
                                </button>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                                        activeTab === 'upload'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Upload Dokumen
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'list' ? (
                                /* Daftar Dokumen */
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama File</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ukuran</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diupload Oleh</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {documents.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                            Belum ada dokumen. Upload dokumen untuk melengkapi LKPS.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    documents.map((doc) => (
                                                        <tr key={doc.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{doc.file_name}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-600">{doc.category || '-'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-600">{doc.year || '-'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-600">
                                                                    {formatFileSize(doc.file_size)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-600">{doc.uploaded_by?.name || '-'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-gray-600">
                                                                    {new Date(doc.created_at).toLocaleDateString('id-ID')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <a
                                                                        href={route('coordinator-prodi.documents.download', doc.id)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                    >
                                                                        Download
                                                                    </a>
                                                                    <button
                                                                        onClick={() => handleDelete(doc.id)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                    >
                                                                        Hapus
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                /* Upload Dokumen */
                                <form onSubmit={handleUploadSubmit} className="space-y-6">
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

                                    {/* Program Studi */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Program Studi <span className="text-red-500">*</span>
                                        </label>
                                        {prodi ? (
                                            <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50">
                                                <div className="font-medium text-gray-900">{prodi.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">Fakultas: {prodi.fakultas_name}</div>
                                            </div>
                                        ) : (
                                            <div className="w-full border border-red-300 rounded-md px-3 py-2 text-sm bg-red-50">
                                                <p className="text-red-600 text-sm">
                                                    Anda belum terhubung dengan Program Studi. Silakan hubungi Admin untuk mengatur Program Studi Anda.
                                                </p>
                                            </div>
                                        )}
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
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveTab('list');
                                                reset();
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Mengupload...' : 'Upload Dokumen'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
