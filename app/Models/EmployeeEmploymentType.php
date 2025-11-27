<?php

namespace App\Models;

enum EmployeeEmploymentType: string
{
    case Permanent = 'permanent';
    case Contract = 'contract';
    case PartTime = 'part_time';
    case Intern = 'intern';
}
