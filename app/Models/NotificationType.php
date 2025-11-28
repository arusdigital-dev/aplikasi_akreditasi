<?php

namespace App\Models;

enum NotificationType: string
{
    case DeadlineReminder7Days = 'deadline_reminder_7_days';
    case DeadlineReminder3Days = 'deadline_reminder_3_days';
    case DeadlineReminderToday = 'deadline_reminder_today';
    case DeadlineReminderOverdue = 'deadline_reminder_overdue';
    case DocumentRejected = 'document_rejected';
    case DocumentResubmissionRequired = 'document_resubmission_required';
    case EvaluationIncomplete = 'evaluation_incomplete';
    case EvaluationIncompleteAssessor = 'evaluation_incomplete_assessor';
    case EvaluationIncompleteCoordinator = 'evaluation_incomplete_coordinator';
    case BroadcastLPMPP = 'broadcast_lpmpp';
    case AccreditationSchedule = 'accreditation_schedule';
    case PolicyUpdate = 'policy_update';
    case DocumentIssue = 'document_issue';

    public function label(): string
    {
        return match ($this) {
            self::DeadlineReminder7Days => 'Pengingat Deadline - 7 Hari',
            self::DeadlineReminder3Days => 'Pengingat Deadline - 3 Hari',
            self::DeadlineReminderToday => 'Pengingat Deadline - Hari Ini',
            self::DeadlineReminderOverdue => 'Pengingat Deadline - Terlambat',
            self::DocumentRejected => 'Dokumen Ditolak',
            self::DocumentResubmissionRequired => 'Perlu Resubmission Dokumen',
            self::EvaluationIncomplete => 'Penilaian Belum Lengkap',
            self::EvaluationIncompleteAssessor => 'Penilaian Belum Lengkap - Asesor',
            self::EvaluationIncompleteCoordinator => 'Penilaian Belum Lengkap - Koordinator',
            self::BroadcastLPMPP => 'Broadcast LPMPP',
            self::AccreditationSchedule => 'Jadwal Akreditasi',
            self::PolicyUpdate => 'Pembaruan Kebijakan',
            self::DocumentIssue => 'Dokumen Bermasalah',
        };
    }
}
