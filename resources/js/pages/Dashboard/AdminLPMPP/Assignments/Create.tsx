import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm } from '@inertiajs/react';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Criterion {
    id: string;
    name: string;
    standard: {
        program: {
            name: string;
        };
    };
}

interface Prodi {
    id: string;
    name: string;
}

interface Fakultas {
    id: string;
    name: string;
    prodis: Prodi[];
}

interface User {
    id: string;
    name: string;
}

interface Props {
    criteria: Criterion[];
    fakultas: Fakultas[];
    assessors: User[];
}

export default function CreateAssignment({ criteria, fakultas, assessors }: Props) {
    const [selectedFakultasId, setSelectedFakultasId] = useState<string>('');
    
    const selectedFakultas = fakultas.find((f) => f.id === selectedFakultasId);
    const availableProdis = selectedFakultas?.prodis || [];

    const { data, setData, post, processing, errors } = useForm({
        criteria_id: '',
        fakultas_id: '',
        prodi_id: '',
        assessor_id: '',
        assigned_date: '',
        deadline: '',
        access_level: 'read_write',
        notes: '',
    });

    const handleFakultasChange = (fakultasId: string) => {
        setSelectedFakultasId(fakultasId);
        setData('fakultas_id', fakultasId);
        setData('prodi_id', ''); // Reset prodi when fakultas changes
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-lpmpp.assignments.store'));
    };

    return (
        <>
            <Head title="Buat Penugasan Asesor" />
            <DashboardLayout title="Buat Penugasan Asesor" subtitle="Buat penugasan baru untuk asesor">
                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kriteria</label>
                            <select
                                value={data.criteria_id}
                                onChange={(e) => setData('criteria_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Kriteria</option>
                                {criteria && criteria.length > 0 ? (
                                    criteria.map((criterion) => (
                                        <option key={criterion.id} value={criterion.id}>
                                            {criterion.name} - {criterion.standard?.program?.name || 'N/A'}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Tidak ada kriteria tersedia</option>
                                )}
                            </select>
                            {errors.criteria_id && <p className="mt-1 text-sm text-red-600">{errors.criteria_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fakultas</label>
                            <select
                                value={selectedFakultasId}
                                onChange={(e) => handleFakultasChange(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="">Pilih Fakultas</option>
                                {fakultas && fakultas.length > 0 ? (
                                    fakultas.map((fakultasItem) => (
                                        <option key={fakultasItem.id} value={fakultasItem.id}>
                                            {fakultasItem.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Tidak ada fakultas tersedia</option>
                                )}
                            </select>
                            {errors.fakultas_id && <p className="mt-1 text-sm text-red-600">{errors.fakultas_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Studi</label>
                            <select
                                value={data.prodi_id}
                                onChange={(e) => setData('prodi_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                                disabled={!selectedFakultasId || availableProdis.length === 0}
                            >
                                <option value="">{selectedFakultasId ? 'Pilih Program Studi' : 'Pilih Fakultas terlebih dahulu'}</option>
                                {availableProdis.length > 0 ? (
                                    availableProdis.map((prodi) => (
                                        <option key={prodi.id} value={prodi.id}>
                                            {prodi.name}
                                        </option>
                                    ))
                                ) : (
                                    selectedFakultasId && (
                                        <option value="" disabled>Tidak ada program studi tersedia</option>
                                    )
                                )}
                            </select>
                            {errors.prodi_id && <p className="mt-1 text-sm text-red-600">{errors.prodi_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Asesor (Opsional)</label>
                            <select
                                value={data.assessor_id}
                                onChange={(e) => setData('assessor_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                                <option value="">Pilih Asesor</option>
                                {assessors && assessors.length > 0 ? (
                                    assessors.map((assessor) => (
                                        <option key={assessor.id} value={assessor.id}>
                                            {assessor.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Tidak ada asesor tersedia</option>
                                )}
                            </select>
                            {errors.assessor_id && <p className="mt-1 text-sm text-red-600">{errors.assessor_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tanggal Penugasan</label>
                                <input
                                    type="date"
                                    value={data.assigned_date}
                                    onChange={(e) => setData('assigned_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                                {errors.assigned_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.assigned_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                                <input
                                    type="date"
                                    value={data.deadline}
                                    onChange={(e) => setData('deadline', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                                {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Level Akses</label>
                            <select
                                value={data.access_level}
                                onChange={(e) => setData('access_level', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            >
                                <option value="read_only">Read Only</option>
                                <option value="read_write">Read Write</option>
                                <option value="full_access">Full Access</option>
                            </select>
                            {errors.access_level && <p className="mt-1 text-sm text-red-600">{errors.access_level}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Catatan</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            />
                            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                        </div>

                        <div className="flex justify-end gap-4">
                            <a
                                href={route('admin-lpmpp.assignments.index')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
}

