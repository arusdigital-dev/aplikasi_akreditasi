import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import CoordinatorSidebar from './CoordinatorSidebar';

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const { auth } = usePage().props as {
        auth?: {
            user?: { name: string; email: string; avatar?: string } | null;
            role?: string;
            isAdmin?: boolean;
            isCoordinator?: boolean;
        } | null;
    };

    // Determine which sidebar to use
    const isCoordinator = auth?.isCoordinator ?? false;
    const userRole = auth?.role ?? '';

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {isCoordinator ? <CoordinatorSidebar /> : <Sidebar />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                            {auth?.user && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-gray-600 font-medium">
                                            {auth.user.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{auth.user.name}</div>
                                        <div className="text-xs text-gray-500">{userRole || 'User'}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 min-h-0">{children}</main>
            </div>
        </div>
    );
}

