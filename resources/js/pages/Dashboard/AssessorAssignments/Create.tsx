import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FormEvent } from 'react';

interface Assessor {
    id: string;
    name: string;
    email: string;
    unit_name: string;
}

interface Criterion {
    id: number;
    name: string;
    standard_name: string;
    program_name: string;
}

interface Unit {
    id: string;
    name: string;
    type: string;
}

interface Program {
    id: number;
    name: string;
    fakultas: string;
    jenjang: string;
}

interface Props {
    availableAssessors: Assessor[];
    criteria: Criterion[];
    units: Unit[];
    programs: Program[];
    assignmentType: string;
}

export default function AssessorAssignmentsCreate({
    availableAssessors,
    criteria,
    units,
    programs,
    assignmentType: initialType,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        assessor_id: '',
        assignment_type: initialType,
        criteria_id: '',
        unit_id: '',
        program_id: '',
        access_level: 'read_write',
        deadline: '',
        notes: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('assessor-assignments.store'));
    };

    return (
        <>
            <Head title="Assign Asesor" />
            <DashboardLayout title="Assign Asesor" subtitle="Tambahkan penugasan asesor baru">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Assignment Type */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Penugasan</label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('assignment_type', 'criteria')}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                                        data.assignment_type === 'criteria'
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <p className="font-medium text-gray-900">Kriteria</p>
                                    <p className="text-xs text-gray-500 mt-1">Penugasan ke kriteria spesifik</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('assignment_type', 'unit')}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                                        data.assignment_type === 'unit'
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <p className="font-medium text-gray-900">Unit</p>
                                    <p className="text-xs text-gray-500 mt-1">Penugasan ke Fakultas/Prodi</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('assignment_type', 'program')}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                                        data.assignment_type === 'program'
                                            ? 'border-gray-900 bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <p className="font-medium text-gray-900">Program</p>
                                    <p className="text-xs text-gray-500 mt-1">Penugasan ke Program Studi</p>
                                </button>
                            </div>
                            {errors.assignment_type && (
                                <p className="mt-1 text-sm text-red-600">{errors.assignment_type}</p>
                            )}
                        </div>

                        {/* Assessor Selection */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pilih Asesor <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.assessor_id}
                                onChange={(e) => setData('assessor_id', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            >
                                <option value="">-- Pilih Asesor --</option>
                                {availableAssessors.map((assessor) => (
                                    <option key={assessor.id} value={assessor.id}>
                                        {assessor.name} ({assessor.unit_name}) - {assessor.email}
                                    </option>
                                ))}
                            </select>
                            {errors.assessor_id && <p className="mt-1 text-sm text-red-600">{errors.assessor_id}</p>}
                        </div>

                        {/* Target Selection based on type */}
                        {data.assignment_type === 'criteria' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Kriteria <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.criteria_id}
                                    onChange={(e) => setData('criteria_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">-- Pilih Kriteria --</option>
                                    {criteria.map((criterion) => (
                                        <option key={criterion.id} value={criterion.id}>
                                            {criterion.name} - {criterion.program_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.criteria_id && <p className="mt-1 text-sm text-red-600">{errors.criteria_id}</p>}
                            </div>
                        )}

                        {data.assignment_type === 'unit' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Unit (Fakultas/Prodi) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.unit_id}
                                    onChange={(e) => setData('unit_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">-- Pilih Unit --</option>
                                    {units.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name} ({unit.type})
                                        </option>
                                    ))}
                                </select>
                                {errors.unit_id && <p className="mt-1 text-sm text-red-600">{errors.unit_id}</p>}
                            </div>
                        )}

                        {data.assignment_type === 'program' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Program <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.program_id}
                                    onChange={(e) => setData('program_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="">-- Pilih Program --</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.name} - {program.fakultas} ({program.jenjang})
                                        </option>
                                    ))}
                                </select>
                                {errors.program_id && <p className="mt-1 text-sm text-red-600">{errors.program_id}</p>}
                            </div>
                        )}

                        {/* Access Level */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tingkat Akses <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.access_level}
                                onChange={(e) => setData('access_level', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            >
                                <option value="read_only">Read Only</option>
                                <option value="read_write">Read + Write (Nilai & Catatan)</option>
                                <option value="full_access">Full Access</option>
                            </select>
                            {errors.access_level && <p className="mt-1 text-sm text-red-600">{errors.access_level}</p>}
                        </div>

                        {/* Deadline */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline Penilaian</label>
                            <input
                                type="date"
                                value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                            {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="Tambahkan catatan jika diperlukan..."
                            />
                            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4">
                            <Link
                                href={route('assessor-assignments.index')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Penugasan'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}
