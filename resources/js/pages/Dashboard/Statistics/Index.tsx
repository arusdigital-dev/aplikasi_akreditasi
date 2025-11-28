import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DocumentCompletenessStats from '@/components/dashboard/statistics/DocumentCompletenessStats';
import AssessorEvaluationStats from '@/components/dashboard/statistics/AssessorEvaluationStats';
import AccreditationRecap from '@/components/dashboard/statistics/AccreditationRecap';

interface DocumentStats {
    growth_chart: Array<{ month: string; count: number }>;
    slow_programs: Array<{
        id: number;
        name: string;
        fakultas: string;
        completion_rate: number;
        total_criteria: number;
        completed_criteria: number;
    }>;
    problem_documents: Array<{
        id: number;
        program_name: string;
        criterion_name: string;
        assessor_name: string;
        issue_type: string;
        deadline: string | null;
        assigned_date: string | null;
    }>;
    total_problem_documents: number;
}

interface AssessorStats {
    faculty_scores: Array<{
        fakultas: string;
        average_score: number;
        total_evaluations: number;
    }>;
    low_score_criteria: Array<{
        id: number;
        name: string;
        program_name: string;
        average_score: number;
        max_score: number;
    }>;
    incomplete_reviewers: Array<{
        id: string;
        name: string;
        email: string;
        total_assignments: number;
        completed_assignments: number;
        pending_assignments: number;
        completion_rate: number;
    }>;
}

interface AccreditationRecapData {
    program_scores: Array<{
        id: number;
        name: string;
        fakultas: string;
        jenjang: string;
        total_score: number;
        max_score: number;
        percentage: number;
        criteria_details: Array<{
            id: number;
            name: string;
            score: number;
            max_score: number;
            percentage: number;
        }>;
        strong_criteria: Array<{
            id: number;
            name: string;
            score: number;
            max_score: number;
            percentage: number;
        }>;
        weak_criteria: Array<{
            id: number;
            name: string;
            score: number;
            max_score: number;
            percentage: number;
        }>;
        suggestions: string[];
    }>;
}

interface Props {
    documentStats: DocumentStats;
    assessorStats: AssessorStats;
    accreditationRecap: AccreditationRecapData;
}

export default function StatisticsIndex({ documentStats, assessorStats, accreditationRecap }: Props) {
    return (
        <>
            <Head title="Rekap & Statistik Akreditasi" />
            <DashboardLayout
                title="Rekap & Statistik Akreditasi"
                subtitle="Statistik global untuk LPMPP - Kelengkapan dokumen, penilaian asesor, dan rekap nilai akreditasi"
            >
                <div className="space-y-6">
                    {/* Document Completeness Statistics */}
                    <DocumentCompletenessStats
                        growthChart={documentStats.growth_chart}
                        slowPrograms={documentStats.slow_programs}
                        problemDocuments={documentStats.problem_documents}
                        totalProblemDocuments={documentStats.total_problem_documents}
                    />

                    {/* Assessor Evaluation Statistics */}
                    <AssessorEvaluationStats
                        facultyScores={assessorStats.faculty_scores}
                        lowScoreCriteria={assessorStats.low_score_criteria}
                        incompleteReviewers={assessorStats.incomplete_reviewers}
                    />

                    {/* Accreditation Recap */}
                    <AccreditationRecap programScores={accreditationRecap.program_scores} />
                </div>
            </DashboardLayout>
        </>
    );
}


