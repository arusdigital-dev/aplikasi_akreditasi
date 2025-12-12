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
        // Create LAM INFOKOM
        $lamInfokom = LAM::create([
            'name' => 'LAM INFOKOM',
            'code' => 'LAM_INFOKOM',
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
        ]);

        $this->createLAMINFOKOMStructure($lamInfokom);

        // Create LAMTEK
        $lamtek = LAM::create([
            'name' => 'LAM TEKNIK',
            'code' => 'LAMTEK',
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
        ]);

        $this->createLAMTEKStructure($lamtek);
    }

    /**
     * Create LAM INFOKOM structure (9 Standards).
     */
    protected function createLAMINFOKOMStructure(LAM $lam): void
    {
        $standards = [
            [
                'code' => 'K1',
                'name' => 'Visi, Misi, Tujuan dan Strategi',
                'weight' => 10.00,
                'elements' => [
                    [
                        'code' => 'E1',
                        'name' => 'Visi, Misi, Tujuan dan Strategi Program Studi',
                        'weight' => 100.00,
                        'indicators' => [
                            [
                                'code' => 'I1',
                                'name' => 'Visi Program Studi',
                                'weight' => 25.00,
                                'document_requirements' => ['Dokumen Visi', 'SK Penetapan Visi'],
                                'rubrics' => [
                                    ['score' => 4, 'label' => 'Sangat Baik', 'description' => 'Visi jelas, terukur, dan sesuai dengan perkembangan teknologi'],
                                    ['score' => 3, 'label' => 'Baik', 'description' => 'Visi jelas dan sesuai dengan perkembangan teknologi'],
                                    ['score' => 2, 'label' => 'Cukup', 'description' => 'Visi cukup jelas namun kurang terukur'],
                                    ['score' => 1, 'label' => 'Kurang', 'description' => 'Visi tidak jelas atau tidak sesuai'],
                                ],
                            ],
                            [
                                'code' => 'I2',
                                'name' => 'Misi Program Studi',
                                'weight' => 25.00,
                                'document_requirements' => ['Dokumen Misi', 'SK Penetapan Misi'],
                                'rubrics' => [
                                    ['score' => 4, 'label' => 'Sangat Baik', 'description' => 'Misi jelas, terukur, dan mendukung visi'],
                                    ['score' => 3, 'label' => 'Baik', 'description' => 'Misi jelas dan mendukung visi'],
                                    ['score' => 2, 'label' => 'Cukup', 'description' => 'Misi cukup jelas namun kurang terukur'],
                                    ['score' => 1, 'label' => 'Kurang', 'description' => 'Misi tidak jelas atau tidak mendukung visi'],
                                ],
                            ],
                            [
                                'code' => 'I3',
                                'name' => 'Tujuan Program Studi',
                                'weight' => 25.00,
                                'document_requirements' => ['Dokumen Tujuan', 'SK Penetapan Tujuan'],
                                'rubrics' => [
                                    ['score' => 4, 'label' => 'Sangat Baik', 'description' => 'Tujuan jelas, terukur, dan dapat dicapai'],
                                    ['score' => 3, 'label' => 'Baik', 'description' => 'Tujuan jelas dan dapat dicapai'],
                                    ['score' => 2, 'label' => 'Cukup', 'description' => 'Tujuan cukup jelas namun kurang terukur'],
                                    ['score' => 1, 'label' => 'Kurang', 'description' => 'Tujuan tidak jelas atau tidak dapat dicapai'],
                                ],
                            ],
                            [
                                'code' => 'I4',
                                'name' => 'Strategi Pencapaian Tujuan',
                                'weight' => 25.00,
                                'document_requirements' => ['Dokumen Strategi', 'Rencana Strategis'],
                                'rubrics' => [
                                    ['score' => 4, 'label' => 'Sangat Baik', 'description' => 'Strategi jelas, terukur, dan efektif'],
                                    ['score' => 3, 'label' => 'Baik', 'description' => 'Strategi jelas dan efektif'],
                                    ['score' => 2, 'label' => 'Cukup', 'description' => 'Strategi cukup jelas namun kurang terukur'],
                                    ['score' => 1, 'label' => 'Kurang', 'description' => 'Strategi tidak jelas atau tidak efektif'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            // Add more standards as needed - this is a sample structure
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
     */
    protected function createStandards(LAM $lam, array $standards): void
    {
        foreach ($standards as $index => $standardData) {
            $standard = LAMStandard::create([
                'lam_id' => $lam->id,
                'code' => $standardData['code'],
                'name' => $standardData['name'],
                'weight' => $standardData['weight'],
                'order_index' => $index + 1,
            ]);

            foreach ($standardData['elements'] as $elementIndex => $elementData) {
                $element = LAMElement::create([
                    'lam_standard_id' => $standard->id,
                    'code' => $elementData['code'],
                    'name' => $elementData['name'],
                    'weight' => $elementData['weight'],
                    'order_index' => $elementIndex + 1,
                ]);

                foreach ($elementData['indicators'] as $indicatorIndex => $indicatorData) {
                    $indicator = LAMIndicator::create([
                        'lam_element_id' => $element->id,
                        'code' => $indicatorData['code'],
                        'name' => $indicatorData['name'],
                        'weight' => $indicatorData['weight'],
                        'order_index' => $indicatorIndex + 1,
                        'document_requirements' => $indicatorData['document_requirements'] ?? [],
                        'is_auto_scorable' => false,
                    ]);

                    foreach ($indicatorData['rubrics'] as $rubricIndex => $rubricData) {
                        LAMRubric::create([
                            'lam_indicator_id' => $indicator->id,
                            'score' => $rubricData['score'],
                            'label' => $rubricData['label'],
                            'description' => $rubricData['description'],
                            'order_index' => $rubricIndex + 1,
                        ]);
                    }
                }
            }
        }
    }
}
