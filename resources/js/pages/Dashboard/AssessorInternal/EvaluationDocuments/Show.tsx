import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { FormEvent, useState } from 'react';

interface Document {
    id: string;
    file_name: string;
    category: string;
    year: number;
    uploaded_at: string;
    criterion: string;
    unit: string;
    program: string;
    assignment_id: number;
}

interface Criterion {
    id: number;
    name: string;
}

interface EvaluationNote {
    id: number;
    short_assessment: string | null;
    general_notes: string | null;
    specific_notes: Array<{ criteria_id: string; note: string }> | null;
    status: string;
    evaluation_file_name: string | null;
    recommendation_file_name: string | null;
    attachments: Array<{ path: string; name: string; type: string }> | null;
}

interface Props {
    document: Document;
    criteria: Criterion[];
    evaluationNote: EvaluationNote | null;
}

export default function EvaluationDocumentsShow({ document, criteria, evaluationNote }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        assignment_id: document.assignment_id,
        document_id: document.id,
        short_assessment: evaluationNote?.short_assessment || '',
        general_notes: evaluationNote?.general_notes || '',
        specific_notes: evaluationNote?.specific_notes || [],
        status: evaluationNote?.status || 'valid',
        evaluation_file: null as File | null,
        recommendation_file: null as File | null,
        attachments: [] as File[],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (evaluationNote) {
            put(route('assessor-internal.evaluation-notes.update', { id: evaluationNote.id }), {
                forceFormData: true,
                onSuccess: () => {
                    router.visit(route('assessor-internal.evaluation-documents.index'));
                },
            });
        } else {
            post(route('assessor-internal.evaluation-notes.store'), {
                forceFormData: true,
                onSuccess: () => {
                    router.visit(route('assessor-internal.evaluation-documents.index'));
                },
            });
        }
    };

    const addSpecificNote = () => {
        const newNotes = [...(data.specific_notes || []), { criteria_id: '', note: '' }];
        setData('specific_notes', newNotes);
    };

    const removeSpecificNote = (index: number) => {
        const newNotes = (data.specific_notes || []).filter((_, i) => i !== index);
        setData('specific_notes', newNotes);
    };

    const updateSpecificNote = (index: number, field: 'criteria_id' | 'note', value: string) => {
        const newNotes = [...(data.specific_notes || [])];
        newNotes[index] = { ...newNotes[index], [field]: value };
        setData('specific_notes', newNotes);
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setData('attachments', [...(data.attachments || []), ...files]);
        }
    };

    const removeAttachment = (index: number) => {
        const newAttachments = (data.attachments || []).filter((_, i) => i !== index);
        setData('attachments', newAttachments);
    };

    return (
        <DashboardLayout title="Upload Catatan Evaluasi" subtitle={`Evaluasi Dokumen: ${document.file_name}`}>
            <Head title="Upload Catatan Evaluasi" />

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
                        <div>
                            <p className="text-sm text-gray-600">Kategori</p>
                            <p className="text-sm font-medium text-gray-900">{document.category}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tahun</p>
                            <p className="text-sm font-medium text-gray-900">{document.year}</p>
                        </div>
                    </div>
                </div>

                {/* Evaluation Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status Dokumen <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                        >
                            <option value="valid">Valid</option>
                            <option value="invalid">Tidak Valid (butuh revisi)</option>
                            <option value="minor_revision">Perlu Perbaikan Minor</option>
                            <option value="major_revision">Perlu Perbaikan Mayor</option>
                        </select>
                        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                    </div>

                    {/* Short Assessment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Penilaian Singkat</label>
                        <input
                            type="text"
                            value={data.short_assessment}
                            onChange={(e) => setData('short_assessment', e.target.value)}
                            placeholder="Masukkan penilaian singkat..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            maxLength={255}
                        />
                        {errors.short_assessment && <p className="mt-1 text-sm text-red-600">{errors.short_assessment}</p>}
                    </div>

                    {/* General Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Umum</label>
                        <textarea
                            value={data.general_notes}
                            onChange={(e) => setData('general_notes', e.target.value)}
                            placeholder="Masukkan catatan umum..."
                            rows={5}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        {errors.general_notes && <p className="mt-1 text-sm text-red-600">{errors.general_notes}</p>}
                    </div>

                    {/* Specific Notes */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Catatan Khusus untuk Kriteria Tertentu</label>
                            <button
                                type="button"
                                onClick={addSpecificNote}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                + Tambah Catatan
                            </button>
                        </div>
                        {(data.specific_notes || []).map((note, index) => (
                            <div key={index} className="mb-3 p-3 border border-gray-200 rounded-md">
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div>
                                        <select
                                            value={note.criteria_id}
                                            onChange={(e) => updateSpecificNote(index, 'criteria_id', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        >
                                            <option value="">Pilih Kriteria</option>
                                            {criteria.map((criterion) => (
                                                <option key={criterion.id} value={criterion.id.toString()}>
                                                    {criterion.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeSpecificNote(index)}
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={note.note}
                                    onChange={(e) => updateSpecificNote(index, 'note', e.target.value)}
                                    placeholder="Masukkan catatan untuk kriteria ini..."
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                        ))}
                        {errors.specific_notes && <p className="mt-1 text-sm text-red-600">{errors.specific_notes}</p>}
                    </div>

                    {/* Evaluation File (PDF) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            File PDF Catatan Evaluasi
                            {evaluationNote?.evaluation_file_name && (
                                <span className="ml-2 text-xs text-gray-500">
                                    (File saat ini: {evaluationNote.evaluation_file_name})
                                </span>
                            )}
                        </label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setData('evaluation_file', file);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        {data.evaluation_file && (
                            <p className="mt-1 text-sm text-gray-600">File dipilih: {data.evaluation_file.name}</p>
                        )}
                        {errors.evaluation_file && <p className="mt-1 text-sm text-red-600">{errors.evaluation_file}</p>}
                    </div>

                    {/* Recommendation File (Word) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            File Word Rekomendasi
                            {evaluationNote?.recommendation_file_name && (
                                <span className="ml-2 text-xs text-gray-500">
                                    (File saat ini: {evaluationNote.recommendation_file_name})
                                </span>
                            )}
                        </label>
                        <input
                            type="file"
                            accept=".doc,.docx"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setData('recommendation_file', file);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        {data.recommendation_file && (
                            <p className="mt-1 text-sm text-gray-600">File dipilih: {data.recommendation_file.name}</p>
                        )}
                        {errors.recommendation_file && (
                            <p className="mt-1 text-sm text-red-600">{errors.recommendation_file}</p>
                        )}
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lampiran Pendukung</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleAttachmentChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                        {(data.attachments || []).length > 0 && (
                            <div className="mt-2 space-y-1">
                                {(data.attachments || []).map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-700">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {evaluationNote?.attachments && evaluationNote.attachments.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600 mb-1">File lampiran yang sudah ada:</p>
                                {evaluationNote.attachments.map((attachment, index) => (
                                    <div key={index} className="text-sm text-gray-700">
                                        • {attachment.name}
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.attachments && <p className="mt-1 text-sm text-red-600">{errors.attachments}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <Link
                            href={route('assessor-internal.evaluation-documents.index')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : evaluationNote ? 'Perbarui Catatan' : 'Simpan Catatan'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

