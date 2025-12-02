import { Link, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/route';

export default function PimpinanSidebar() {
    const page = usePage();
    const currentUrl = page.url;

    const isActive = (href: string): boolean => {
        if (href === '/pimpinan') {
            return currentUrl === '/pimpinan';
        }
        return currentUrl.startsWith(href);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen flex-shrink-0">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <div className="font-semibold text-gray-900 text-m">Aplikasi Akreditasi</div>
                        <div className="text-xs text-gray-500">UMRAH</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-x-hidden">
                <Link
                    href={route('pimpinan.dashboard')}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                        isActive('/pimpinan') && !currentUrl.includes('/rekap-nilai') && !currentUrl.includes('/statistik-penilaian') && !currentUrl.includes('/laporan-eksekutif') && !currentUrl.includes('/insight-kesiapan')
                            ? 'text-white bg-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </Link>
                <Link
                    href={route('pimpinan.rekap-nilai')}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                        isActive('/pimpinan/rekap-nilai')
                            ? 'text-white bg-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Rekap Nilai
                </Link>
                <Link
                    href={route('pimpinan.statistik-penilaian')}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                        isActive('/pimpinan/statistik-penilaian')
                            ? 'text-white bg-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Statistik Penilaian
                </Link>
                <Link
                    href={route('pimpinan.laporan-eksekutif')}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                        isActive('/pimpinan/laporan-eksekutif')
                            ? 'text-white bg-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Laporan Eksekutif
                </Link>
                <Link
                    href={route('pimpinan.insight-kesiapan')}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                        isActive('/pimpinan/insight-kesiapan')
                            ? 'text-white bg-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Insight Kesiapan
                </Link>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                </button>
            </div>
        </aside>
    );
}

