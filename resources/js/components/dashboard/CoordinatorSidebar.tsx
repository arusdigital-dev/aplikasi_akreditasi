/**
 * Komponen Sidebar untuk Koordinator Prodi
 * 
 * Komponen ini menampilkan navigasi sidebar untuk dashboard koordinator prodi.
 * Berisi menu-menu utama seperti Dashboard, Dokumen, Laporan, Akreditasi, dll.
 */

import { Link, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/route';

export default function CoordinatorSidebar() {
    const page = usePage();
    const { auth } = page.props as { auth?: { user?: { name: string; email: string; avatar?: string } | null; role?: string } | null };
    const currentUrl = page.url;

    /**
     * Fungsi untuk mengecek apakah route sedang aktif
     * @param href - URL path yang akan dicek
     * @returns boolean - true jika route aktif, false jika tidak
     */
    const isActive = (href: string): boolean => {
        // Cek khusus untuk halaman dashboard utama
        if (href === '/coordinator-prodi') {
            return currentUrl === '/coordinator-prodi';
        }

        // Cek khusus untuk halaman dokumen (hindari match dengan create)
        if (href === '/coordinator-prodi/documents') {
            return currentUrl === '/coordinator-prodi/documents' ||
                (currentUrl.startsWith('/coordinator-prodi/documents/') &&
                    !currentUrl.startsWith('/coordinator-prodi/documents/create'));
        }

        // Cek khusus untuk route akreditasi (semua route akreditasi dianggap aktif untuk simulasi)
        if (href === '/coordinator-prodi/accreditation/simulation') {
            return currentUrl.startsWith('/coordinator-prodi/accreditation') &&
                !currentUrl.startsWith('/coordinator-prodi/accreditation/lkps');
        }

        // Cek umum untuk route lainnya
        return currentUrl.startsWith(href);
    };

    /**
     * Handler untuk logout
     * Mengirim POST request ke endpoint logout
     */
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen flex-shrink-0">
            {/* Header Logo */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <div className="font-semibold text-gray-900 text-m">Aplikasi Akreditasi</div>
                        <div className="text-xs text-gray-500">UMRAH</div>
                    </div>
                </div>
            </div>

            {/* Navigasi Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-x-hidden">
                {/* Menu Dashboard */}
                <Link
                    href={route('coordinator-prodi.index')}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                        isActive('/coordinator-prodi')
                            ? 'text-white bg-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </Link>

                {/* Section: Akreditasi */}
                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Akreditasi
                    </div>
                    <Link
                        href={route('coordinator-prodi.accreditation.simulation')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/accreditation/simulation')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Simulasi Akreditasi
                    </Link>
                    <Link
                        href={route('coordinator-prodi.accreditation.lkps')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/accreditation/lkps')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        LKPS
                    </Link>
                </div>

                {/* Section: Referensi */}
                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Referensi
                    </div>
                    <Link
                        href="/coordinator-prodi/criteria-points"
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/criteria-points')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Poin Kriteria
                    </Link>
                    <Link
                        href={`${route('coordinator-prodi.standards')}?program_id=`}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/standards')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Standar Akreditasi
                    </Link>
                </div>

                {/* Section: Pengaturan */}
                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Pengaturan
                    </div>
                    <Link
                        href={route('coordinator-prodi.targets.index')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/targets')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Target Akreditasi
                    </Link>
                    <Link
                        href={route('notifications.index')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/notifications')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifikasi
                    </Link>
                </div>
            </nav>

            {/* Footer: Tombol Logout */}
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