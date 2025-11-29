import { Link, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/route';

export default function CoordinatorSidebar() {
    const page = usePage();
    const { auth } = page.props as { auth?: { user?: { name: string; email: string; avatar?: string } | null; role?: string } | null };
    const currentUrl = page.url;

    const isActive = (href: string): boolean => {
        if (href === '/coordinator-prodi') {
            return currentUrl === '/coordinator-prodi';
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

                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Dokumen
                    </div>
                    <Link
                        href={route('coordinator-prodi.documents.index')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/documents')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Daftar Dokumen
                    </Link>
                    <Link
                        href={route('coordinator-prodi.documents.create')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/documents/create')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Dokumen
                    </Link>
                </div>

                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Laporan & Analisis
                    </div>
                    <Link
                        href={route('coordinator-prodi.reports.completeness')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/reports')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Laporan Kelengkapan
                    </Link>
                    <Link
                        href={route('coordinator-prodi.simulation')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/simulation')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Simulasi Penilaian
                    </Link>
                    <Link
                        href={route('coordinator-prodi.score-recap')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/score-recap')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Rekap Nilai
                    </Link>
                    <Link
                        href={route('coordinator-prodi.statistics.assessment')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/statistics')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Statistik Penilaian
                    </Link>
                </div>

                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Referensi
                    </div>
                    <Link
                        href={`${route('coordinator-prodi.criteria-points')}?program_id=`}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/coordinator-prodi/criteria-points')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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

