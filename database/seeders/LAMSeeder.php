<?php

namespace Database\Seeders;

use App\Models\LAM;
use App\Models\LAMElement;
use App\Models\LAMIndicator;
use App\Models\LAMRubric;
use App\Models\LAMStandard;
use Illuminate\Database\Seeder;

class LAMSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update LAM INFOKOM
        $lamInfokom = LAM::updateOrCreate(
            ['code' => 'LAM_INFOKOM'],
            [
                'name' => 'LAM INFOKOM',
                'description' => 'Lembaga Akreditasi Mandiri Informatika dan Komputer',
                'min_score_scale' => 1,
                'max_score_scale' => 4,
                'accreditation_levels' => [
                    'Unggul' => 3.5,
                    'Baik Sekali' => 3.0,
                    'Baik' => 2.5,
                    'Tidak Terakreditasi' => 0,
                ],
                'is_active' => true,
            ]
        );

        $this->createLAMINFOKOMStructure($lamInfokom);

        // Create or update LAMTEK
        $lamtek = LAM::updateOrCreate(
            ['code' => 'LAMTEK'],
            [
                'name' => 'LAM TEKNIK',
                'description' => 'Lembaga Akreditasi Mandiri Teknik',
                'min_score_scale' => 1,
                'max_score_scale' => 4,
                'accreditation_levels' => [
                    'Unggul' => 3.5,
                    'Baik Sekali' => 3.0,
                    'Baik' => 2.5,
                    'Tidak Terakreditasi' => 0,
                ],
                'is_active' => true,
            ]
        );

        $this->createLAMTEKStructure($lamtek);
    }

    /**
     * Create LAM INFOKOM structure (9 Standards).
     *
     * Template berdasarkan matriks penilaian LAM Infokom:
     * - Jenis (I, II, III, ...) = Standard code
     * - No. Butir (A, B, C, ...) = Element code
     * - Bobot dari 400 = Element weight
     * - Elemen Penilaian LAM = Indicator description
     * - Deskriptor (Sangat baik=4, Baik=3, Cukup=2, Kurang=1) = Rubrics
     */
    protected function createLAMINFOKOMStructure(LAM $lam): void
    {
        $standards = [
            [
                'code' => 'I',
                'name' => 'Kondisi Eksternal',
                'weight' => 10.00, // Contoh bobot, sesuaikan dengan total
                'elements' => [
                    [
                        'code' => 'A',
                        'name' => 'Kondisi Eksternal',
                        'weight' => 4.00, // Bobot dari 400
                        'indicators' => [
                            [
                                'code' => 'I1',
                                'name' => 'Kemampuan UPPS dalam menganalisis aspek-aspek dalam lingkungan makro dan mikro',
                                'description' => 'Kemampuan UPPS dalam menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS.',
                                'weight' => 4.00,
                                'document_requirements' => [
                                    'Dokumen Analisis Lingkungan Makro',
                                    'Dokumen Analisis Lingkungan Mikro',
                                    'Laporan Analisis SWOT',
                                    'Dokumen Rencana Strategis',
                                ],
                                'rubrics' => [
                                    [
                                        'score' => 4,
                                        'label' => 'Sangat Baik',
                                        'description' => 'UPPS mampu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS dengan sangat komprehensif.',
                                    ],
                                    [
                                        'score' => 3,
                                        'label' => 'Baik',
                                        'description' => 'UPPS mampu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS secara komprehensif.',
                                    ],
                                    [
                                        'score' => 2,
                                        'label' => 'Cukup',
                                        'description' => 'UPPS mampu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS secara cukup komprehensif.',
                                    ],
                                    [
                                        'score' => 1,
                                        'label' => 'Kurang',
                                        'description' => 'UPPS mampu menganalisis aspek-aspek dalam lingkungan makro dan lingkungan mikro yang relevan dan dapat mempengaruhi eksistensi dan pengembangan PS maupun UPPS secara kurang komprehensif.',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            // TODO: Tambahkan standard-standard lainnya sesuai matriks LAM Infokom
            // Standard II, III, IV, V, VI, VII, VIII, IX
        ];

        $this->createStandards($lam, $standards);
    }

    /**
     * Create LAMTEK structure (7 Standards).
     */
    protected function createLAMTEKStructure(LAM $lam): void
    {
        $standards = [
            [
                'code' => 'K1',
                'name' => 'Visi, Misi, Tujuan dan Strategi',
                'weight' => 12.00,
                'elements' => [
                    [
                        'code' => 'E1',
                        'name' => 'Visi, Misi, Tujuan dan Strategi Program Studi',
                        'weight' => 100.00,
                        'indicators' => [
                            [
                                'code' => 'I1',
                                'name' => 'Visi Program Studi',
                                'weight' => 30.00,
                                'document_requirements' => ['Dokumen Visi', 'SK Penetapan Visi'],
                                'rubrics' => [
                                    ['score' => 4, 'label' => 'Sangat Baik', 'description' => 'Visi jelas dan sesuai dengan perkembangan teknologi'],
                                    ['score' => 3, 'label' => 'Baik', 'description' => 'Visi jelas'],
                                    ['score' => 2, 'label' => 'Cukup', 'description' => 'Visi cukup jelas'],
                                    ['score' => 1, 'label' => 'Kurang', 'description' => 'Visi tidak jelas'],
                                ],
                            ],
                            // Add more indicators as needed
                        ],
                    ],
                ],
            ],
            // Add more standards as needed - this is a sample structure
        ];

        $this->createStandards($lam, $standards);
    }

    /**
     * Create standards structure.
     * Uses updateOrCreate to prevent duplicate entries.
     */
    protected function createStandards(LAM $lam, array $standards): void
    {
        foreach ($standards as $index => $standardData) {
            $standard = LAMStandard::updateOrCreate(
                [
                    'lam_id' => $lam->id,
                    'code' => $standardData['code'],
                ],
                [
                    'name' => $standardData['name'],
                    'weight' => $standardData['weight'],
                    'order_index' => $index + 1,
                ]
            );

            foreach ($standardData['elements'] as $elementIndex => $elementData) {
                $element = LAMElement::updateOrCreate(
                    [
                        'lam_standard_id' => $standard->id,
                        'code' => $elementData['code'],
                    ],
                    [
                        'name' => $elementData['name'],
                        'weight' => $elementData['weight'],
                        'order_index' => $elementIndex + 1,
                    ]
                );

                foreach ($elementData['indicators'] as $indicatorIndex => $indicatorData) {
                    $indicator = LAMIndicator::updateOrCreate(
                        [
                            'lam_element_id' => $element->id,
                            'code' => $indicatorData['code'],
                        ],
                        [
                            'name' => $indicatorData['name'],
                            'description' => $indicatorData['description'] ?? null,
                            'weight' => $indicatorData['weight'],
                            'order_index' => $indicatorIndex + 1,
                            'document_requirements' => $indicatorData['document_requirements'] ?? [],
                            'is_auto_scorable' => false,
                        ]
                    );

                    foreach ($indicatorData['rubrics'] as $rubricIndex => $rubricData) {
                        LAMRubric::updateOrCreate(
                            [
                                'lam_indicator_id' => $indicator->id,
                                'score' => $rubricData['score'],
                            ],
                            [
                                'label' => $rubricData['label'],
                                'description' => $rubricData['description'],
                                'order_index' => $rubricIndex + 1,
                            ]
                        );
                    }
                }
            }
        }
    }
}
