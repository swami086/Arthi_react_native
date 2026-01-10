export const dynamic = 'force-dynamic';

import PaymentHistoryClient from './_components/payment-history-client';
import { getPaymentHistoryAction } from '@/app/actions/payment';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function PaymentHistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?returnUrl=/payment/history');
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-[#0e181b] flex flex-col items-center py-8 px-4">
            <PaymentHistoryClient />
        </div>
    );
}
