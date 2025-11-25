export default function Role() {
    const roles = [
        {
            key: 'admin',
            color: '#0b1e37',
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
            color: '#10b981',
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
            color: '#8b5cf6',
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
            color: '#2563EB',
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
        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e2f0ff] text-[#2563EB]">
            ✓
        </span>
    );

    return (
        <section id="peran" className="w-full bg-[#f8fafc]" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
            <div className="mx-auto max-w-6xl px-6 py-14">
                <h2 className="mb-2 text-center text-[28px] font-semibold text-[#0f172a]">Fitur Lengkap untuk Setiap Peran di UMRAH</h2>
                <p className="mx-auto mb-10 max-w-3xl text-center text-[15px] leading-7 text-[#334155]">
                    Setiap role memiliki akses dan fitur yang disesuaikan dengan tanggung jawab mereka dalam proses akreditasi
                </p>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {roles.map((role) => (
                        <div key={role.key} className="relative rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                                    style={{ backgroundColor: role.color }}
                                >
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
                                        <span className="text-sm leading-6 text-[#475569]">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-5">
                                <span
                                    className="inline-block rounded-md px-3 py-1 text-xs font-medium shadow ring-1 ring-[#e2e8f0]"
                                    style={{ color: role.color, backgroundColor: '#ffffff' }}
                                >
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
