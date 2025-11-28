<?php

namespace App\Models;

enum EmployeeEmploymentType: string
{
    case TenagaPendidik = 'tenaga_pendidik';
    case TenagaKependidikan = 'tenaga_kependidikan';
    case Lainnya = 'lainnya';
}
