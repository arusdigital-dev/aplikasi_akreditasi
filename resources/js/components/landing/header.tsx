export default function Header() {
    return (
        <header
            className="w-full bg-white shadow-sm border-b border-[#e3e3e0] dark:bg-[#161615] dark:border-[#3E3E3A]"
            style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}
        >
            <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
                <a href="/" className="flex items-center gap-3">
                    <img
                        src="/images/logo.png"
                        alt="Logo Madani"
                        className="h-20 w-20 rounded-lg object-contain p-2"
                    />
                    <span className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold tracking-widest text-[#1b1b18] dark:text-[#EDEDEC]">MADANI</span>
                        <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Aplikasi Akreditasi</span>
                    </span>
                </a>

                <nav className="hidden md:flex items-center gap-8 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                    <a href="#fitur" className="transition-colors hover:text-[#2563EB] dark:hover:text-[#2563EB]">Fitur Utama</a>
                    <a href="#peran" className="transition-colors hover:text-[#2563EB] dark:hover:text-[#2563EB]">Peran Pengguna</a>
                    <a href="#cara-kerja" className="transition-colors hover:text-[#2563EB] dark:hover:text-[#2563EB]">Cara Kerja</a>
                    <a href="#kontak" className="transition-colors hover:text-[#2563EB] dark:hover:text-[#2563EB]">Kontak / Bantuan</a>
                </nav>

                <div className="flex items-center gap-3">
                    <a
                        href="/login"
                        className="inline-block rounded-sm border border-transparent bg-[#2563EB] px-4 py-1.5 text-sm leading-normal text-white hover:bg-[#1E4ED0]"
                    >
                        Masuk
                    </a>
                    <a
                        href="/register"
                        className="inline-block rounded-sm border border-[#2563EB] px-4 py-1.5 text-sm leading-normal text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
                    >
                        Daftar
                    </a>
                </div>
            </div>
        </header>
    );
}
