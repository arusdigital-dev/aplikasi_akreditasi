import { Head, usePage } from '@inertiajs/react';
import Header from '@/components/landing/header';
import HeroSection from '@/components/landing/hero-section';
import MainFeature from '@/components/landing/main-feature';
import FeatureOverview from '@/components/landing/feature-overview';
import Role from '@/components/landing/role.jsx';
import HowItWorks from '@/components/landing/how-it-works';
import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';

export default function LandingPage() {
    const { auth } = usePage().props as { auth?: { user?: { name: string; email: string } | null } };

    return (
        <>
            <Head title="Aplikasi Akreditasi">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=outfit:400,500,600,700" rel="stylesheet" />
            </Head>
            <Header auth={auth} />
            <HeroSection />
            <MainFeature />
            <FeatureOverview />
            <Role />
            <HowItWorks />
            <CTA />
            <Footer />
        </>
    );
}
