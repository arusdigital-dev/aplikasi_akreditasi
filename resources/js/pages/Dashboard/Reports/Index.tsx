import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface Program {
    id: number;
    name: string;
    fakultas: string;
    jenjang: string;
}

interface Unit {
    id: string;
    name: string;
    type: string;
}

interface Assessor {
    id: string;
    name: string;
    email: string;
}

interface Props {
    programs: Program[];
    units: Unit[];
    assessors: Assessor[];
}

export default function ReportsIndex({ programs, units, assessors }: Props) {
    const [reportType, setReportType] = useState<'document-completeness' | 'assessor-evaluation' | 'executive'>('document-completeness');

    const documentCompletenessForm = useForm({
        type: 'fakultas',
        program_id: '',
        unit_id: '',
        criterion_id: '',
        format: 'pdf',
    });

    const assessorEvaluationForm = useForm({
        assessor_id: '',
        program_id: '',
        format: 'pdf',
    });

    const executiveForm = useForm({
        program_id: '',
        format: 'pdf',
    });

    const handleDocumentCompletenessSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        documentCompletenessForm.post(route('reports.document-completeness'), {
            forceFormData: true,
            onSuccess: () => {
                // File will be downloaded automatically
            },
        });
    };

    const handleAssessorEvaluationSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        assessorEvaluationForm.post(route('reports.assessor-evaluation'), {
            forceFormData: true,
            onSuccess: () => {
                // File will be downloaded automatically
            },
        });
    };

    const handleExecutiveSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        executiveForm.post(route('reports.executive'), {
            forceFormData: true,
            onSuccess: () => {
                // File will be downloaded automatically
            },
        });
    };

    return (
        <>
            <Head title="Cetak & Simpan Laporan" />
            <DashboardLayout
                title="Cetak & Simpan Laporan"
                subtitle="Generate laporan resmi dalam format PDF, Excel, atau Word"
            >
                <div className="space-y-6">
                    {/* Report Type Selection */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jenis Laporan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => setReportType('document-completeness')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    reportType === 'document-completeness'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="font-medium text-gray-900">Laporan Kelengkapan Dokumen</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Per Fakultas, Prodi, Unit, atau Kriteria
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReportType('assessor-evaluation')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    reportType === 'assessor-evaluation'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="font-medium text-gray-900">Laporan Penilaian Asesor</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Nilai total, catatan, dan bukti evaluasi
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReportType('executive')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    reportType === 'executive'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="font-medium text-gray-900">Laporan Eksekutif</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Grafik overall, kesiapan, dan risiko
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Document Completeness Form */}
                    {reportType === 'document-completeness' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Kelengkapan Dokumen</h3>
                            <form onSubmit={handleDocumentCompletenessSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipe Laporan
                                    </label>
                                    <select
                                        value={documentCompletenessForm.data.type}
                                        onChange={(e) => documentCompletenessForm.setData('type', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="fakultas">Per Fakultas</option>
                                        <option value="prodi">Per Program Studi</option>
                                        <option value="unit">Per Unit</option>
                                        <option value="criteria">Per Kriteria</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Program (Opsional)
                                    </label>
                                    <select
                                        value={documentCompletenessForm.data.program_id}
                                        onChange={(e) => documentCompletenessForm.setData('program_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="">Semua Program Studi</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name} - {program.fakultas}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {documentCompletenessForm.data.type === 'unit' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit (Opsional)
                                        </label>
                                        <select
                                            value={documentCompletenessForm.data.unit_id}
                                            onChange={(e) => documentCompletenessForm.setData('unit_id', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        >
                                            <option value="">Semua Unit</option>
                                            {units.map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Format Export
                                    </label>
                                    <select
                                        value={documentCompletenessForm.data.format}
                                        onChange={(e) => documentCompletenessForm.setData('format', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                        <option value="word">Word</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={documentCompletenessForm.processing}
                                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {documentCompletenessForm.processing ? 'Membuat Laporan...' : 'Generate Laporan'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Assessor Evaluation Form */}
                    {reportType === 'assessor-evaluation' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Penilaian Asesor</h3>
                            <form onSubmit={handleAssessorEvaluationSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Asesor (Opsional)
                                    </label>
                                    <select
                                        value={assessorEvaluationForm.data.assessor_id}
                                        onChange={(e) => assessorEvaluationForm.setData('assessor_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="">Semua Asesor</option>
                                        {assessors.map((assessor) => (
                                            <option key={assessor.id} value={assessor.id}>
                                                {assessor.name} ({assessor.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Program (Opsional)
                                    </label>
                                    <select
                                        value={assessorEvaluationForm.data.program_id}
                                        onChange={(e) => assessorEvaluationForm.setData('program_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="">Semua Program Studi</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name} - {program.fakultas}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Format Export
                                    </label>
                                    <select
                                        value={assessorEvaluationForm.data.format}
                                        onChange={(e) => assessorEvaluationForm.setData('format', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                        <option value="word">Word</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={assessorEvaluationForm.processing}
                                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {assessorEvaluationForm.processing ? 'Membuat Laporan...' : 'Generate Laporan'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Executive Report Form */}
                    {reportType === 'executive' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Eksekutif Universitas</h3>
                            <form onSubmit={handleExecutiveSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Program (Opsional)
                                    </label>
                                    <select
                                        value={executiveForm.data.program_id}
                                        onChange={(e) => executiveForm.setData('program_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="">Semua Program Studi</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name} - {program.fakultas}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Format Export
                                    </label>
                                    <select
                                        value={executiveForm.data.format}
                                        onChange={(e) => executiveForm.setData('format', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                        <option value="word">Word</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={executiveForm.processing}
                                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {executiveForm.processing ? 'Membuat Laporan...' : 'Generate Laporan'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Informasi Laporan</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Laporan PDF menggunakan template resmi dengan header universitas dan QR Code validasi</li>
                                    <li>Laporan Excel berisi data rekap dalam format spreadsheet</li>
                                    <li>Laporan Word berisi laporan naratif yang dapat diedit</li>
                                    <li>Semua laporan mengikuti format standar LPMPP/BAN-PT/LAM</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

