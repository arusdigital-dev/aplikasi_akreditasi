import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm } from '@inertiajs/react';
import { route } from '@/lib/route';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    status: string;
    sent_at: string | null;
    user: {
        name: string;
    } | null;
    unit: {
        name: string;
    } | null;
}

interface Props {
    notifications: {
        data: Notification[];
        links: any[];
        meta: any;
    };
    filters: {
        type?: string;
        unit_id?: string;
        status?: string;
    };
}

export default function NotificationsIndex({ notifications, filters }: Props) {
    const { data, setData, post, processing } = useForm({
        assignment_id: '',
        unit_id: '',
        days_before: '7',
        message: '',
    });

    const { data: broadcastData, setData: setBroadcastData, post: postBroadcast, processing: broadcastProcessing } = useForm({
        unit_ids: [] as string[],
        type: 'broadcast_lpmpp',
        title: '',
        message: '',
        channels: ['in_app'] as string[],
    });

    const handleSendReminder = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-lpmpp.notifications.send-reminder'));
    };

    const handleSendBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        postBroadcast(route('admin-lpmpp.notifications.send-broadcast'));
    };

    return (
        <>
            <Head title="Notifikasi" />
            <DashboardLayout title="Notifikasi" subtitle="Kelola notifikasi otomatis dan broadcast">
                <div className="space-y-6">
                    {/* Send Reminder */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kirim Pengingat Deadline</h2>
                        <form onSubmit={handleSendReminder} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit ID</label>
                                    <input
                                        type="text"
                                        value={data.unit_id}
                                        onChange={(e) => setData('unit_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        placeholder="Opsional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hari Sebelum Deadline</label>
                                    <select
                                        value={data.days_before}
                                        onChange={(e) => setData('days_before', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="0">Hari Ini</option>
                                        <option value="3">3 Hari</option>
                                        <option value="7">7 Hari</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Mengirim...' : 'Kirim Pengingat'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Send Broadcast */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kirim Broadcast</h2>
                        <form onSubmit={handleSendBroadcast} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul</label>
                                <input
                                    type="text"
                                    value={broadcastData.title}
                                    onChange={(e) => setBroadcastData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pesan</label>
                                <textarea
                                    value={broadcastData.message}
                                    onChange={(e) => setBroadcastData('message', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={broadcastProcessing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {broadcastProcessing ? 'Mengirim...' : 'Kirim Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Notifications List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <h2 className="text-lg font-semibold text-gray-900 p-6 border-b">Daftar Notifikasi</h2>
                        <div className="divide-y divide-gray-200">
                            {notifications.data.length === 0 ? (
                                <p className="p-6 text-center text-gray-500">Tidak ada notifikasi</p>
                            ) : (
                                notifications.data.map((notification) => (
                                    <div key={notification.id} className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                                                <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {notification.user?.name} - {notification.unit?.name}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded ${
                                                    notification.status === 'sent'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {notification.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}

