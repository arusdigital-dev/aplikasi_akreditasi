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
                    <div className="animate-fade-in">
                        <p className="mb-3 text-sm opacity-90">Satu Platform untuk Dokumen & Akreditasi UMRAH</p>
                        <h1 className="mx-auto mb-6 max-w-3xl text-3xl font-semibold leading-relaxed opacity-95">
                            Kelola dokumen, tugas akreditasi, dan statistik penilaian secara terintegrasi untuk LPM, Koordinator Prodi, Assessor, dan Pimpinan Universitas.
                        </h1>
                        <div className="mb-2 flex items-center justify-center gap-4">
                            <a
                                href="/login"
                                className="inline-block rounded-md bg-[#2563EB] px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#1E4ED0] transition-all duration-300 hover-scale hover-glow"
                            >
                                Masuk dengan Akun UMRAH
                            </a>
                            <a
                                href="#fitur"
                                className="inline-flex items-center gap-2 rounded-md border border-white/70 px-6 py-2 text-sm font-medium text-white/90 hover:bg-white/10 transition-all duration-300 hover-scale"
                            >
                                Pelajari lebih lanjut
                                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                            </a>
                        </div>
                    </div>

                    <div className="mt-24 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <p className="mb-4 text-xs text-white/80">Digunakan oleh LPM, Fakultas, dan Program Studi di lingkungan UMRAH</p>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[
                                { value: '7', label: 'Unit' },
                                { value: '6', label: 'Fakultas' },
                                { value: '10', label: 'Jurusan' },
                                { value: '40', label: 'Program Studi' },
                            ].map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className="rounded-lg border border-white/30 bg-white/10 px-6 py-4 backdrop-blur-sm hover-scale hover-glow transition-all duration-300 cursor-pointer animate-scale-in"
                                    style={{ animationDelay: `${0.4 + index * 0.1}s`, opacity: 0 }}
                                >
                                    <div className="text-2xl font-semibold">{stat.value}</div>
                                    <div className="text-xs opacity-80">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

