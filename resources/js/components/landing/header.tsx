import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface HeaderProps {
    auth?: {
        user?: {
            name: string;
            email: string;
        } | null;
    };
}

export default function Header({ auth }: HeaderProps) {
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['fitur', 'peran', 'cara-kerja', 'kontak'];
            const scrollPosition = window.scrollY + 150;

            let currentSection = '';
            
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        currentSection = section;
                        break;
                    }
                }
            }

            // If scrolled to top, clear active section
            if (window.scrollY < 100) {
                setActiveSection('');
            } else if (currentSection) {
                setActiveSection(currentSection);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { post } = useForm();

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });

            // Add pulse animation to target section
            element.classList.add('animate-pulse-once');
            setTimeout(() => {
                element.classList.remove('animate-pulse-once');
            }, 1000);
        }
    };

    const handleLogout = () => {
        post('/logout');
    };

    return (
        <header
            className="w-full bg-white shadow-sm border-b border-[#e3e3e0] dark:bg-[#161615] dark:border-[#3E3E3A] sticky top-0 z-50 transition-shadow duration-300"
            style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}
        >
            <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 hover-scale transition-transform duration-300">
                    <img
                        src="/images/logo.png"
                        alt="Logo Madani"
                        className="h-20 w-20 rounded-lg object-contain p-2 transition-transform duration-300 hover:rotate-3"
                    />
                    <span className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold tracking-widest text-[#1b1b18] dark:text-[#EDEDEC]">MADANI</span>
                        <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Aplikasi Akreditasi</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                    <a
                        href="#fitur"
                        onClick={(e) => handleNavClick(e, 'fitur')}
                        className={`transition-all duration-300 hover:text-[#2563EB] dark:hover:text-[#2563EB] relative ${
                            activeSection === 'fitur' ? 'text-[#2563EB] font-semibold' : ''
                        }`}
                    >
                        Fitur Utama
                        {activeSection === 'fitur' && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#2563EB] animate-slide-in-left" />
                        )}
                    </a>
                    <a
                        href="#peran"
                        onClick={(e) => handleNavClick(e, 'peran')}
                        className={`transition-all duration-300 hover:text-[#2563EB] dark:hover:text-[#2563EB] relative ${
                            activeSection === 'peran' ? 'text-[#2563EB] font-semibold' : ''
                        }`}
                    >
                        Peran Pengguna
                        {activeSection === 'peran' && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#2563EB] animate-slide-in-left" />
                        )}
                    </a>
                    <a
                        href="#cara-kerja"
                        onClick={(e) => handleNavClick(e, 'cara-kerja')}
                        className={`transition-all duration-300 hover:text-[#2563EB] dark:hover:text-[#2563EB] relative ${
                            activeSection === 'cara-kerja' ? 'text-[#2563EB] font-semibold' : ''
                        }`}
                    >
                        Cara Kerja
                        {activeSection === 'cara-kerja' && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#2563EB] animate-slide-in-left" />
                        )}
                    </a>
                </nav>

                <div className="flex items-center gap-3">
                    {auth?.user ? (
                        <>
                            <span className="text-sm text-[#64748b] hidden md:inline">
                                {auth.user.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="inline-block rounded-sm border border-transparent bg-[#2563EB] px-4 py-1.5 text-sm leading-normal text-white hover:bg-[#1E4ED0] transition-all duration-300 hover-scale"
                            >
                                Keluar
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-block rounded-sm border border-transparent bg-[#2563EB] px-4 py-1.5 text-sm leading-normal text-white hover:bg-[#1E4ED0] transition-all duration-300 hover-scale"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="inline-block rounded-sm border border-[#2563EB] px-4 py-1.5 text-sm leading-normal text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all duration-300 hover-scale"
                            >
                                Daftar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
