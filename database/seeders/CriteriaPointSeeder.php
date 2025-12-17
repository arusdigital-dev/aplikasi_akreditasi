<?php

namespace Database\Seeders;

use App\Models\CriteriaPoint;
use App\Models\Criterion;
use Illuminate\Database\Seeder;

class CriteriaPointSeeder extends Seeder
{
    public function run(): void
    {
        $criteria = Criterion::orderBy('order_index')->get();

        foreach ($criteria as $criterion) {
            $points = [
                [
                    'order_index' => 1,
                    'title' => 'Perencanaan dan tujuan kriteria',
                    'description' => 'Dokumentasi perencanaan dan tujuan yang jelas serta terukur.',
                    'max_score' => 2.99,
                    'rubrics' => [
                        ['score' => 4, 'description' => 'Sangat jelas, lengkap, terukur, dan relevan.'],
                        ['score' => 3, 'description' => 'Jelas dan cukup terukur, relevansi baik.'],
                        ['score' => 2, 'description' => 'Kurang jelas atau tidak lengkap, relevansi cukup.'],
                        ['score' => 1, 'description' => 'Tidak jelas, tidak lengkap, relevansi lemah.'],
                    ],
                ],
                [
                    'order_index' => 2,
                    'title' => 'Implementasi dan pelaksanaan',
                    'description' => 'Pelaksanaan kegiatan sesuai rencana dan target yang ditetapkan.',
                    'max_score' => 4.00,
                    'rubrics' => [
                        ['score' => 4, 'description' => 'Pelaksanaan sangat konsisten dan mencapai target optimal.'],
                        ['score' => 3, 'description' => 'Pelaksanaan konsisten dan sebagian besar target tercapai.'],
                        ['score' => 2, 'description' => 'Pelaksanaan kurang konsisten, target sebagian tercapai.'],
                        ['score' => 1, 'description' => 'Pelaksanaan tidak konsisten, target tidak tercapai.'],
                    ],
                ],
                [
                    'order_index' => 3,
                    'title' => 'Evaluasi dan perbaikan berkelanjutan',
                    'description' => 'Mekanisme evaluasi serta tindak lanjut perbaikan berkelanjutan.',
                    'max_score' => 4.00,
                    'rubrics' => [
                        ['score' => 4, 'description' => 'Evaluasi komprehensif dengan perbaikan berkelanjutan yang efektif.'],
                        ['score' => 3, 'description' => 'Evaluasi baik dengan sebagian perbaikan efektif.'],
                        ['score' => 2, 'description' => 'Evaluasi terbatas dengan perbaikan kurang konsisten.'],
                        ['score' => 1, 'description' => 'Evaluasi minim tanpa perbaikan efektif.'],
                    ],
                ],
            ];

            foreach ($points as $p) {
                CriteriaPoint::updateOrCreate(
                    [
                        'criteria_id' => $criterion->id,
                        'order_index' => $p['order_index'],
                    ],
                    [
                        'title' => $p['title'],
                        'description' => $p['description'],
                        'max_score' => $p['max_score'],
                        'rubrics' => $p['rubrics'],
                    ]
                );
            }
        }
    }
}
