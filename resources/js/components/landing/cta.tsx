export default function CTA() {
    return (
        <section className="w-full bg-white" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="rounded-2xl bg-gradient-to-br from-[#0d1a3a] to-[#0b1e37] px-8 py-10 text-center text-white shadow-xl">
                    <p className="mb-2 text-sm opacity-90">Siap Memulai?</p>
                    <p className="mx-auto mb-6 max-w-2xl text-[15px] leading-7 opacity-95">
                        Login sekarang dengan akun Gmail UMRAH Anda dan mulai mengelola dokumen akreditasi dengan lebih efisien.
                    </p>
                    <a
                        href="/login"
                        className="inline-block rounded-lg bg-[#2563EB] px-6 py-2 text-sm font-medium text-white shadow hover:bg-[#1E4ED0]"
                    >
                        Masuk dengan Akun UMRAH
                    </a>
                </div>
            </div>
        </section>
    );
}
