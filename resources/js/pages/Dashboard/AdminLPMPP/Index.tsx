import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminLPMPPDashboard from '@/components/dashboard/admin_lpmpp/dashboard';

export default function AdminLPMPPIndex(props: any) {
    return (
        <>
            <Head title="Dashboard Admin LPMPP" />
            <DashboardLayout title="Dashboard" subtitle="Kelola keseluruhan proses akreditasi dan monitoring kelengkapan dokumen">
                <AdminLPMPPDashboard {...props} />
            </DashboardLayout>
        </>
    );
}

