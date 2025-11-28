<?php

namespace App\Console\Commands;

use App\Models\Assignment;
use App\Models\AssignmentStatus;
use App\Models\Notification;
use App\Models\NotificationType;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendDeadlineReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:send-deadline-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send deadline reminder notifications for assignments';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService): int
    {
        $this->info('Checking for assignments with upcoming deadlines...');

        $today = Carbon::today();
        $reminderDays = [7, 3, 0]; // 7 days, 3 days, and today

        $sentCount = 0;

        foreach ($reminderDays as $days) {
            $targetDate = $today->copy()->addDays($days);

            // Get assignments with deadline on target date
            $assignments = Assignment::query()
                ->whereNotNull('deadline')
                ->whereDate('deadline', $targetDate)
                ->whereNull('unassigned_at')
                ->where('status', '!=', AssignmentStatus::Completed)
                ->with(['assessor', 'unit', 'criterion.standard.program'])
                ->get();

            foreach ($assignments as $assignment) {
                // Check if notification already sent for this deadline reminder
                $notificationType = match ($days) {
                    7 => NotificationType::DeadlineReminder7Days,
                    3 => NotificationType::DeadlineReminder3Days,
                    0 => NotificationType::DeadlineReminderToday,
                    default => null,
                };

                if (! $notificationType) {
                    continue;
                }

                // Check if notification already sent today
                $alreadySent = Notification::where('user_id', $assignment->assessor_id)
                    ->where('type', $notificationType->value)
                    ->whereJsonContains('data->assignment_id', $assignment->id)
                    ->whereDate('created_at', $today)
                    ->exists();

                if ($alreadySent) {
                    continue;
                }

                // Get unit users if assignment is for a unit
                if ($assignment->unit_id) {
                    $unit = $assignment->unit;
                    $users = $unit->usersWithRoles()->get();

                    foreach ($users as $user) {
                        $programName = $assignment->criterion?->standard?->program?->name ?? 'N/A';
                        $documentName = $assignment->criterion
                            ? "{$assignment->criterion->name} - {$programName}"
                            : 'Dokumen Penugasan';

                        $notificationService->sendDeadlineReminder(
                            user: $user,
                            daysUntilDeadline: $days,
                            deadlineDate: Carbon::parse($assignment->deadline)->format('d F Y'),
                            documentName: $documentName,
                            unitName: $unit->name,
                            assignmentId: $assignment->id
                        );

                        $sentCount++;
                    }
                } elseif ($assignment->assessor_id) {
                    // Send to assessor
                    $user = $assignment->assessor;
                    $programName = $assignment->criterion?->standard?->program?->name ?? 'N/A';
                    $documentName = $assignment->criterion
                        ? "{$assignment->criterion->name} - {$programName}"
                        : 'Dokumen Penugasan';

                    $notificationService->sendDeadlineReminder(
                        user: $user,
                        daysUntilDeadline: $days,
                        deadlineDate: Carbon::parse($assignment->deadline)->format('d F Y'),
                        documentName: $documentName,
                        assignmentId: $assignment->id
                    );

                    $sentCount++;
                }
            }
        }

        // Check for overdue assignments
        $overdueAssignments = Assignment::query()
            ->whereNotNull('deadline')
            ->whereDate('deadline', '<', $today)
            ->whereNull('unassigned_at')
            ->where('status', '!=', AssignmentStatus::Completed)
            ->with(['assessor', 'unit', 'criterion.standard.program'])
            ->get();

        foreach ($overdueAssignments as $assignment) {
            // Check if notification already sent today for overdue
            $alreadySent = Notification::where('user_id', $assignment->assessor_id)
                ->where('type', NotificationType::DeadlineReminderOverdue->value)
                ->whereJsonContains('data->assignment_id', $assignment->id)
                ->whereDate('created_at', $today)
                ->exists();

            if ($alreadySent) {
                continue;
            }

            if ($assignment->unit_id) {
                $unit = $assignment->unit;
                $users = $unit->usersWithRoles()->get();

                foreach ($users as $user) {
                    $daysOverdue = $today->diffInDays($assignment->deadline);
                    $programName = $assignment->criterion?->standard?->program?->name ?? 'N/A';
                    $documentName = $assignment->criterion
                        ? "{$assignment->criterion->name} - {$programName}"
                        : 'Dokumen Penugasan';

                    $notificationService->sendDeadlineReminder(
                        user: $user,
                        daysUntilDeadline: -$daysOverdue,
                        deadlineDate: Carbon::parse($assignment->deadline)->format('d F Y'),
                        documentName: $documentName,
                        unitName: $unit->name,
                        assignmentId: $assignment->id
                    );

                    $sentCount++;
                }
            } elseif ($assignment->assessor_id) {
                $user = $assignment->assessor;
                $daysOverdue = $today->diffInDays($assignment->deadline);
                $programName = $assignment->criterion?->standard?->program?->name ?? 'N/A';
                $documentName = $assignment->criterion
                    ? "{$assignment->criterion->name} - {$programName}"
                    : 'Dokumen Penugasan';

                $notificationService->sendDeadlineReminder(
                    user: $user,
                    daysUntilDeadline: -$daysOverdue,
                    deadlineDate: Carbon::parse($assignment->deadline)->format('d F Y'),
                    documentName: $documentName,
                    assignmentId: $assignment->id
                );

                $sentCount++;
            }
        }

        $this->info("Sent {$sentCount} deadline reminder notifications.");

        return self::SUCCESS;
    }
}
