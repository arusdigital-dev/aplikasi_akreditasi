<?php

namespace App\Models;

enum UnitType: string
{
    case Universitas = 'universitas';
    case Fakultas = 'fakultas';
    case Jurusan = 'jurusan';
    case Prodi = 'prodi';
    case Pascasarjana = 'pascasarjana';
    case UnitKerja = 'unit_kerja';
}
