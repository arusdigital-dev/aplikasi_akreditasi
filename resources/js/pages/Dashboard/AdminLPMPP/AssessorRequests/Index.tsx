import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';

interface RequestItem {
  id: string;
  prodi: string;
  fakultas: string;
  criterion: string;
  program: string;
  scope_category?: string;
  preferred_assessor_email?: string;
  requested_by: string;
  status: string;
  created_at: string;
}

interface Props {
  requests: {
    data: RequestItem[];
    links: any[];
    meta: any;
  };
  filters: { status?: string };
}

export default function AssessorRequestsIndex({ requests, filters }: Props) {
  return (
    <DashboardLayout title="Permintaan Penunjukan Asesor" subtitle="Tinjau dan proses permintaan dari Kaprodi">
      <Head title="Permintaan Penunjukan Asesor" />
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <select
            value={filters.status || ''}
            onChange={(e) => {
              router.get(route('admin-lpmpp.assessor-requests.index'), { status: e.target.value });
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Waktu</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Prodi</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fakultas</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Program</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Kriteria</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Kategori</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email Asesor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Pemohon</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.data.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.created_at}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.prodi}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.fakultas}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.program}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.criterion}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.scope_category || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.preferred_assessor_email || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.requested_by}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {item.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-xs"
                          onClick={() => router.post(route('admin-lpmpp.assessor-requests.approve', item.id))}
                        >
                          Setujui
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded-md text-xs"
                          onClick={() => router.post(route('admin-lpmpp.assessor-requests.reject', item.id))}
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

