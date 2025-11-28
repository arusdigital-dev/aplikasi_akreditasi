interface SummaryCardProps {
    totalFakultas: number;
    totalProdi: number;
    totalUnits: number;
    readinessStatus: {
        unggul: number;
        sangat_baik: number;
        baik: number;
        kurang: number;
    };
}

export default function SummaryCard({
    totalFakultas,
    totalProdi,
    totalUnits,
    readinessStatus,
}: SummaryCardProps) {
    const totalPrograms = readinessStatus.unggul + readinessStatus.sangat_baik + readinessStatus.baik + readinessStatus.kurang;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Progress Akreditasi</h2>

            {/* At a Glance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Fakultas</p>
                            <p className="text-2xl font-bold text-gray-900">{totalFakultas}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Prodi</p>
                            <p className="text-2xl font-bold text-gray-900">{totalProdi}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Unit</p>
                            <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Readiness */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Readiness</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Unggul</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{readinessStatus.unggul}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {totalPrograms > 0 ? Math.round((readinessStatus.unggul / totalPrograms) * 100) : 0}% dari total
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Sangat Baik</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{readinessStatus.sangat_baik}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {totalPrograms > 0 ? Math.round((readinessStatus.sangat_baik / totalPrograms) * 100) : 0}% dari total
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Baik</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{readinessStatus.baik}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {totalPrograms > 0 ? Math.round((readinessStatus.baik / totalPrograms) * 100) : 0}% dari total
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Kurang</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{readinessStatus.kurang}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {totalPrograms > 0 ? Math.round((readinessStatus.kurang / totalPrograms) * 100) : 0}% dari total
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

