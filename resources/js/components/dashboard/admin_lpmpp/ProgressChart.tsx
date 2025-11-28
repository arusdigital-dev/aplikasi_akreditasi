interface ProgressChartProps {
    progressChartData: Array<{
        date: string;
        count: number;
    }>;
    documentCompleteness: {
        lengkap: number;
        belum_lengkap: number;
        salah_format: number;
        expired: number;
    };
}

export default function ProgressChart({ progressChartData, documentCompleteness }: ProgressChartProps) {
    const maxCount = Math.max(...progressChartData.map((d) => d.count), 1);

    const totalDocuments = documentCompleteness.lengkap + documentCompleteness.belum_lengkap + documentCompleteness.salah_format + documentCompleteness.expired;

    const getPercentage = (value: number): number => {
        return totalDocuments > 0 ? (value / totalDocuments) * 100 : 0;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line/Bar Chart - Progress per Hari */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Perkembangan Pengumpulan Dokumen</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {progressChartData.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                                <div
                                    className="w-full bg-blue-600 rounded-t-lg transition-all"
                                    style={{
                                        height: `${(data.count / maxCount) * 100}%`,
                                        minHeight: data.count > 0 ? '4px' : '0',
                                    }}
                                />
                                {data.count > 0 && (
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                                        {data.count}
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 mt-2 text-center">{data.date}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pie Chart - Kelengkapan Dokumen */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kelengkapan Dokumen</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Sudah Lengkap</span>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{documentCompleteness.lengkap}</p>
                            <p className="text-xs text-gray-500">{getPercentage(documentCompleteness.lengkap).toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Belum Lengkap</span>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{documentCompleteness.belum_lengkap}</p>
                            <p className="text-xs text-gray-500">{getPercentage(documentCompleteness.belum_lengkap).toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Salah Format</span>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{documentCompleteness.salah_format}</p>
                            <p className="text-xs text-gray-500">{getPercentage(documentCompleteness.salah_format).toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Expired</span>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{documentCompleteness.expired}</p>
                            <p className="text-xs text-gray-500">{getPercentage(documentCompleteness.expired).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

