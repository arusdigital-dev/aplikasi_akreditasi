<?php

namespace App\Jobs;

use App\Mail\NotificationMail;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendEmailNotification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Notification $notification
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $user = $this->notification->user;

            if (! $user || ! $user->email) {
                $this->notification->markAsFailed('User email not found');

                return;
            }

            Mail::to($user->email)->send(new NotificationMail($this->notification));
            $this->notification->markAsSent();
        } catch (\Exception $e) {
            $this->notification->markAsFailed($e->getMessage());
            throw $e;
        }
    }
}
