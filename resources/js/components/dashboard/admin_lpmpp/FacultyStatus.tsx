interface FacultyStatusItem {
    name: string;
    completion_percentage: number;
    status_color: string;
    criteria_fulfilled: number;
    total_criteria: number;
    pending_documents: number;
    rejected_documents: number;
}

interface FacultyStatusProps {
    facultyStatus: FacultyStatusItem[];
}

export default function FacultyStatus({ facultyStatus }: FacultyStatusProps) {
    const getStatusColor = (color: string): string => {
        switch (color) {
            case 'green':
                return 'bg-green-500';
            case 'yellow':
                return 'bg-yellow-500';
            case 'orange':
                return 'bg-orange-500';
            case 'red':
            default:
                return 'bg-red-500';
        }
    };

    const getStatusLabel = (percentage: number): string => {
        if (percentage >= 90) {
            return 'Unggul';
        }
        if (percentage >= 75) {
            return 'Sangat Baik';
        }
        if (percentage >= 50) {
            return 'Baik';
        }
        return 'Kurang';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Status per Fakultas</h2>
            </div>

            <div className="space-y-4">
                {facultyStatus.length > 0 ? (
                    facultyStatus.map((faculty, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${getStatusColor(faculty.status_color)}`}></div>
                                    <h3 className="font-semibold text-gray-900">{faculty.name}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{faculty.completion_percentage.toFixed(1)}%</p>
                                    <p className="text-xs text-gray-500">{getStatusLabel(faculty.completion_percentage)}</p>
                                </div>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div
                                    className={`h-2 rounded-full transition-all ${getStatusColor(faculty.status_color)}`}
                                    style={{ width: `${Math.min(faculty.completion_percentage, 100)}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Kriteria Terpenuhi</p>
                                    <p className="font-semibold text-gray-900">
                                        {faculty.criteria_fulfilled} / {faculty.total_criteria}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Dokumen Pending</p>
                                    <p className="font-semibold text-gray-900">{faculty.pending_documents}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Dokumen Ditolak</p>
                                    <p className="font-semibold text-red-600">{faculty.rejected_documents}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">Belum ada data fakultas</div>
                )}
            </div>
        </div>
    );
}

