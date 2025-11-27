export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full bg-[#0b1e37] text-white" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
            <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                            <img src="/images/logo.png" alt="Logo Madani" className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-[15px] font-semibold">UMRAH</div>
                        </div>
                    </div>
                    <p className="mb-2 text-[13px] leading-6 text-white/80">
                        Sistem Manajemen Dokumen & Akreditasi Universitas Maritim Raja Ali Haji
                    </p>
                    <p className="text-[13px] leading-6 text-white/60">
                        Platform resmi untuk pengelolaan dokumen dan proses akreditasi di lingkungan UMRAH.
                    </p>
                </div>

                <div>
                    <div className="mb-3 text-[13px] font-semibold">Navigasi</div>
                    <ul className="space-y-2 text-[13px] text-white/80">
                        <li><a href="#fitur" className="hover:text-white">Fitur Utama</a></li>
                        <li><a href="#peran" className="hover:text-white">Peran Pengguna</a></li>
                        <li><a href="#cara-kerja" className="hover:text-white">Cara Kerja</a></li>
                        <li><a href="#keamanan" className="hover:text-white">Keamanan & SSO</a></li>
                    </ul>
                </div>

                <div>
                    <div className="mb-3 text-[13px] font-semibold">Sumber Daya</div>
                    <ul className="space-y-2 text-[13px] text-white/80">
                        <li><a href="#" className="hover:text-white">Panduan Pengguna</a></li>
                        <li><a href="#" className="hover:text-white">FAQ</a></li>
                        <li><a href="#" className="hover:text-white">Dokumentasi API</a></li>
                        <li><a href="#" className="hover:text-white">Tutorial Video</a></li>
                    </ul>
                </div>

                <div>
                    <div className="mb-3 text-[13px] font-semibold">Kontak & Bantuan</div>
                    <ul className="space-y-3 text-[13px] text-white/80">
                        <li className="flex items-start gap-2">
                            <span>✉️</span>
                            <span>lpmp@umrah.ac.id</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>☎️</span>
                            <span>+62 778 384038</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>📍</span>
                            <span>Jl. Politeknik Senggarang, Tanjungpinang, Kepulauan Riau</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 pb-10">
                <div className="h-px w-full bg-white/10 mb-4" />
                <div className="flex flex-col gap-3 text-[12px] text-white/60 lg:flex-row lg:items-center lg:justify-center">
                    <div>© {year} LPMMP UMRAH. All rights reserved.</div>
                </div>
            </div>
        </footer>
    );
}
