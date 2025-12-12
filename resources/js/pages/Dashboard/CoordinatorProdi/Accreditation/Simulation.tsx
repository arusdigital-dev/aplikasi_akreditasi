import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface AccreditationCycle {
    id: string;
    cycle_name: string;
    lam: {
        id: number;
        name: string;
    };
}

interface Simulation {
    id: number;
    total_score: number;
    predicted_result: string;
    created_at: string;
    creator: {
        name: string;
    };
}

interface Props {
    cycle: AccreditationCycle | null;
    simulations: Simulation[];
    currentScores: Record<string, number>;
}

export default function AccreditationSimulation({ cycle, simulations, currentScores }: Props) {
    // Jika tidak ada cycle, tampilkan pesan error
    if (!cycle) {
        return (
            <>
                <Head title="Simulasi Akreditasi" />
                <DashboardLayout
                    title="Simulasi Akreditasi"
                    subtitle="Siklus Akreditasi Tidak Ditemukan"
                >
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
    const [showRunModal, setShowRunModal] = useState(false);
    const { data, setData, post, processing } = useForm({
        indicator_scores: currentScores,
        notes: '',
    });

    const handleRunSimulation = () => {
        router.post(`/coordinator-prodi/accreditation/cycles/${cycle.id}/simulation`, data, {
            onSuccess: () => {
                setShowRunModal(false);
                router.reload();
            },
        });
    };

    const handleRunWithCurrentScores = () => {
        router.post(`/coordinator-prodi/accreditation/cycles/${cycle.id}/simulation/current`, {}, {
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const getResultColor = (result: string) => {
        const colors: Record<string, string> = {
            'Unggul': 'bg-green-100 text-green-800',
            'Baik Sekali': 'bg-blue-100 text-blue-800',
            'Baik': 'bg-yellow-100 text-yellow-800',
            'Tidak Terakreditasi': 'bg-red-100 text-red-800',
        };
        return colors[result] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title="Simulasi Akreditasi" />
            <DashboardLayout
                title="Simulasi Akreditasi"
                subtitle={`${cycle.cycle_name} - ${cycle.lam.name}`}
            >
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleRunWithCurrentScores}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Jalankan dengan Skor Saat Ini
                        </button>
                        <button
                            onClick={() => setShowRunModal(true)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Simulasi Manual
                        </button>
                    </div>

                    {/* Latest Simulation Result */}
                    {simulations.length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4">Hasil Simulasi Terakhir</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="text-sm text-blue-600 font-medium">Total Skor</div>
                                    <div className="text-2xl font-bold text-blue-900 mt-1">
                                        {simulations[0].total_score.toFixed(2)}
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="text-sm text-green-600 font-medium">Prediksi Hasil</div>
                                    <div className={`text-2xl font-bold mt-1 ${getResultColor(simulations[0].predicted_result).split(' ')[1]}`}>
                                        {simulations[0].predicted_result}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 font-medium">Dibuat</div>
                                    <div className="text-sm text-gray-900 mt-1">
                                        {new Date(simulations[0].created_at).toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        oleh {simulations[0].creator.name}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Simulation History */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Riwayat Simulasi</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Skor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prediksi Hasil</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibuat Oleh</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {simulations.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Belum ada simulasi. Jalankan simulasi untuk melihat hasil.
                                            </td>
                                        </tr>
                                    ) : (
                                        simulations.map((sim) => (
                                            <tr key={sim.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(sim.created_at).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {sim.total_score.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResultColor(sim.predicted_result)}`}>
                                                        {sim.predicted_result}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {sim.creator.name}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Run Simulation Modal */}
                {showRunModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">Simulasi Manual</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Masukkan skor untuk setiap indikator. Skor akan digunakan untuk menghitung prediksi hasil akreditasi.
                            </p>
                            <div className="space-y-4">
                                {Object.entries(currentScores).map(([indicatorId, score]) => (
                                    <div key={indicatorId} className="flex items-center gap-3">
                                        <label className="flex-1 text-sm text-gray-700">Indikator {indicatorId}</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="4"
                                            step="0.1"
                                            value={data.indicator_scores[indicatorId] || score}
                                            onChange={(e) => {
                                                setData('indicator_scores', {
                                                    ...data.indicator_scores,
                                                    [indicatorId]: parseFloat(e.target.value) || 0,
                                                });
                                            }}
                                            className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-4 mt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowRunModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleRunSimulation}
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Menjalankan...' : 'Jalankan Simulasi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}

