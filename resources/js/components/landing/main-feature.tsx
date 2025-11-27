import React from 'react';
import { useScrollAnimation } from '@/lib/useScrollAnimation';

type FeatureItem = {
    title: string;
    description: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M12 3 5 6v6c0 5 3.5 7.5 7 9 3.5-1.5 7-4 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 12.5 11 14l3.5-3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const TrendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M4 17 10 11l4 4 6-6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 19c1.5-3 4-4 6-4s4.5 1 6 4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 19c1.2-2.5 3.2-3.7 5-3.7 1.8 0 3.8 1.2 5 3.7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <ellipse cx="12" cy="5" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const features: FeatureItem[] = [
    {
        title: 'Manajemen Dokumen',
        description: 'Upload, versioning, dan tracking dokumen akreditasi dengan sistem yang terstruktur',
        Icon: DocumentIcon,
    },
    {
        title: 'Keamanan Berlapis',
        description: 'SSO Gmail UMRAH, RBAC, dan audit trail untuk keamanan data yang maksimal',
        Icon: ShieldIcon,
    },
    {
        title: 'Analytics & Reporting',
        description: 'Dashboard real-time dan laporan komprehensif untuk monitoring progress akreditasi',
        Icon: TrendIcon,
    },
    {
        title: 'Kolaborasi Tim',
        description: 'Workflow terstruktur untuk Koor Prodi, Assessor, dan Pimpinan dalam satu platform',
        Icon: UsersIcon,
    },
    {
        title: 'Tracking Real-Time',
        description: 'Pantau status dokumen dan progress akreditasi secara real-time di setiap tahap',
        Icon: ClockIcon,
    },
    {
        title: 'Data Terpusat',
        description: 'Semua data pegawai, dokumen, dan penilaian tersimpan dalam satu sistem terintegrasi',
        Icon: DatabaseIcon,
    },
];

export default function MainFeature() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

    return (
        <section className="w-full bg-[#f8fafc]" id="fitur" style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}>
            <div className="mx-auto max-w-6xl px-6 py-14">
                <div
                    ref={ref}
                    className={`scroll-animate ${isVisible ? 'visible' : ''}`}
                >
                    <h2 className="mb-2 text-center text-[28px] font-semibold text-[#0f172a]">Fitur Utama Platform</h2>
                    <p className="mx-auto mb-10 max-w-3xl text-center text-[15px] leading-7 text-[#334155]">
                        Semua yang Anda butuhkan untuk mengelola dokumen dan proses akreditasi dengan efisien dan aman
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ title, description, Icon }, index) => (
                        <div
                            key={title}
                            className={`rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover-lift hover-glow cursor-pointer transition-all duration-300 scroll-animate ${
                                isVisible ? 'visible' : ''
                            }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] text-white hover-rotate transition-all duration-300">
                                    <Icon width={22} height={22} />
                                </div>
                                <div className="text-[15px] font-semibold text-[#0f172a]">{title}</div>
                            </div>
                            <p className="text-sm leading-6 text-[#0f172a]">{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
