import React from 'react';
import { useScrollAnimation } from '@/lib/useScrollAnimation';

type Step = {
    number: string;
    title: string;
    description: string;
    Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
};

const ArrowIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M5 12h10M11 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 20c1.7-3.2 4.6-4.5 7-4.5s5.3 1.3 7 4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const ChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 16v-5M12 16v-8M16 16v-3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const steps: Step[] = [
    {
        number: '01',
        title: 'Login dengan SSO Gmail UMRAH',
        description:
            'Gunakan akun Gmail resmi UMRAH Anda untuk login. Sistem akan memverifikasi identitas Anda secara otomatis melalui OAuth 2.0.',
        Icon: ArrowIcon,
    },
    {
        number: '02',
        title: 'Role Assignment oleh Admin',
        description:
            'Admin LPMPP akan memberikan role sesuai posisi Anda (Koor Prodi, Assessor, atau Pimpinan). Anda akan mendapatkan akses sesuai role tersebut.',
        Icon: UsersIcon,
    },
    {
        number: '03',
        title: 'Kelola Dokumen & Akreditasi',
        description:
            'Upload, review, atau monitor dokumen akreditasi sesuai role Anda. Sistem akan memandu workflow yang sesuai untuk setiap aktivitas.',
        Icon: FolderIcon,
    },
    {
        number: '04',
        title: 'Tracking & Pelaporan',
        description:
            'Pantau progress akreditasi secara real-time. Dashboard dan laporan otomatis membantu pengambilan keputusan yang lebih baik.',
        Icon: ChartIcon,
    },
];

export default function HowItWorks() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

    return (
        <section id="cara-kerja" className="w-full bg-[#f8fafc]" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
            <div className="mx-auto max-w-6xl px-6 py-14">
                <div
                    ref={ref}
                    className={`scroll-animate ${isVisible ? 'visible' : ''}`}
                >
                    <h2 className="mb-2 text-center text-[32px] font-semibold text-[#0f172a]">Cara Kerja Sistem</h2>
                    <p className="mx-auto mb-10 max-w-3xl text-center text-[15px] leading-7 text-[#334155]">
                        Proses sederhana dan terstruktur dari login hingga pelaporan akreditasi
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute left-0 right-0 top-[84px] h-[1px] bg-[#e2e8f0]" />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {steps.map(({ number, title, description, Icon }, index) => (
                            <div
                                key={number}
                                className={`relative rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover-lift hover-scale cursor-pointer transition-all duration-300 scroll-animate ${
                                    isVisible ? 'visible' : ''
                                }`}
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <div className="absolute -left-2 -top-2 rounded-full bg-white px-2 py-1 text-xs text-[#0f172a] shadow ring-1 ring-[#e2e8f0] transition-transform duration-300 hover:scale-110">
                                    {number}
                                </div>
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
            </div>
        </section>
    );
}
