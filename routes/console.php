<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule deadline reminder notifications to run daily at 8 AM
Schedule::command('notifications:send-deadline-reminders')
    ->dailyAt('08:00')
    ->timezone('Asia/Jakarta');
