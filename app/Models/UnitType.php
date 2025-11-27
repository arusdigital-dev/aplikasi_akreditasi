<?php

namespace App\Models;

enum UnitType: string
{
    case Fakultas = 'fakultas';
    case Jurusan = 'jurusan';
    case ProgramStudi = 'program_studi';
    case Unit = 'unit';
    case Lembaga = 'lembaga';
}
