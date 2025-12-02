import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

interface Document {
    id: string;
    file_name: string;
    category: string;
    year: number;
    criterion: string;
    unit: string;
    program: string;
}

interface EvaluationNote {
    id: number;
    status: string;
    short_assessment: string | null;
    general_notes: string | null;
    prodi_comment: string | null;
    prodi_comment_by: { name: string; email: string } | null;
    prodi_comment_at: string | null;
    created_at: string;
    updated_at: string;
}

interface History {
    id: number;
    action: string;
    action_label: string;
    version: string | null;
    notes: string | null;
    changes: Record<string, any> | null;
    user: { id: string; name: string; email: string } | null;
    created_at: string;
    created_at_human: string;
}

interface Props {
    document: Document;
    evaluationNote: EvaluationNote;
    histories: History[];
}

export default function EvaluationDocumentsHistory({ document, evaluationNote, histories }: Props) {
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            valid: { label: 'Valid', className: 'bg-green-100 text-green-800' },
            invalid: { label: 'Tidak Valid', className: 'bg-red-100 text-red-800' },
            minor_revision: { label: 'Perlu Perbaikan Minor', className: 'bg-yellow-100 text-yellow-800' },
            major_revision: { label: 'Perlu Perbaikan Mayor', className: 'bg-orange-100 text-orange-800' },
        };

        const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.className}`}>
                {statusInfo.label}
            </span>
        );
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created':
                return (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                );
            case 'updated':
            case 'status_changed':
                return (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                );
            case 'file_uploaded':
                return (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                );
            case 'commented':
                return (
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const renderChanges = (changes: Record<string, any> | null) => {
        if (! changes || Object.keys(changes).length === 0) {
            return null;
        }

        return (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium text-gray-700 mb-2">Perubahan:</p>
                <div className="space-y-1">
                    {Object.entries(changes).map(([key, value]) => (
                        <div key={key} className="text-xs text-gray-600">
                            <span className="font-medium">{key.replace('_', ' ')}:</span>
                            {typeof value === 'object' && value !== null && 'old' in value && 'new' in value ? (
                                <div className="ml-2 mt-1">
                                    <div className="text-red-600">- {String(value.old || 'N/A')}</div>
                                    <div className="text-green-600">+ {String(value.new || 'N/A')}</div>
                                </div>
                            ) : (
                                <span className="ml-1">{String(value)}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout title="Riwayat Evaluasi" subtitle={`Riwayat evaluasi untuk: ${document.file_name}`}>
            <Head title="Riwayat Evaluasi" />

            <div className="space-y-6">
                {/* Document Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dokumen</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Nama Dokumen</p>
                            <p className="text-sm font-medium text-gray-900">{document.file_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Kriteria</p>
                            <p className="text-sm font-medium text-gray-900">{document.criterion}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Prodi/Fakultas</p>
                            <p className="text-sm font-medium text-gray-900">{document.unit}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Program</p>
                            <p className="text-sm font-medium text-gray-900">{document.program}</p>
                        </div>
                    </div>
                </div>

                {/* Current Evaluation Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluasi Saat Ini</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            {getStatusBadge(evaluationNote.status)}
                        </div>
                        {evaluationNote.short_assessment && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Penilaian Singkat</p>
                                <p className="text-sm text-gray-900">{evaluationNote.short_assessment}</p>
                            </div>
                        )}
                        {evaluationNote.general_notes && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Catatan Umum</p>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{evaluationNote.general_notes}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Dibuat</p>
                                <p className="text-gray-900">{evaluationNote.created_at}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Diperbarui</p>
                                <p className="text-gray-900">{evaluationNote.updated_at}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prodi Comment */}
                {evaluationNote.prodi_comment && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Komentar Prodi</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-blue-900 whitespace-pre-wrap">{evaluationNote.prodi_comment}</p>
                            {evaluationNote.prodi_comment_by && (
                                <div className="text-xs text-blue-700">
                                    <span className="font-medium">Oleh:</span> {evaluationNote.prodi_comment_by.name} ({evaluationNote.prodi_comment_by.email})
                                    {evaluationNote.prodi_comment_at && (
                                        <span className="ml-2">
                                            • {new Date(evaluationNote.prodi_comment_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* History Timeline */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Perubahan</h3>
                    {histories.length > 0 ? (
                        <div className="space-y-4">
                            {histories.map((history, index) => (
                                <div key={history.id} className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                                    <div className="absolute -left-3 top-0">
                                        <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                                            {getActionIcon(history.action)}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{history.action_label}</p>
                                                {history.version && (
                                                    <span className="text-xs text-gray-500 ml-2">({history.version})</span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">{history.created_at}</p>
                                                <p className="text-xs text-gray-400">{history.created_at_human}</p>
                                            </div>
                                        </div>
                                        {history.user && (
                                            <p className="text-xs text-gray-600 mb-2">
                                                Oleh: <span className="font-medium">{history.user.name}</span> ({history.user.email})
                                            </p>
                                        )}
                                        {history.notes && (
                                            <p className="text-sm text-gray-700 mb-2">{history.notes}</p>
                                        )}
                                        {renderChanges(history.changes)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">Tidak ada riwayat perubahan</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href={route('assessor-internal.evaluation-documents.index')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Kembali ke Daftar
                    </Link>
                    <Link
                        href={route('assessor-internal.evaluation-documents.evaluate', { documentId: document.id })}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Edit Evaluasi
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}

