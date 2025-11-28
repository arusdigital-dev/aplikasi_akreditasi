<?php

namespace App\Models;

enum EmployeeEmploymentStatus: string
{
    case Pns = 'pns';
    case Pppk = 'pppk';
    case Kontrak = 'kontrak';
    case Honorer = 'honorer';
    case Lainnya = 'lainnya';
    case TetapNonPNS = 'TetapNonPNS';
    case NonPNS = 'NonPNS';
    case DosendenganPerjanjianKerja = 'DosendenganPerjanjianKerja';
    case Cpns = 'cpns';
}
