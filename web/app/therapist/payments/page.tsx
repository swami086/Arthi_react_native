export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import PaymentDashboardClient from './_components/payment-dashboard-client';

export const metadata: Metadata = {
    title: 'Earnings & Payouts | SafeSpace Therapist',
    description: 'View your earnings, track payouts, and manage your payment history.',
};

export default async function TherapistPaymentsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify therapist role
    const { data: profile } = await (supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id) as any)
        .single();

    if (profile?.role !== 'therapist') {
        redirect('/unauthorized');
    }

    return (
        <div className="container mx-auto">
            <PaymentDashboardClient user={user} />
        </div>
    );
}
