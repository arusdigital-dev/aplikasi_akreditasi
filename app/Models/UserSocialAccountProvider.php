<?php

namespace App\Models;

enum UserSocialAccountProvider: string
{
    case Google = 'google';
    case Facebook = 'facebook';
    case GitHub = 'github';
    case Twitter = 'twitter';
    case Microsoft = 'microsoft';
    case Apple = 'apple';
}
