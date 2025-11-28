<?php

namespace App\Models;

enum NotificationChannel: string
{
    case Email = 'email';
    case InApp = 'in_app';
    case WhatsApp = 'whatsapp';

    public function label(): string
    {
        return match ($this) {
            self::Email => 'Email',
            self::InApp => 'In-App',
            self::WhatsApp => 'WhatsApp',
        };
    }
}
