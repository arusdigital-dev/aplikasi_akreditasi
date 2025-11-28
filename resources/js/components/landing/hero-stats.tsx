export default function HeroStats() {
    return (
        <div>
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
    );
}
