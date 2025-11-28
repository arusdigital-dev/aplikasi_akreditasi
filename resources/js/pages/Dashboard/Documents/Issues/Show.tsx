import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Document {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    issue_type: string;
    issue_status: string;
    metadata: any;
    expired_at: string | null;
    rejection_notes: string | null;
    year: number | null;
    category: string | null;
    assignment: {
        criterion: {
            name: string;
            standard: {
                program: {
                    name: string;
                    fakultas: string;
                };
            };
        };
        assessor: {
            name: string;
        } | null;
        unit: {
            name: string;
        } | null;
    };
    program: {
        name: string;
        fakultas: string;
    } | null;
    uploaded_by: {
        name: string;
        email: string;
    } | null;
    rejected_by: {
        name: string;
    } | null;
    validated_by: {
        name: string;
    } | null;
    histories: Array<{
        id: string;
        action: string;
        notes: string | null;
        user: {
            name: string;
        } | null;
        created_at: string;
    }>;
    created_at: string;
}

interface Props {
    document: Document;
}

const issueTypeLabels: Record<string, string> = {
    expired: 'Expired (Masa berlaku habis)',
    wrong_format: 'Salah Format (Bukan PDF atau ukuran berlebih)',
    missing_metadata: 'Metadata Kurang',
    not_validated: 'Belum Validasi Asesor',
    rejected: 'Ditolak dengan Catatan',
};

