<?php

namespace App\Jobs;

use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsAppNotification implements ShouldQueue
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

            if (! $user) {
                $this->notification->markAsFailed('User not found');

                return;
            }

            // Get phone number from user or employee
            $phoneNumber = $user->employee?->phone_number ?? null;

            if (! $phoneNumber) {
                $this->notification->markAsFailed('Phone number not found');

                return;
            }

            // Check if WhatsApp gateway is configured
            $whatsappGatewayUrl = config('services.whatsapp.gateway_url');
            $whatsappApiKey = config('services.whatsapp.api_key');

            if (! $whatsappGatewayUrl || ! $whatsappApiKey) {
                $this->notification->markAsFailed('WhatsApp gateway not configured');
                Log::warning('WhatsApp gateway not configured. Skipping notification.', [
                    'notification_id' => $this->notification->id,
                ]);

                return;
            }

            // Format phone number (remove + and spaces)
            $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

            // Send WhatsApp message via gateway
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$whatsappApiKey}",
                'Content-Type' => 'application/json',
            ])->post($whatsappGatewayUrl, [
                'to' => $phoneNumber,
                'message' => "*{$this->notification->title}*\n\n{$this->notification->message}",
            ]);

            if ($response->successful()) {
                $this->notification->markAsSent();
            } else {
                $this->notification->markAsFailed($response->body() ?? 'Unknown error');
            }
        } catch (\Exception $e) {
            $this->notification->markAsFailed($e->getMessage());
            Log::error('Failed to send WhatsApp notification', [
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
