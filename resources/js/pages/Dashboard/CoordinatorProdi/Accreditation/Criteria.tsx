import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { route } from '@/lib/route';
import { useState, useEffect } from 'react';

interface Rubric {
    id: number;
    score: number;
    label: string | null;
    description: string;
}

interface Indicator {
    id: number;
    code: string;
    name: string;
    description: string | null;
    document_requirements: string[] | null;
    weight: number;
    rubrics: Rubric[];
}

interface Element {
    id: number;
    code: string;
    name: string;
    description: string | null;
    weight: number;
    indicators: Indicator[];
}

interface Standard {
    id: number;
    code: string;
    name: string;
    description: string | null;
    weight: number;
    elements: Element[];
}

interface Cycle {
    id: string;
    cycle_name: string;
    lam: {
        id: number;
        name: string;
        standards: Standard[];
    };
}

interface Score {
    id: string;
    lam_indicator_id: number;
    score: number;
    notes: string | null;
    source: string;
}

interface Props {
    cycle: Cycle | null;
    scores: Record<string, Score>;
}

export default function AccreditationCriteria({ cycle, scores }: Props) {
    const [expandedStandards, setExpandedStandards] = useState<Record<number, boolean>>({});

    /**
     * Reset expanded standards ketika cycle berubah
     */
    useEffect(() => {
        setExpandedStandards({});
    }, [cycle?.id]);

    /**
     * Fungsi untuk toggle expand/collapse standard
     */
    const toggleStandard = (standardId: number) => {
        setExpandedStandards((prev) => ({
            ...prev,
            [standardId]: !prev[standardId],
        }));
    };

    // Jika tidak ada cycle, tampilkan pesan error
    if (!cycle) {
        return (
            <>
                <Head title="Kriteria & Matriks Penilaian" />
                <DashboardLayout
                    title="Kriteria & Matriks Penilaian"
                    subtitle="Siklus Akreditasi Tidak Ditemukan"
                >
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak Ada Siklus Akreditasi</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Belum ada siklus akreditasi yang tersedia. Silakan buat siklus akreditasi terlebih dahulu.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('coordinator-prodi.accreditation.cycles')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Buat Siklus Akreditasi
                                </Link>
                            </div>
                        </div>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    return (
        <>
            <Head title="Kriteria & Matriks Penilaian" />
            <DashboardLayout
                title="Kriteria & Matriks Penilaian"
                subtitle={`${cycle.cycle_name} - ${cycle.lam.name}`}
            >
                <div className="space-y-4">
                    {/* Cycle Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-900">{cycle.cycle_name}</h3>
                                <p className="text-sm text-blue-700 mt-1">{cycle.lam.name}</p>
                            </div>
                            <Link
                                href={route('coordinator-prodi.accreditation.simulation')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                                Lihat Simulasi
                            </Link>
                        </div>
                    </div>

                    {/* Standards */}
                    {cycle.lam?.standards && cycle.lam.standards.length > 0 ? (
                        cycle.lam.standards.map((standard) => (
                            <div key={standard.id} className="bg-white rounded-lg shadow">
                                <button
                                    onClick={() => toggleStandard(standard.id)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">{standard.code}</span>
                                        <span className="text-gray-700">{standard.name}</span>
                                        <span className="text-xs text-gray-500">(Bobot: {standard.weight}%)</span>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform ${
                                            expandedStandards[standard.id] ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {expandedStandards[standard.id] && (
                                    <div className="border-t border-gray-200">
                                        {standard.elements && standard.elements.length > 0 ? (
                                            standard.elements.map((element) => (
                                                <div key={element.id} className="px-6 py-4 bg-gray-50">
                                                    <div className="font-medium text-gray-900 mb-3">
                                                        {element.code}: {element.name}
                                                    </div>
                                                    <div className="space-y-3 ml-4">
                                                        {element.indicators && element.indicators.length > 0 ? (
                                                            element.indicators.map((indicator) => {
                                                                const score = scores[indicator.id.toString()];
                                                                return (
                                                                    <div key={indicator.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-gray-900">
                                                                                    {indicator.code}: {indicator.name}
                                                                                </div>
                                                                                {indicator.description && (
                                                                                    <p className="text-sm text-gray-600 mt-1">{indicator.description}</p>
                                                                                )}
                                                                                {indicator.document_requirements && Array.isArray(indicator.document_requirements) && indicator.document_requirements.length > 0 && (
                                                                                    <div className="mt-2">
                                                                                        <span className="text-xs font-medium text-gray-500">Dokumen yang diperlukan:</span>
                                                                                        <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                                                                                            {indicator.document_requirements.map((doc, idx) => (
                                                                                                <li key={idx}>{doc}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {score && (
                                                                                <div className="ml-4">
                                                                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                                                                                        Skor: {score.score}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {indicator.rubrics && Array.isArray(indicator.rubrics) && indicator.rubrics.length > 0 && (
                                                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                                                <div className="text-xs font-medium text-gray-500 mb-2">Rubrik Penilaian:</div>
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                                    {indicator.rubrics.map((rubric) => (
                                                                                        <div key={rubric.id} className="text-xs bg-gray-50 p-2 rounded">
                                                                                            <span className="font-medium">Skor {rubric.score}:</span> {rubric.label && `${rubric.label} - `}
                                                                                            {rubric.description}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="text-sm text-gray-500 italic">Tidak ada indikator</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-6 py-4 text-sm text-gray-500 italic">Tidak ada elemen</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                            Tidak ada standar yang tersedia untuk LAM ini.
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
}


