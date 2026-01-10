export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import PaymentDashboardClient from './_components/payment-dashboard-client';

export const metadata: Metadata = {
    title: 'Earnings & Payouts | SafeSpace Mentor',
    description: 'View your earnings, track payouts, and manage your payment history.',
};

export default async function MentorPaymentsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify mentor role
    const { data: profile } = await (supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id) as any)
        .single();

    if (profile?.role !== 'mentor') {
        redirect('/unauthorized');
    }

    return (
        <div className="container mx-auto">
            <PaymentDashboardClient user={user} />
        </div>
    );
}
