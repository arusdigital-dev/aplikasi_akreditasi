export default function FeatureOverview() {
    return (
        <section className="w-full bg-white" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
            <div className="mx-auto max-w-6xl px-6 py-14 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
                <div>
                    <h3 className="mb-2 text-[28px] font-semibold text-[#0f172a]">Platform yang Dirancang untuk UMRAH</h3>
                    <p className="mb-8 text-[15px] leading-7 text-[#334155]">
                        Sistem ini dikembangkan khusus untuk memenuhi kebutuhan proses akreditasi di lingkungan Universitas Maritim Raja Ali Haji, dengan mempertimbangkan struktur organisasi, workflow, dan kebutuhan keamanan data yang spesifik.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e2f0ff] text-[#2563EB]">✓</span>
                            <span className="text-[15px] leading-7 text-[#475569]">Workflow yang disesuaikan dengan proses akreditasi UMRAH</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e2f0ff] text-[#2563EB]">✓</span>
                            <span className="text-[15px] leading-7 text-[#475569]">Integrasi dengan sistem existing universitas</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e2f0ff] text-[#2563EB]">✓</span>
                            <span className="text-[15px] leading-7 text-[#475569]">Support tim teknis yang memahami kebutuhan institusi</span>
                        </li>
                    </ul>
                </div>

                <div className="relative">
                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-[#e2e8f0] bg-white shadow-md">
                        <img src="/images/feature-overview.webp" alt="Feature Overview" className="w-full aspect-[16/10] object-cover" />
                    </div>
                    <div className="absolute right-3 top-3 rounded-full bg-[#2563EB] px-4 py-1.5 text-xs font-medium text-white shadow-sm ring-1 ring-white/20">
                        ✓
                        <span className="ml-1">Data Terpusat</span>
                    </div>
                    <div className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-1.5 text-xs text-[#0f172a] shadow ring-1 ring-[#e2e8f0] backdrop-blur">
                        📊
                        <span className="ml-1">Real-time Analytics</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
