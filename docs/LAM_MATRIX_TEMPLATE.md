# Template Matriks Penilaian LAM

Dokumen ini menjelaskan struktur matriks penilaian akreditasi yang digunakan sebagai template untuk semua LAM, dengan LAM Infokom sebagai contoh referensi.

## Struktur Hierarki

```
LAM
└── Standard (Jenis: I, II, III, ...)
    └── Element (No. Butir: A, B, C, ...)
        └── Indicator (Elemen Penilaian LAM)
            └── Rubric (Deskriptor: Sangat baik=4, Baik=3, Cukup=2, Kurang=1)
```

## Mapping Data dari Matriks ke Database

### Contoh dari LAM Infokom:

| Kolom Matriks | Field Database | Contoh | Keterangan |
|--------------|---------------|--------|------------|
| Jenis | `LAMStandard.code` | `I` | Kode standar (I, II, III, dst) |
| No. Urut | `LAMStandard.order_index` | `1` | Urutan standar |
| No. Butir | `LAMElement.code` | `A` | Kode elemen (A, B, C, dst) |
| Bobot dari 400 | `LAMElement.weight` | `4` | Bobot elemen (dari total 400) |
| Elemen Penilaian LAM | `LAMIndicator.description` | Deskripsi kemampuan UPPS | Deskripsi indikator penilaian |
| Deskriptor | `LAMRubric.description` | Deskripsi untuk setiap level | Deskripsi untuk score 1-4 |

### Rubric Levels (Standar untuk semua LAM):

| Score | Label | Keterangan |
|-------|-------|------------|
| 4 | Sangat Baik | Deskriptor untuk pencapaian sangat baik |
| 3 | Baik | Deskriptor untuk pencapaian baik |
| 2 | Cukup | Deskriptor untuk pencapaian cukup |
| 1 | Kurang | Deskriptor untuk pencapaian kurang |

## Contoh Struktur Data (LAM Infokom)

### Standard I: Kondisi Eksternal

```php
[
    'code' => 'I',
    'name' => 'Kondisi Eksternal',
    'weight' => 10.00, // Bobot dari total
    'order_index' => 1,
    'elements' => [
        [
            'code' => 'A',
            'name' => 'Kondisi Eksternal',
            'weight' => 4.00, // Bobot dari 400
            'order_index' => 1,
            'indicators' => [
                [
                    'code' => 'I1',
                    'name' => 'Kemampuan UPPS dalam menganalisis aspek-aspek dalam lingkungan makro dan mikro',
                    'description' => 'Kemampuan UPPS dalam menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS.',
                    'weight' => 4.00,
                    'order_index' => 1,
                    'document_requirements' => [
                        'Dokumen Analisis Lingkungan Makro',
                        'Dokumen Analisis Lingkungan Mikro',
                        'Laporan Analisis SWOT'
                    ],
                    'rubrics' => [
                        [
                            'score' => 4,
                            'label' => 'Sangat Baik',
                            'description' => 'UPPS mampu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS dengan sangat komprehensif.'
                        ],
                        [
                            'score' => 3,
                            'label' => 'Baik',
                            'description' => 'UPPS mampu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS secara komprehensif.'
                        ],
                        [
                            'score' => 2,
                            'label' => 'Cukup',
                            'description' => 'UPPS mampu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS secara cukup komprehensif.'
                        ],
                        [
                            'score' => 1,
                            'label' => 'Kurang',
                            'description' => 'UPPS mampu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS secara kurang komprehensif.'
                        ]
                    ]
                ]
            ]
        ]
    ]
]
```

## Format Seeder untuk LAM Baru

Saat membuat seeder untuk LAM baru, gunakan struktur berikut:

```php
protected function createLAMXXXStructure(LAM $lam): void
{
    $standards = [
        [
            'code' => 'I', // Jenis
            'name' => 'Nama Standard',
            'weight' => 10.00, // Bobot dari total
            'elements' => [
                [
                    'code' => 'A', // No. Butir
                    'name' => 'Nama Elemen',
                    'weight' => 4.00, // Bobot dari 400
                    'indicators' => [
                        [
                            'code' => 'I1',
                            'name' => 'Nama Indikator',
                            'description' => 'Elemen Penilaian LAM (deskripsi lengkap)',
                            'weight' => 4.00,
                            'document_requirements' => [
                                'Dokumen 1',
                                'Dokumen 2',
                            ],
                            'rubrics' => [
                                ['score' => 4, 'label' => 'Sangat Baik', 'description' => 'Deskriptor untuk score 4'],
                                ['score' => 3, 'label' => 'Baik', 'description' => 'Deskriptor untuk score 3'],
                                ['score' => 2, 'label' => 'Cukup', 'description' => 'Deskriptor untuk score 2'],
                                ['score' => 1, 'label' => 'Kurang', 'description' => 'Deskriptor untuk score 1'],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ];

    $this->createStandards($lam, $standards);
}
```

## Catatan Penting

1. **Bobot Total**: Total bobot semua standard harus 100%
2. **Bobot dari 400**: Bobot elemen dihitung dari total 400 poin
3. **Rubric Wajib**: Setiap indicator harus memiliki 4 rubric (score 1-4)
4. **Kode Unik**: Setiap code harus unik dalam levelnya (Standard, Element, Indicator)
5. **Order Index**: Digunakan untuk mengurutkan tampilan

## Validasi

Sebelum menyimpan data LAM baru, pastikan:
- ✅ Total weight semua standards = 100%
- ✅ Setiap indicator memiliki 4 rubrics (score 1-4)
- ✅ Semua code unik dalam levelnya
- ✅ Document requirements terdefinisi untuk setiap indicator
- ✅ Deskriptor rubric jelas dan dapat diukur
