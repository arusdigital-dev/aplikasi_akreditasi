import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface LAM {
    id: number;
    name: string;
    code: string;
}

interface AccreditationCycle {
    id: string;
    cycle_name: string;
    start_date: string;
    end_date: string | null;
    target_submission_date: string | null;
    status: string;
    accreditation_result: string | null;
    final_score: number | null;
    lam: {
        id: number;
        name: string;
        code: string;
    };
    created_at: string;
}

interface Props {
    cycles: AccreditationCycle[];
    activeCycle: AccreditationCycle | null;
    lams: LAM[];
    prodi: {
        id: string;
        name: string;
        lam_id: number | null;
        lam?: {
            id: number;
            name: string;
            code: string;
        } | null;
    };
    programLamName?: string | null;
}

export default function AccreditationCycles({ cycles, activeCycle, lams, prodi, programLamName }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const normalize = (s?: string | null) => (s || '').toLowerCase().replace(/[\s\-_]+/g, '');
    const programMatchedLam = programLamName
        ? lams.find((lam) => normalize(lam.name) === normalize(programLamName) || normalize(lam.code) === normalize(programLamName))
        : undefined;
    const displayLamName = (lam: { name: string; code: string }) =>
        programLamName &&
        (normalize(lam.name) === normalize(programLamName) || normalize(lam.code) === normalize(programLamName))
            ? programLamName
            : lam.name;
    const defaultLamId =
        prodi.lam_id?.toString() ||
        (prodi.lam?.id ? String(prodi.lam.id) : '') ||
        (programMatchedLam ? String(programMatchedLam.id) : '');
    const lamOptions = defaultLamId
        ? [...lams].sort((a, b) => {
              const aIsDefault = String(a.id) === defaultLamId;
              const bIsDefault = String(b.id) === defaultLamId;
              if (aIsDefault && !bIsDefault) return -1;
              if (!aIsDefault && bIsDefault) return 1;
              return a.name.localeCompare(b.name);
          })
        : lams;
    const { data, setData, post, processing, errors } = useForm({
        lam_id: defaultLamId || '',
        cycle_name: '',
        start_date: '',
        target_submission_date: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            lam_id: data.lam_id || defaultLamId,
        };
        router.post('/coordinator-prodi/accreditation/cycles', payload, {
            onSuccess: () => {
                setShowCreateModal(false);
                setData({
                    lam_id: defaultLamId || '',
                    cycle_name: '',
                    start_date: '',
                    target_submission_date: '',
                    notes: '',
                });
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; color: string }> = {
            draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
            active: { label: 'Aktif', color: 'bg-green-100 text-green-800' },
            submitted: { label: 'Telah Dikirim', color: 'bg-blue-100 text-blue-800' },
            evaluating: { label: 'Sedang Dievaluasi', color: 'bg-yellow-100 text-yellow-800' },
            completed: { label: 'Selesai', color: 'bg-purple-100 text-purple-800' },
            archived: { label: 'Diarsipkan', color: 'bg-gray-100 text-gray-800' },
        };

        const config = statusConfig[status] || statusConfig.draft;
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <>
            <Head title="Siklus Akreditasi" />
            <DashboardLayout
                title="Siklus Akreditasi"
                subtitle="Kelola siklus akreditasi program studi Anda"
            >
                <div className="space-y-6">
                    {/* Active Cycle Card */}
                    {activeCycle && (
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">Siklus Aktif</h3>
                                    <p className="text-blue-100">{activeCycle.cycle_name}</p>
                                    <p className="text-sm text-blue-100 mt-1">
                                        {displayLamName(activeCycle.lam)} • Dimulai: {new Date(activeCycle.start_date).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <Link
                                    href={route('coordinator-prodi.accreditation.criteria', activeCycle.id)}
                                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Daftar Siklus Akreditasi</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Buat Siklus Baru
                        </button>
                    </div>

                    {/* Cycles Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Siklus
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        LAM
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Periode
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hasil
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cycles.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Belum ada siklus akreditasi. Buat siklus baru untuk memulai.
                                        </td>
                                    </tr>
                                ) : (
                                    cycles.map((cycle) => (
                                        <tr key={cycle.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{cycle.cycle_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{displayLamName(cycle.lam)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(cycle.start_date).toLocaleDateString('id-ID')}
                                                    {cycle.end_date && ` - ${new Date(cycle.end_date).toLocaleDateString('id-ID')}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(cycle.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {cycle.accreditation_result ? (
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {cycle.accreditation_result}
                                                        {cycle.final_score && ` (${cycle.final_score})`}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={route('coordinator-prodi.accreditation.criteria', cycle.id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Lihat
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Buat Siklus Akreditasi Baru</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        LAM Framework
                                    </label>
                                    <select
                                        value={data.lam_id || defaultLamId}
                                        onChange={(e) => setData('lam_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    >
                                        <option value={defaultLamId || ''} disabled={!defaultLamId}>
                                            {programLamName || (prodi.lam ? prodi.lam.name : 'LAM belum diatur')}
                                        </option>
                                    </select>
                                    {errors.lam_id && <p className="text-red-500 text-xs mt-1">{errors.lam_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Siklus
                                    </label>
                                    <input
                                        type="text"
                                        value={data.cycle_name}
                                        onChange={(e) => setData('cycle_name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="e.g., Akreditasi 2025"
                                        required
                                    />
                                    {errors.cycle_name && <p className="text-red-500 text-xs mt-1">{errors.cycle_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        required
                                    />
                                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target Pengajuan
                                    </label>
                                    <input
                                        type="date"
                                        value={data.target_submission_date}
                                        onChange={(e) => setData('target_submission_date', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan'}
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
