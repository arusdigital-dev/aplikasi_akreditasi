import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Simulation {
    id: string;
    cycle: {
        id: string;
        name: string;
        prodi: string | null;
        lam: string | null;
    };
    total_score: number;
    predicted_result: string | null;
    created_at: string;
    created_by: string;
}

interface LAMLite {
    id: number;
    code: string;
    name: string;
}

interface ProdiLite {
    id: string;
    name: string;
}

interface Props {
    simulations: {
        data: Simulation[];
        links: any[];
        meta: any;
    };
    lams: LAMLite[];
    prodis: ProdiLite[];
    filters: {
        prodi_id?: string;
        lam_id?: string;
        cycle_id?: string;
    };
}

export default function SimulationsIndex({ simulations, lams, prodis, filters }: Props) {
    const [prodiId, setProdiId] = useState(filters.prodi_id || '');
    const [lamId, setLamId] = useState(filters.lam_id || '');
    const [cycleId, setCycleId] = useState(filters.cycle_id || '');

    const handleFilter = () => {
        router.get(route('admin-lpmpp.simulations.index'), {
            prodi_id: prodiId || undefined,
            lam_id: lamId || undefined,
            cycle_id: cycleId || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Hasil Simulasi Akreditasi" />
            <DashboardLayout title="Hasil Simulasi Akreditasi" subtitle="Monitoring hasil simulasi per siklus, prodi, dan LAM">
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <select
                                    value={prodiId}
                                    onChange={(e) => setProdiId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Semua Prodi</option>
                                    {prodis.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={lamId}
                                    onChange={(e) => setLamId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Semua LAM</option>
                                    {lams.map((l) => (
                                        <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Cari ID Siklus..."
                                    value={cycleId}
                                    onChange={(e) => setCycleId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>
                            <div>
                                <button
                                    onClick={handleFilter}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prodi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siklus</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAM</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Skor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediksi Hasil</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {simulations.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Tidak ada hasil simulasi</td>
                                    </tr>
                                ) : (
                                    simulations.data.map((s) => (
                                        <tr key={s.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{s.cycle.prodi || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{s.cycle.name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{s.cycle.lam || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{s.total_score?.toFixed?.(2) ?? s.total_score}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{s.predicted_result || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{s.created_at} oleh {s.created_by}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

