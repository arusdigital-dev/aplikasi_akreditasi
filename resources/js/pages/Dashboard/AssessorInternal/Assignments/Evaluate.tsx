import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { FormEvent } from 'react';

interface Assignment {
    id: number;
    fakultas: string;
    prodi: string;
    criterion: string;
    deadline: string | null;
    assigned_date: string;
    is_locked: boolean;
}

interface CriteriaPoint {
    id: number;
    title: string;
    description: string | null;
    max_score: number;
    evaluation: {
        id: number;
        score: number;
        notes: string | null;
        descriptive_narrative: string | null;
        improvement_suggestion: string | null;
        evaluation_status: string | null;
    } | null;
}

interface Document {
    id: string;
    file_name: string;
    file_path: string;
    category: string;
    year: number;
    validated_at: string | null;
    uploaded_at: string | null;
}

interface Props {
    assignment: Assignment;
    criteriaPoints: CriteriaPoint[];
    documents: Document[];
    warnings: string[];
    allDocumentsValidated: boolean;
    hasDocuments: boolean;
}

export default function AssignmentsEvaluate({ assignment, criteriaPoints, documents, warnings, allDocumentsValidated, hasDocuments }: Props) {
    // Initialize form data with existing evaluations
    const initialEvaluations = criteriaPoints.length > 0 
        ? criteriaPoints.map((point) => ({
            criteria_point_id: point.id,
            score: point.evaluation?.score?.toString() || '',
            notes: point.evaluation?.notes || '',
            descriptive_narrative: point.evaluation?.descriptive_narrative || '',
            improvement_suggestion: point.evaluation?.improvement_suggestion || '',
            evaluation_status: point.evaluation?.evaluation_status || '',
        }))
        : [];

    const { data, setData, post, put, processing, errors } = useForm({
        evaluations: initialEvaluations,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Validate all scores are filled
        const emptyScores = data.evaluations.filter((evaluation) => !evaluation.score || evaluation.score === '');
        if (emptyScores.length > 0) {
            alert('Semua poin kriteria harus diberi nilai.');
            return;
        }

        // Check if this is update or create
        const hasExistingEvaluations = criteriaPoints.some((point) => point.evaluation !== null);

        if (hasExistingEvaluations) {
            put(route('assessor-internal.assignments.evaluations.update', { assignmentId: assignment.id }), {
                onSuccess: () => {
                    router.visit(route('assessor-internal.assignments.index'));
                },
            });
        } else {
            post(route('assessor-internal.assignments.evaluations.store', { assignmentId: assignment.id }), {
                onSuccess: () => {
                    router.visit(route('assessor-internal.assignments.index'));
                },
            });
        }
    };

    const updateEvaluation = (index: number, field: string, value: string) => {
        const newEvaluations = [...data.evaluations];
        newEvaluations[index] = { ...newEvaluations[index], [field]: value };
        setData('evaluations', newEvaluations);
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'baik':
                return 'Baik';
            case 'cukup':
                return 'Cukup';
            case 'baik_sekali':
                return 'Baik Sekali';
            case 'unggul':
                return 'Unggul';
            default:
                return '';
        }
    };

    return (
        <DashboardLayout title="Input Nilai Akreditasi" subtitle={`Penilaian: ${assignment.criterion}`}>
            <Head title="Input Nilai Akreditasi" />

            <div className="space-y-6">
                {/* Assignment Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Penugasan</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Fakultas</p>
                            <p className="text-sm font-medium text-gray-900">{assignment.fakultas}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Program Studi</p>
                            <p className="text-sm font-medium text-gray-900">{assignment.prodi}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Kriteria</p>
                            <p className="text-sm font-medium text-gray-900">{assignment.criterion}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Deadline</p>
                            <p className="text-sm font-medium text-gray-900">
                                {assignment.deadline
                                    ? new Date(assignment.deadline).toLocaleDateString('id-ID', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Documents List */}
                {documents.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dokumen Terkait</h3>
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-xs text-gray-500">Kategori: {doc.category}</span>
                                                    <span className="text-xs text-gray-500">Tahun: {doc.year}</span>
                                                    {doc.validated_at && (
                                                        <span className="text-xs text-green-600">✓ Validated</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={route('assessor-internal.documents.download', { id: doc.id })}
                                        className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Warnings */}
                {warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-medium text-yellow-800">Peringatan</h4>
                                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                    {warnings.map((warning, index) => (
                                        <li key={index}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Evaluation Form */}
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    {criteriaPoints.length > 0 ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Form Penilaian</h3>
                                <p className="text-sm text-gray-600">Silakan isi form di bawah ini untuk setiap poin kriteria yang perlu dinilai.</p>
                            </div>
                            <div className="space-y-6">
                            {criteriaPoints.map((point, index) => (
                            <div key={point.id} className="border border-gray-200 rounded-lg p-6">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">{point.title}</h4>
                                            {point.description && (
                                                <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">Bobot maksimal: {point.max_score}</p>
                                        </div>
                                        {data.evaluations[index].evaluation_status && (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                data.evaluations[index].evaluation_status === 'unggul' ? 'bg-purple-100 text-purple-800' :
                                                data.evaluations[index].evaluation_status === 'baik_sekali' ? 'bg-blue-100 text-blue-800' :
                                                data.evaluations[index].evaluation_status === 'baik' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {getStatusLabel(data.evaluations[index].evaluation_status)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Score */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nilai (0-{point.max_score}) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={point.max_score}
                                            step="0.01"
                                            value={data.evaluations[index].score}
                                            onChange={(e) => updateEvaluation(index, 'score', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            required
                                            disabled={assignment.is_locked}
                                        />
                                        {errors[`evaluations.${index}.score` as keyof typeof errors] && (
                                            <p className="mt-1 text-sm text-red-600">{errors[`evaluations.${index}.score` as keyof typeof errors]}</p>
                                        )}
                                    </div>

                                    {/* Descriptive Narrative */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Narasi Deskriptif Penilaian</label>
                                        <textarea
                                            value={data.evaluations[index].descriptive_narrative}
                                            onChange={(e) => updateEvaluation(index, 'descriptive_narrative', e.target.value)}
                                            placeholder="Masukkan narasi deskriptif penilaian..."
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            disabled={assignment.is_locked}
                                        />
                                        {errors[`evaluations.${index}.descriptive_narrative` as keyof typeof errors] && (
                                            <p className="mt-1 text-sm text-red-600">{errors[`evaluations.${index}.descriptive_narrative` as keyof typeof errors]}</p>
                                        )}
                                    </div>

                                    {/* Improvement Suggestion */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Saran Perbaikan</label>
                                        <textarea
                                            value={data.evaluations[index].improvement_suggestion}
                                            onChange={(e) => updateEvaluation(index, 'improvement_suggestion', e.target.value)}
                                            placeholder="Masukkan saran perbaikan..."
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            disabled={assignment.is_locked}
                                        />
                                        {errors[`evaluations.${index}.improvement_suggestion` as keyof typeof errors] && (
                                            <p className="mt-1 text-sm text-red-600">{errors[`evaluations.${index}.improvement_suggestion` as keyof typeof errors]}</p>
                                        )}
                                    </div>

                                    {/* Evaluation Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status Penilaian</label>
                                        <select
                                            value={data.evaluations[index].evaluation_status}
                                            onChange={(e) => updateEvaluation(index, 'evaluation_status', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            disabled={assignment.is_locked}
                                        >
                                            <option value="">Pilih Status</option>
                                            <option value="baik">Baik</option>
                                            <option value="cukup">Cukup</option>
                                            <option value="baik_sekali">Baik Sekali</option>
                                            <option value="unggul">Unggul</option>
                                        </select>
                                        {data.evaluations[index].evaluation_status && (
                                            <div className="mt-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    data.evaluations[index].evaluation_status === 'unggul' ? 'bg-purple-100 text-purple-800' :
                                                    data.evaluations[index].evaluation_status === 'baik_sekali' ? 'bg-blue-100 text-blue-800' :
                                                    data.evaluations[index].evaluation_status === 'baik' ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {getStatusLabel(data.evaluations[index].evaluation_status)}
                                                </span>
                                            </div>
                                        )}
                                        {errors[`evaluations.${index}.evaluation_status` as keyof typeof errors] && (
                                            <p className="mt-1 text-sm text-red-600">{errors[`evaluations.${index}.evaluation_status` as keyof typeof errors]}</p>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                                        <textarea
                                            value={data.evaluations[index].notes}
                                            onChange={(e) => updateEvaluation(index, 'notes', e.target.value)}
                                            placeholder="Catatan tambahan..."
                                            rows={2}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            disabled={assignment.is_locked}
                                        />
                                        {errors[`evaluations.${index}.notes` as keyof typeof errors] && (
                                            <p className="mt-1 text-sm text-red-600">{errors[`evaluations.${index}.notes` as keyof typeof errors]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <Link
                                href={route('assessor-internal.assignments.index')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Batal
                            </Link>
                            {!assignment.is_locked && (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Penilaian'}
                                </button>
                            )}
                            {assignment.is_locked && (
                                <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md">
                                    Penilaian Dikunci
                                </div>
                            )}
                        </div>
                    </form>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Tidak Ada Poin Kriteria</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Kriteria ini belum memiliki poin penilaian. Silakan hubungi Admin untuk menambahkan poin kriteria.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('assessor-internal.assignments.index')}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Kembali ke Daftar
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

