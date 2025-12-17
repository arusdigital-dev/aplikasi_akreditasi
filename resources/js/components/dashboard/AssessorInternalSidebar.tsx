import { Link, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/route';

export default function AssessorInternalSidebar() {
    const page = usePage();
    const { auth } = page.props as { auth?: { user?: { name: string; email: string; avatar?: string } | null; role?: string } | null };
    const currentUrl = page.url;

    const isActive = (href: string): boolean => {
        if (href === '/assessor-internal') {
            return currentUrl === '/assessor-internal' || currentUrl === '/assessor-internal/';
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
                    href={route('assessor-internal.index')}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                        isActive('/assessor-internal')
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
                        Evaluasi
                    </div>
                    <Link
                        href={route('assessor-internal.accreditation-assignments.index')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/assessor-internal/accreditation-assignments')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 10h14M3 13h18M5 16h14M7 19h10" />
                        </svg>
                        Penugasan Akreditasi (LAM)
                    </Link>
                    <Link
                        href={route('assessor-internal.assignments.index')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/assessor-internal/assignments')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Poin Penilaian
                    </Link>
                    <Link
                        href={route('assessor-internal.evaluation-documents.index')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/assessor-internal/evaluation-documents')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Daftar Dokumen Evaluasi
                    </Link>
                </div>

                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Statistik
                    </div>
                    <Link
                        href={route('assessor-internal.statistics.per-program')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/assessor-internal/statistics/per-program')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Statistik Per Prodi
                    </Link>
                    <Link
                        href={route('assessor-internal.statistics.per-criterion')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/assessor-internal/statistics/per-criterion')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        Statistik Per Kriteria
                    </Link>
                    <Link
                        href={route('assessor-internal.statistics.progress')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/assessor-internal/statistics/progress')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Progress Individu
                    </Link>
                </div>

                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Simulasi
                    </div>
                    <Link
                        href={route('assessor-internal.simulation')}
                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                            isActive('/assessor-internal/simulation')
                                ? 'text-white bg-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Simulasi Akreditasi
                    </Link>
                </div>

                <div className="pt-4">
                    <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Lainnya
                    </div>
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
