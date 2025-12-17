import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useForm } from '@inertiajs/react';
import { route } from '@/lib/route';
import { useState } from 'react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    status: string;
    sent_at: string | null;
    user: {
        name: string;
        email?: string;
    } | null;
    unit: {
        name: string;
    } | null;
    channel?: string;
    data?: Record<string, any>;
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

    const [unitIdsText, setUnitIdsText] = useState('');

    const handleSendReminder = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin-lpmpp.notifications.send-reminder'));
    };

    const handleSendBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        postBroadcast(route('admin-lpmpp.notifications.send-broadcast'));
    };

    const toggleChannel = (ch: string) => {
        const current = broadcastData.channels || [];
        if (current.includes(ch)) {
            setBroadcastData('channels', current.filter((c) => c !== ch));
        } else {
            setBroadcastData('channels', [...current, ch]);
        }
    };

    const renderChannelLabel = (ch?: string) => {
        switch (ch) {
            case 'email':
                return 'Email';
            case 'whatsapp':
                return 'WhatsApp';
            case 'in_app':
                return 'In-App';
            default:
                return 'Unknown';
        }
    };

    const formatNotification = (n: Notification) => {
        const isAssessorAssignment = n.type === 'assessor_assignment';
        const displayTitle = isAssessorAssignment ? 'Penugasan Asesor oleh Admin LPMPP' : n.title;
        const cycleName = n.data?.cycle_name ?? null;
        const displayMessage = isAssessorAssignment
            ? `Admin LPMPP menugaskan Anda sebagai Asesor pada siklus akreditasi${cycleName ? `: ${cycleName}` : ''}.`
            : n.message;
        return { displayTitle, displayMessage };
    };

    return (
        <>
            <Head title="Notifikasi" />
            <DashboardLayout title="Notifikasi" subtitle="Admin LPMPP mengirim pengingat dan broadcast ke unit/asesor">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pesan (opsional)</label>
                                    <input
                                        type="text"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        placeholder="Contoh: Mohon segera selesaikan penilaian."
                                    />
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipe</label>
                                    <select
                                        value={broadcastData.type}
                                        onChange={(e) => setBroadcastData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        required
                                    >
                                        <option value="broadcast_lpmpp">Broadcast LPMPP</option>
                                        <option value="accreditation_schedule">Jadwal Akreditasi</option>
                                        <option value="policy_update">Pembaruan Kebijakan</option>
                                        <option value="document_issue">Dokumen Bermasalah</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit IDs (dipisahkan koma)</label>
                                    <input
                                        type="text"
                                        value={unitIdsText}
                                        onChange={(e) => {
                                            const text = e.target.value;
                                            setUnitIdsText(text);
                                            const arr = text
                                                .split(',')
                                                .map((v) => v.trim())
                                                .filter((v) => v !== '');
                                            setBroadcastData('unit_ids', arr);
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        placeholder="contoh: unit-uuid-1,unit-uuid-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Saluran</label>
                                    <div className="mt-2 flex items-center gap-3">
                                        <label className="inline-flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={broadcastData.channels?.includes('in_app') ?? false}
                                                onChange={() => toggleChannel('in_app')}
                                            />
                                            In-App
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={broadcastData.channels?.includes('email') ?? false}
                                                onChange={() => toggleChannel('email')}
                                            />
                                            Email
                                        </label>
                                        <label className="inline-flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={broadcastData.channels?.includes('whatsapp') ?? false}
                                                onChange={() => toggleChannel('whatsapp')}
                                            />
                                            WhatsApp
                                        </label>
                                    </div>
                                </div>
                            </div>
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
                                                <h3 className="text-sm font-medium text-gray-900">
                                                    {formatNotification(notification).displayTitle}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {formatNotification(notification).displayMessage}
                                                </p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    Penerima: {notification.user?.name}
                                                    {notification.user?.email ? ` (${notification.user.email})` : ''}
                                                    {notification.unit?.name ? ` • Unit: ${notification.unit.name}` : ''}
                                                    {notification.channel ? ` • Kanal: ${renderChannelLabel(notification.channel)}` : ''}
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

