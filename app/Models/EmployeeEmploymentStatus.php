<?php

namespace App\Models;

enum EmployeeEmploymentStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Retired = 'retired';
    case Terminated = 'terminated';
}
