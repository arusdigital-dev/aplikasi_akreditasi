export default function HeroSection() {
    return (
        <section
            className="relative w-full"
            style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}
        >
            <div
                className="relative min-h-[720px] w-full overflow-hidden"
                style={{
                    backgroundImage: "url('/images/bg-hero.webp')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-[#0a2a5a]/60" />
                <div className="relative z-10 mx-auto flex min-h-[700px] max-w-6xl flex-col items-center justify-center px-6 text-center text-white">
                    <div>
                        <p className="mb-3 text-sm opacity-90">Satu Platform untuk Dokumen & Akreditasi UMRAH</p>
                        <h1 className="mx-auto mb-6 max-w-3xl text-3xl font-semibold leading-relaxed opacity-95">
                            Kelola dokumen, tugas akreditasi, dan statistik penilaian secara terintegrasi untuk LPM, Koordinator Prodi, Assessor, dan Pimpinan Universitas.
                        </h1>
                        <div className="mb-2 flex items-center justify-center gap-4">
                            <a
                                href="/login"
                                className="inline-block rounded-md bg-[#2563EB] px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#1E4ED0]"
                            >
                                Masuk dengan Akun UMRAH
                            </a>
                            <a
                                href="#fitur"
                                className="inline-flex items-center gap-2 rounded-md border border-white/70 px-6 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
                            >
                                Pelajari lebih lanjut
                                <span aria-hidden>→</span>
                            </a>
                        </div>
                    </div>

                    <div className="mt-24">
                        <p className="mb-4 text-xs text-white/80">Digunakan oleh LPM, Fakultas, dan Program Studi di lingkungan UMRAH</p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-lg border border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                                <div className="text-2xl font-semibold">7</div>
                                <div className="text-xs opacity-80">Unit</div>
                            </div>
                            <div className="rounded-lg border border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                                <div className="text-2xl font-semibold">6</div>
                                <div className="text-xs opacity-80">Fakultas</div>
                            </div>
                            <div className="rounded-lg border border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                                <div className="text-2xl font-semibold">10</div>
                                <div className="text-xs opacity-80">Jurusan</div>
                            </div>
                            <div className="rounded-lg border border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm">
                                <div className="text-2xl font-semibold">40</div>
                                <div className="text-xs opacity-80">Program Studi</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

