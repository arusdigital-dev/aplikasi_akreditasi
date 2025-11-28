<?php

namespace App\Services;

use App\Jobs\SendEmailNotification;
use App\Jobs\SendWhatsAppNotification;
use App\Models\Notification;
use App\Models\NotificationChannel;
use App\Models\NotificationType;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Send notification to a single user.
     */
    public function sendToUser(
        User $user,
        NotificationType $type,
        string $title,
        string $message,
        array $data = [],
        array $channels = [NotificationChannel::InApp, NotificationChannel::Email]
    ): Collection {
        $notifications = collect();

        foreach ($channels as $channel) {
            $notification = Notification::create([
                'type' => $type,
                'channel' => $channel,
                'user_id' => $user->id,
                'unit_id' => $user->unit_id,
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'status' => 'pending',
            ]);

            $notifications->push($notification);

            // Dispatch job based on channel
            match ($channel) {
                NotificationChannel::Email => SendEmailNotification::dispatch($notification),
                NotificationChannel::WhatsApp => SendWhatsAppNotification::dispatch($notification),
                NotificationChannel::InApp => $notification->markAsSent(), // In-app is immediate
            };
        }

        return $notifications;
    }

    /**
     * Send notification to all users in a unit.
     */
    public function sendToUnit(
        Unit $unit,
        NotificationType $type,
        string $title,
        string $message,
        array $data = [],
        array $channels = [NotificationChannel::InApp, NotificationChannel::Email]
    ): Collection {
        $users = $unit->usersWithRoles()->get();
        $notifications = collect();

        foreach ($users as $user) {
            $userNotifications = $this->sendToUser($user, $type, $title, $message, $data, $channels);
            $notifications = $notifications->merge($userNotifications);
        }

        return $notifications;
    }

    /**
     * Send deadline reminder notification.
     */
    public function sendDeadlineReminder(
        User $user,
        int $daysUntilDeadline,
        string $deadlineDate,
        string $documentName,
        ?string $unitName = null,
        ?int $assignmentId = null
    ): Collection {
        $type = match (true) {
            $daysUntilDeadline === 0 => NotificationType::DeadlineReminderToday,
            $daysUntilDeadline <= 3 && $daysUntilDeadline > 0 => NotificationType::DeadlineReminder3Days,
            $daysUntilDeadline <= 7 && $daysUntilDeadline > 0 => NotificationType::DeadlineReminder7Days,
            default => NotificationType::DeadlineReminderOverdue,
        };

        $title = match ($type) {
            NotificationType::DeadlineReminderToday => 'Deadline Pengumpulan Dokumen - Hari Ini',
            NotificationType::DeadlineReminder3Days => 'Pengingat Deadline - 3 Hari Lagi',
            NotificationType::DeadlineReminder7Days => 'Pengingat Deadline - 7 Hari Lagi',
            default => 'Pengingat Deadline - Terlambat',
        };

        $message = sprintf(
            'Deadline pengumpulan dokumen "%s" %s. Deadline: %s%s',
            $documentName,
            match ($type) {
                NotificationType::DeadlineReminderToday => 'adalah hari ini',
                NotificationType::DeadlineReminder3Days => 'tinggal 3 hari lagi',
                NotificationType::DeadlineReminder7Days => 'tinggal 7 hari lagi',
                default => 'sudah terlambat',
            },
            $deadlineDate,
            $unitName ? " untuk {$unitName}" : ''
        );

        $data = [
            'deadline_date' => $deadlineDate,
            'days_until_deadline' => $daysUntilDeadline,
            'document_name' => $documentName,
            'unit_name' => $unitName,
        ];

        if ($assignmentId) {
            $data['assignment_id'] = $assignmentId;
        }

        return $this->sendToUser(
            $user,
            $type,
            $title,
            $message,
            $data
        );
    }

    /**
     * Send document rejected notification.
     */
    public function sendDocumentRejected(
        User $user,
        string $documentName,
        string $rejectionReason,
        string $resubmissionDeadline,
        array $requiredFixes = []
    ): Collection {
        $message = sprintf(
            "Dokumen \"%s\" Anda ditolak.\n\nAlasan: %s\n\nPerbaikan yang diperlukan:\n%s\n\nDeadline resubmission: %s",
            $documentName,
            $rejectionReason,
            empty($requiredFixes) ? '- Silakan perbaiki sesuai alasan penolakan' : implode("\n", array_map(fn ($fix) => "- {$fix}", $requiredFixes)),
            $resubmissionDeadline
        );

        return $this->sendToUser(
            $user,
            NotificationType::DocumentRejected,
            'Dokumen Ditolak',
            $message,
            [
                'document_name' => $documentName,
                'rejection_reason' => $rejectionReason,
                'resubmission_deadline' => $resubmissionDeadline,
                'required_fixes' => $requiredFixes,
            ]
        );
    }

    /**
     * Send evaluation incomplete notification.
     */
    public function sendEvaluationIncomplete(
        User $user,
        string $assignmentTitle,
        bool $isAssessor = true
    ): Collection {
        $type = $isAssessor
            ? NotificationType::EvaluationIncompleteAssessor
            : NotificationType::EvaluationIncompleteCoordinator;

        $role = $isAssessor ? 'Asesor' : 'Koordinator Prodi';

        $message = sprintf(
            'Penilaian untuk "%s" belum lengkap. Silakan lengkapi penilaian Anda sebagai %s.',
            $assignmentTitle,
            $role
        );

        return $this->sendToUser(
            $user,
            $type,
            'Penilaian Belum Lengkap',
            $message,
            [
                'assignment_title' => $assignmentTitle,
                'role' => $role,
            ]
        );
    }

    /**
     * Send LPMPP broadcast notification.
     */
    public function sendBroadcast(
        Unit|Collection $units,
        NotificationType $type,
        string $title,
        string $message,
        array $data = []
    ): Collection {
        $notifications = collect();

        $unitsToNotify = $units instanceof Collection ? $units : collect([$units]);

        foreach ($unitsToNotify as $unit) {
            $unitNotifications = $this->sendToUnit($unit, $type, $title, $message, $data);
            $notifications = $notifications->merge($unitNotifications);
        }

        return $notifications;
    }

    /**
     * Send accreditation schedule notification.
     */
    public function sendAccreditationSchedule(
        Unit $unit,
        string $scheduleDate,
        string $scheduleTime,
        string $location
    ): Collection {
        $message = sprintf(
            "Jadwal akreditasi untuk %s:\n\nTanggal: %s\nWaktu: %s\nLokasi: %s\n\nSilakan persiapkan dokumen yang diperlukan.",
            $unit->name,
            $scheduleDate,
            $scheduleTime,
            $location
        );

        return $this->sendBroadcast(
            $unit,
            NotificationType::AccreditationSchedule,
            'Jadwal Akreditasi',
            $message,
            [
                'schedule_date' => $scheduleDate,
                'schedule_time' => $scheduleTime,
                'location' => $location,
            ]
        );
    }

    /**
     * Send policy update notification.
     */
    public function sendPolicyUpdate(
        Unit|Collection $units,
        string $policyTitle,
        string $policyDescription,
        ?string $policyUrl = null
    ): Collection {
        $message = sprintf(
            "Pembaruan kebijakan LPMPP:\n\n%s\n\n%s%s",
            $policyTitle,
            $policyDescription,
            $policyUrl ? "\n\nDetail lengkap: {$policyUrl}" : ''
        );

        return $this->sendBroadcast(
            $units,
            NotificationType::PolicyUpdate,
            'Pembaruan Kebijakan LPMPP',
            $message,
            [
                'policy_title' => $policyTitle,
                'policy_description' => $policyDescription,
                'policy_url' => $policyUrl,
            ]
        );
    }
}
