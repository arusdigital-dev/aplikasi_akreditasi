import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { router } from '@inertiajs/react';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Document {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    created_at: string;
    uploaded_by: {
        name: string;
    } | null;
    program: {
        name: string;
    } | null;
    unit: {
        name: string;
    } | null;
    assignment: {
        criterion: {
            name: string;
        };
    } | null;
    issue_type: string;
    issue_status: string;
    expired_at: string | null;
    validated_at: string | null;
    rejection_notes: string | null;
}

interface Props {
    documents: Document[];
    grouped: {
        expired?: Document[];
        wrong_format?: Document[];
        not_validated?: Document[];
        other?: Document[];
    };
    filters: {
        issue_type?: string;
        unit_id?: string;
        program_id?: string;
    };
}

export default function ProblemDocumentsIndex({ documents, grouped, filters }: Props) {
    const [issueType, setIssueType] = useState(filters.issue_type || '');

    const handleFilter = () => {
        router.get(route('admin-lpmpp.problem-documents.index'), {
            issue_type: issueType || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getIssueBadge = (issueType: string) => {
        const badges = {
            expired: 'bg-red-100 text-red-800',
            wrong_format: 'bg-orange-100 text-orange-800',
            not_validated: 'bg-yellow-100 text-yellow-800',
        };
        return badges[issueType as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const getIssueLabel = (issueType: string): string => {
        const labels: Record<string, string> = {
            expired: 'Expired',
            wrong_format: 'Salah Format',
            not_validated: 'Belum Valid',
        };
        return labels[issueType] || issueType;
    };

    return (
        <>
            <Head title="Dokumen Bermasalah" />
            <DashboardLayout title="Dokumen Bermasalah" subtitle="List dokumen expired, salah format, belum valid">
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex gap-4">
                            <select
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm"
                            >
                                <option value="">Semua Masalah</option>
                                <option value="expired">Expired</option>
                                <option value="wrong_format">Salah Format</option>
                                <option value="not_validated">Belum Valid</option>
                            </select>
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-red-600">{grouped.expired?.length || 0}</div>
                            <div className="text-sm text-gray-600">Expired</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-orange-600">{grouped.wrong_format?.length || 0}</div>
                            <div className="text-sm text-gray-600">Salah Format</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-yellow-600">{grouped.not_validated?.length || 0}</div>
                            <div className="text-sm text-gray-600">Belum Valid</div>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        File Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Program
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Unit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Masalah
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Uploaded
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            Tidak ada dokumen bermasalah
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map((doc) => (
                                        <tr key={doc.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {doc.file_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc.program?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc.unit?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${getIssueBadge(doc.issue_type)}`}>
                                                    {getIssueLabel(doc.issue_type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc.created_at 
                                                    ? new Date(doc.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

