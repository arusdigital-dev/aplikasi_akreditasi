<?php

namespace App\Models;

enum AssessorAccessLevel: string
{
    case ReadOnly = 'read_only';
    case ReadWrite = 'read_write';
    case FullAccess = 'full_access';
}