export default function DocumentsIssuesShow({ document }: Props) {
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const notifyForm = useForm({
        message: '',
    });

    const metadataForm = useForm({
        year: document.year || '',
        category: document.category || '',
        expired_at: document.expired_at || '',
    });

    const resolveForm = useForm({
        notes: '',
    });

    const rejectForm = useForm({
        rejection_notes: '',
    });

    const handleNotify: FormEventHandler = (e) => {
        e.preventDefault();
        notifyForm.post(route('documents.issues.notify', document.id), {
            onSuccess: () => {
                setShowNotifyModal(false);
                notifyForm.reset();
            },
        });
    };

    const handleUpdateMetadata: FormEventHandler = (e) => {
        e.preventDefault();
        metadataForm.put(route('documents.issues.update-metadata', document.id), {
            onSuccess: () => {
                setShowEditModal(false);
            },
        });
    };

    const handleResolve: FormEventHandler = (e) => {
        e.preventDefault();
        resolveForm.post(route('documents.issues.resolve', document.id), {
            onSuccess: () => {
                setShowResolveModal(false);
                resolveForm.reset();
            },
        });
    };

    const handleReject: FormEventHandler = (e) => {
        e.preventDefault();
        rejectForm.post(route('documents.issues.reject', document.id), {
            onSuccess: () => {
                setShowRejectModal(false);
                rejectForm.reset();
            },
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) {
            return bytes + ' B';
        }
        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <>
            <Head title={`Detail Dokumen - ${document.file_name}`} />
            <DashboardLayout
                title="Detail Dokumen Bermasalah"
                subtitle={document.file_name}
            >
                <div className="space-y-6">
                    {/* Back Button */}
                    <Link
                        href={route('documents.issues.index')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Daftar
                    </Link>

                    {/* Document Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{document.file_name}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {document.file_type?.toUpperCase()} • {formatFileSize(document.file_size || 0)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={route('documents.issues.download', document.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                    Download
                                </a>
                                <button
                                    onClick={() => setShowNotifyModal(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Kirim Notifikasi
                                </button>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                                >
                                    Edit Metadata
                                </button>
                                {document.issue_status !== 'resolved' && (
                                    <button
                                        onClick={() => setShowResolveModal(true)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                        Tandai Selesai
                                    </button>
                                )}
                                {document.issue_status !== 'rejected' && (
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Tolak
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Informasi Dokumen</h3>
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="text-sm text-gray-600">Program/Unit</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {document.program?.name || document.assignment.unit?.name || 'N/A'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-600">Fakultas</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {document.program?.fakultas || document.assignment.criterion.standard.program.fakultas}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-600">Kriteria</dt>
                                        <dd className="text-sm font-medium text-gray-900">{document.assignment.criterion.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-600">Asesor</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {document.assignment.assessor?.name || 'Belum ditugaskan'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Status Masalah</h3>
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="text-sm text-gray-600">Jenis Masalah</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {issueTypeLabels[document.issue_type] || document.issue_type}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-600">Status</dt>
                                        <dd>
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    document.issue_status === 'resolved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : document.issue_status === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {document.issue_status}
                                            </span>
                                        </dd>
                                    </div>
                                    {document.expired_at && (
                                        <div>
                                            <dt className="text-sm text-gray-600">Tanggal Kadaluarsa</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {new Date(document.expired_at).toLocaleDateString('id-ID')}
                                            </dd>
                                        </div>
                                    )}
                                    {document.rejection_notes && (
                                        <div>
                                            <dt className="text-sm text-gray-600">Catatan Penolakan</dt>
                                            <dd className="text-sm font-medium text-gray-900">{document.rejection_notes}</dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm text-gray-600">Diupload oleh</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {document.uploaded_by?.name || 'N/A'} ({document.uploaded_by?.email || 'N/A'})
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-gray-600">Tanggal Upload</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {new Date(document.created_at).toLocaleString('id-ID')}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    {(document.year || document.category || document.metadata) && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {document.year && (
                                    <div>
                                        <dt className="text-sm text-gray-600">Tahun</dt>
                                        <dd className="text-sm font-medium text-gray-900">{document.year}</dd>
                                    </div>
                                )}
                                {document.category && (
                                    <div>
                                        <dt className="text-sm text-gray-600">Kategori</dt>
                                        <dd className="text-sm font-medium text-gray-900">{document.category}</dd>
                                    </div>
                                )}
                                {document.metadata && (
                                    <div>
                                        <dt className="text-sm text-gray-600">Metadata Tambahan</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            <pre className="text-xs">{JSON.stringify(document.metadata, null, 2)}</pre>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}

                    {/* History Log */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Riwayat Dokumen</h3>
                        <div className="space-y-4">
                            {document.histories.map((history) => (
                                <div key={history.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{history.action}</p>
                                            <p className="text-sm text-gray-600">{history.notes}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-900">{history.user?.name || 'System'}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(history.created_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {document.histories.length === 0 && (
                                <p className="text-sm text-gray-500">Belum ada riwayat</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notify Modal */}
                {showNotifyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kirim Notifikasi</h3>
                            <form onSubmit={handleNotify} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pesan</label>
                                    <textarea
                                        value={notifyForm.data.message}
                                        onChange={(e) => notifyForm.setData('message', e.target.value)}
                                        rows={4}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="Pesan notifikasi (opsional)"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowNotifyModal(false)}
                                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={notifyForm.processing}
                                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {notifyForm.processing ? 'Mengirim...' : 'Kirim'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Metadata Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Metadata</h3>
                            <form onSubmit={handleUpdateMetadata} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                                    <input
                                        type="number"
                                        value={metadataForm.data.year}
                                        onChange={(e) => metadataForm.setData('year', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="2025"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                    <input
                                        type="text"
                                        value={metadataForm.data.category}
                                        onChange={(e) => metadataForm.setData('category', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="Kategori dokumen"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Kadaluarsa</label>
                                    <input
                                        type="date"
                                        value={metadataForm.data.expired_at}
                                        onChange={(e) => metadataForm.setData('expired_at', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={metadataForm.processing}
                                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {metadataForm.processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Resolve Modal */}
                {showResolveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tandai Sebagai Selesai</h3>
                            <form onSubmit={handleResolve} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                                    <textarea
                                        value={resolveForm.data.notes}
                                        onChange={(e) => resolveForm.setData('notes', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="Catatan (opsional)"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowResolveModal(false)}
                                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={resolveForm.processing}
                                        className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {resolveForm.processing ? 'Menyimpan...' : 'Tandai Selesai'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tolak Dokumen</h3>
                            <form onSubmit={handleReject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Penolakan *</label>
                                    <textarea
                                        value={rejectForm.data.rejection_notes}
                                        onChange={(e) => rejectForm.setData('rejection_notes', e.target.value)}
                                        rows={4}
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="Masukkan alasan penolakan"
                                    />
                                    {rejectForm.errors.rejection_notes && (
                                        <p className="mt-1 text-sm text-red-600">{rejectForm.errors.rejection_notes}</p>
                                    )}
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(false)}
                                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={rejectForm.processing}
                                        className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {rejectForm.processing ? 'Menolak...' : 'Tolak'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}

