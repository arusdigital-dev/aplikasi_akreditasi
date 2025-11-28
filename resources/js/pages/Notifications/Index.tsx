import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useState } from 'react';

interface Notification {
    id: string;
    type: string;
    channel: string;
    title: string;
    message: string;
    data: Record<string, any> | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    unit: {
        id: string;
        name: string;
    } | null;
}

interface NotificationType {
    value: string;
    label: string;
}

interface NotificationChannel {
    value: string;
    label: string;
}

interface Props {
    notifications: {
        data: Notification[];
        links: any;
        meta: any;
    };
    unreadCount: number;
    filters: {
        filter?: string;
        type?: string;
        channel?: string;
    };
    types: NotificationType[];
    channels: NotificationChannel[];
}

export default function NotificationsIndex({ notifications, unreadCount, filters, types, channels }: Props) {
    const { data, setData, get } = useForm({
        filter: filters.filter || '',
        type: filters.type || '',
        channel: filters.channel || '',
    });

    const handleFilter = () => {
        get(route('notifications.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMarkAsRead = (id: string) => {
        router.post(route('notifications.read', id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.post(route('notifications.read-all'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getTypeColor = (type: string): string => {
        if (type.includes('deadline')) {
            return 'bg-orange-100 text-orange-800';
        }
        if (type.includes('rejected')) {
            return 'bg-red-100 text-red-800';
        }
        if (type.includes('evaluation')) {
            return 'bg-yellow-100 text-yellow-800';
        }
        if (type.includes('broadcast') || type.includes('schedule') || type.includes('policy')) {
            return 'bg-blue-100 text-blue-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'email':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'whatsapp':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
        }
    };

    return (
        <DashboardLayout title="Notifikasi" subtitle={`${unreadCount} notifikasi belum dibaca`}>
            <Head title="Notifikasi" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={data.filter}
                                onChange={(e) => setData('filter', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Semua</option>
                                <option value="unread">Belum Dibaca</option>
                                <option value="read">Sudah Dibaca</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipe
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Semua Tipe</option>
                                {types.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Channel
                            </label>
                            <select
                                value={data.channel}
                                onChange={(e) => setData('channel', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Semua Channel</option>
                                {channels.map((channel) => (
                                    <option key={channel.value} value={channel.value}>
                                        {channel.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Filter
                            </button>
                            {(data.filter || data.type || data.channel) && (
                                <button
                                    onClick={() => {
                                        setData({
                                            filter: '',
                                            type: '',
                                            channel: '',
                                        });
                                        setTimeout(handleFilter, 100);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {unreadCount > 0 && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Tandai Semua Sudah Dibaca
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {notifications.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada notifikasi</h3>
                            <p className="mt-1 text-sm text-gray-500">Semua notifikasi Anda akan muncul di sini.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {notifications.data.map((notification) => (
                                <li
                                    key={notification.id}
                                    className={`p-6 hover:bg-gray-50 transition-colors ${
                                        !notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                                                    {types.find((t) => t.value === notification.type)?.label || notification.type}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    {getChannelIcon(notification.channel)}
                                                    {channels.find((c) => c.value === notification.channel)?.label || notification.channel}
                                                </span>
                                                {!notification.is_read && (
                                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                )}
                                            </div>
                                            <h3 className={`text-lg font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                                                {notification.message}
                                            </p>
                                            {notification.data && Object.keys(notification.data).length > 0 && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Detail:</h4>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {Object.entries(notification.data).map(([key, value]) => (
                                                            <li key={key}>
                                                                <strong>{key.replace(/_/g, ' ')}:</strong>{' '}
                                                                {Array.isArray(value) ? value.join(', ') : String(value)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                                {notification.unit && (
                                                    <span>Unit: {notification.unit.name}</span>
                                                )}
                                                <span>{new Date(notification.created_at).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                                            >
                                                Tandai Dibaca
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Pagination */}
                    {notifications.links && notifications.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {notifications.meta.from} sampai {notifications.meta.to} dari {notifications.meta.total} notifikasi
                                </div>
                                <div className="flex gap-2">
                                    {notifications.links.map((link: any, index: number) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-md ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

