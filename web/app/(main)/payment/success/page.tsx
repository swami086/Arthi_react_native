export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PaymentSuccessClient from './_components/payment-success-client';
import { reportError } from '@/lib/rollbar-utils';

interface SuccessPageProps {
    searchParams: Promise<{
        paymentId?: string;
    }>;
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
    const { paymentId } = await searchParams;

    if (!paymentId) {
        redirect('/appointments');
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    try {
        const { data: paymentResult, error } = await supabase
            .from('payments')
            .select(`
                *,
                appointment: appointments(
                    id,
                    start_time,
                    end_time,
                    status,
                    therapist:profiles!appointments_therapist_id_fkey(
                        full_name,
                        avatar_url,
                        specialization
                    )
                )
            `)
            .eq('id', paymentId)
            .single();

        const payment = paymentResult as any;

        if (error || !payment) {
            reportError(error || new Error('Payment not found'), 'PaymentSuccessPage:fetchPayment', { paymentId });
            redirect('/appointments');
        }

        if (payment.patient_id !== user.id) {
            redirect('/appointments');
        }

        return (
            <div className="min-h-screen bg-[#0e181b] flex flex-col items-center">
                <PaymentSuccessClient payment={payment} />
            </div>
        );
    } catch (err) {
        reportError(err, 'PaymentSuccessPage');
        redirect('/appointments');
    }
}
