import { Head, Link, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useEffect, useMemo, useState } from 'react';

interface Program {
    id: number;
    name: string;
}

interface Criterion {
    id: number;
    name: string;
    standard?: {
        program?: {
            name: string;
        };
    };
}

interface Cycle {
    id: string;
    cycle_name: string;
    prodi?: { name: string } | null;
    fakultas?: { name: string } | null;
    lam?: { code: string } | null;
}

interface Props {
    programs?: Program[];
    criteria?: Criterion[];
    cycles?: Cycle[];
}

export default function AssessorRequestsCreate({ cycles = [] }: Props) {
    const page = usePage();
    const url = page.url || '';
    const search = url.includes('?') ? url.split('?')[1] : '';
    const params = new URLSearchParams(search);
    const initialScope = params.get('scope_category') || '';
    const initialCycleId = params.get('cycle_id') || '';

    const [availableCycles, setAvailableCycles] = useState<Cycle[]>(cycles);
    const [selectedCycleState, setSelectedCycleState] = useState<Cycle | null>(null);
    const form = useForm({
        accreditation_cycle_id: initialCycleId,
        scope_category: initialScope,
        preferred_assessor_email: '',
        notes: '',
    });
    const selectedCycle = useMemo(() => {
        return availableCycles.find((c) => String(c.id) === String(form.data.accreditation_cycle_id || initialCycleId));
    }, [availableCycles, form.data.accreditation_cycle_id, initialCycleId]);

    useEffect(() => {
        if (availableCycles.length === 0) {
            const url = route('coordinator-prodi.accreditation.cycles.active');
            fetch(url, { headers: { 'Accept': 'application/json' } })
                .then(async (res) => {
                    if (!res.ok) return null;
                    const data = await res.json().catch(() => null);
                    if (data) {
                        const active: Cycle = {
                            id: String(data.id ?? data.cycle_id ?? 'active'),
                            cycle_name: data.cycle_name ?? data.name ?? 'Siklus Aktif',
                            prodi: data.prodi ?? data.program ?? null,
                            fakultas: data.fakultas ?? null,
                            lam: data.lam ?? null,
                        };
                        setAvailableCycles([active]);
                        if (!form.data.accreditation_cycle_id) {
                            form.setData('accreditation_cycle_id', String(active.id));
                        }
                    }
                })
                .catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Head title="Ajukan Penunjukan Asesor" />
            <DashboardLayout title="Ajukan Penunjukan Asesor" subtitle="Kirim permintaan penunjukan asesor ke Admin LPMPP">
                <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Siklus Akreditasi</label>
                            <select
                                value={form.data.accreditation_cycle_id}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    form.setData('accreditation_cycle_id', val);
                                    const found = availableCycles.find((c) => String(c.id) === String(val));
                                    setSelectedCycleState(found || null);
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                required
                            >
                                <option value="">Pilih Siklus</option>
                                {availableCycles.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.cycle_name}
                                        {c.prodi?.name ? ` - ${c.prodi.name}` : ''}
                                        {c.lam?.code ? ` (${c.lam.code})` : ''}
                                    </option>
                                ))}
                            </select>
                            {form.errors.accreditation_cycle_id && <p className="text-red-500 text-xs mt-1">{form.errors.accreditation_cycle_id}</p>}
                            {!availableCycles.length && (
                                <div className="mt-2 text-xs text-gray-600">
                                    Tidak ada siklus tersedia. Buat atau kelola di halaman{' '}
                                    <a href={route('coordinator-prodi.accreditation.cycles')} className="text-blue-600 hover:text-blue-800 underline">Siklus Akreditasi</a>.
                                </div>
                            )}
                        </div>
                        {form.data.accreditation_cycle_id && (selectedCycleState || selectedCycle) && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="text-sm font-medium text-gray-900">{(selectedCycleState || selectedCycle)!.cycle_name}</div>
                                <div className="mt-1 text-xs text-gray-700">
                                    <span>Prodi: {(selectedCycleState || selectedCycle)!.prodi?.name ?? '-'}</span>
                                    {(selectedCycleState || selectedCycle)!.fakultas?.name && <span className="ml-3">Fakultas: {(selectedCycleState || selectedCycle)!.fakultas!.name}</span>}
                                    {(selectedCycleState || selectedCycle)!.lam?.code && <span className="ml-3">LAM: {(selectedCycleState || selectedCycle)!.lam!.code}</span>}
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Dokumen (Opsional)</label>
                            <input
                                type="text"
                                value={form.data.scope_category}
                                onChange={(e) => form.setData('scope_category', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="Misal: LKPS, Kriteria 1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Asesor yang Disarankan (Opsional)</label>
                            <input
                                type="email"
                                value={form.data.preferred_assessor_email}
                                onChange={(e) => form.setData('preferred_assessor_email', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="email@contoh.ac.id"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                            <textarea
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Link
                                href={route('coordinator-prodi.accreditation.simulation')}
                                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-center"
                            >
                                Batal
                            </Link>
                            <button
                                onClick={() => form.post(route('coordinator-prodi.assessor-requests.store'))}
                                disabled={form.processing}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {form.processing ? 'Mengirim...' : 'Kirim Permintaan'}
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
