<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationChannel;
use App\Models\NotificationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $query = Notification::query()
            ->where('user_id', $user->id)
            ->with(['unit'])
            ->orderBy('created_at', 'desc');

        // Filter by read status
        if ($request->has('filter') && $request->filter === 'unread') {
            $query->where('is_read', false);
        } elseif ($request->has('filter') && $request->filter === 'read') {
            $query->where('is_read', true);
        }

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filter by channel
        if ($request->has('channel') && $request->channel) {
            $query->where('channel', $request->channel);
        }

        $notifications = $query->paginate(20);

        // Get unread count
        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'filters' => [
                'filter' => $request->filter,
                'type' => $request->type,
                'channel' => $request->channel,
            ],
            'types' => collect(NotificationType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ]),
            'channels' => collect(NotificationChannel::cases())->map(fn ($channel) => [
                'value' => $channel->value,
                'label' => $channel->label(),
            ]),
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(string $id): \Illuminate\Http\RedirectResponse
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);

        $notification->markAsRead();

        return redirect()->back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): \Illuminate\Http\RedirectResponse
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return redirect()->back();
    }

    /**
     * Get unread notifications count (for API/header).
     */
    public function unreadCount(): \Illuminate\Http\JsonResponse
    {
        $count = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get recent notifications (for dropdown/header).
     */
    public function recent(): \Illuminate\Http\JsonResponse
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type->value,
                    'is_read' => $notification->is_read,
                    'created_at' => $notification->created_at->diffForHumans(),
                ];
            });

        return response()->json($notifications);
    }
}
