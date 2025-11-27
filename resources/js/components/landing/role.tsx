import { useScrollAnimation } from '@/lib/useScrollAnimation';

export default function Role() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
    const roles = [
        {
            key: 'admin',
            badge: 'Full Access Control',
            title: 'Admin LPMPP',
            subtitle: 'Role dalam sistem akreditasi',
            items: [
                'Mengelola Master Pegawai & data organisasi',
                'Assign & manage role pengguna (Koor Prodi, Assessor, Pimpinan)',
                'Monitoring aktivitas sistem melalui Audit Trail',
                'Dashboard statistik akreditasi seluruh program studi',
                'Mengelola template & kriteria akreditasi',
            ],
        },
        {
            key: 'koor',
            badge: 'Collaborative Access',
            title: 'Koordinator Program Studi',
            subtitle: 'Role dalam sistem akreditasi',
            items: [
                'Upload & kelola dokumen akreditasi program studi',
                'Submit dokumen untuk review Assessor',
                'Tracking status dokumen & feedback dari Assessor',
                'Dashboard progress akreditasi program studi',
                'Kolaborasi dengan tim program studi',
            ],
        },
        {
            key: 'assessor',
            badge: 'Collaborative Access',
            title: 'Assessor Internal',
            subtitle: 'Role dalam sistem akreditasi',
            items: [
                'Review & evaluasi dokumen dari Koor Prodi',
                'Memberikan penilaian & feedback terstruktur',
                'Menyusun laporan hasil assessment',
                'Dashboard daftar dokumen yang perlu di-review',
                'Track riwayat penilaian & revisi dokumen',
            ],
        },
        {
            key: 'pimpinan',
            badge: 'View Only',
            title: 'Pimpinan Universitas',
            subtitle: 'Role dalam sistem akreditasi',
            items: [
                'View-only dashboard eksekutif',
                'Laporan & statistik akreditasi seluruh unit',
                'Monitoring progress akreditasi real-time',
                'Analisis performa program studi',
                'Export laporan untuk pengambilan keputusan',
            ],
        },
    ];

    const Check = () => (
        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e2e8f0] text-[#0f172a]">
            ✓
        </span>
    );

    return (
        <section id="peran" className="w-full bg-[#f8fafc]" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
            <div className="mx-auto max-w-6xl px-6 py-14">
                <div
                    ref={ref}
                    className={`scroll-animate ${isVisible ? 'visible' : ''}`}
                >
                    <h2 className="mb-2 text-center text-[28px] font-semibold text-[#0f172a]">Fitur Lengkap untuk Setiap Peran di UMRAH</h2>
                    <p className="mx-auto mb-10 max-w-3xl text-center text-[15px] leading-7 text-[#334155]">
                        Setiap role memiliki akses dan fitur yang disesuaikan dengan tanggung jawab mereka dalam proses akreditasi
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {roles.map((role, index) => (
                        <div
                            key={role.key}
                            className={`relative rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover-lift hover-glow cursor-pointer transition-all duration-300 scroll-animate ${
                                isVisible ? 'visible' : ''
                            }`}
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] text-white hover-scale transition-all duration-300">
                                    <span className="text-sm">🏷️</span>
                                </div>
                                <div>
                                    <div className="text-[15px] font-semibold text-[#0f172a]">{role.title}</div>
                                    <div className="text-xs text-[#64748b]">{role.subtitle}</div>
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {role.items.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <Check />
                                        <span className="text-sm leading-6 text-[#0f172a]">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-5">
                                <span className="inline-block rounded-md px-3 py-1 text-xs font-medium text-[#0f172a] bg-[#f1f5f9] border border-[#e2e8f0] transition-transform duration-300 hover:scale-105">
                                    {role.badge}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
