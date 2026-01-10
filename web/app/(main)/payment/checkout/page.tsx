export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PaymentCheckoutClient from './_components/payment-checkout-client';
import { reportError } from '@/lib/rollbar-utils';

interface CheckoutPageProps {
    searchParams: Promise<{
        appointmentId?: string;
    }>;
}

export default async function PaymentCheckoutPage({ searchParams }: CheckoutPageProps) {
    const { appointmentId } = await searchParams;

    if (!appointmentId) {
        redirect('/appointments');
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?returnUrl=/payment/checkout?appointmentId=${appointmentId}`);
    }

    try {
        const { data: appointmentResult, error } = await supabase
            .from('appointments')
            .select(`
                *,
                therapist:profiles!appointments_therapist_id_fkey(
                    full_name,
                    avatar_url,
                    specialization
                )
            `)
            .eq('id', appointmentId)
            .single();

        const appointment = appointmentResult as any;

        if (error || !appointment) {
            reportError(error || new Error('Appointment not found'), 'PaymentCheckoutPage:fetchAppointment', { appointmentId });
            redirect('/appointments');
        }

        // Check if appointment is already paid or cancelled
        if (appointment.status !== 'pending') {
            redirect('/appointments');
        }

        // Verify ownership
        if (appointment.patient_id !== user.id) {
            redirect('/appointments');
        }

        // Map user to client props
        const clientUser = {
            name: user.user_metadata?.full_name || '',
            email: user.email || '',
            contact: user.phone || ''
        };

        return (
            <div className="min-h-screen bg-[#0e181b] flex flex-col items-center">
                <PaymentCheckoutClient appointment={appointment} user={clientUser} />
            </div>
        );
    } catch (err) {
        reportError(err, 'PaymentCheckoutPage');
        redirect('/appointments');
    }
}
