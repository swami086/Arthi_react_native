'use server';

import { paymentService } from '@/lib/services/payment-service';
import { createClient } from '@/lib/supabase/server';
import { TherapistEarnings, PaymentWithPatient } from '@/types/payment';

async function getAuthenticatedUser() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('practice_id')
        .eq('user_id', user.id)
        .single();

    if (profError) throw new Error('Failed to fetch practice context');

    return { user, practiceId: profile?.practice_id };
}

export async function getTherapistEarningsAction(): Promise<TherapistEarnings> {
    const { user, practiceId } = await getAuthenticatedUser();
    return paymentService.getTherapistEarnings(user.id, practiceId);
}

export async function getTherapistTransactionsAction(limit: number): Promise<PaymentWithPatient[]> {
    const { user, practiceId } = await getAuthenticatedUser();
    return paymentService.getTherapistTransactions(user.id, practiceId, limit);
}

export async function getTherapistPaymentBreakdownAction(): Promise<PaymentWithPatient[]> {
    const { user, practiceId } = await getAuthenticatedUser();
    return paymentService.getTherapistPaymentBreakdown(user.id, practiceId);
}

export async function handlePaymentSuccess(
    paymentId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
) {
    try {
        const success = await paymentService.verifyPaymentSignature({
            paymentId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        });
        return { success };
    } catch (error) {
        return { success: false, error: 'Payment verification failed' };
    }
}

export async function initiatePayment(appointmentId: string, amount: number) {
    try {
        // Amount check or fetching logic could be here if needed
        const order = await paymentService.createPaymentOrder(appointmentId, amount);
        return { success: true, data: order };
    } catch (error: any) {
        console.error('Initiate payment failed', error);
        return { success: false, error: error.message || 'Payment initiation failed' };
    }
}

export async function handlePaymentFailure(paymentId: string, reason: string) {
    try {
        await paymentService.updatePaymentStatus(paymentId, 'failed', { error_reason: reason });
        return { success: true };
    } catch (error: any) {
        console.error('Payment failure handling failed', error);
        return { success: false, error: error.message || 'Failed to update payment status' };
    }
}

export async function getPaymentHistoryAction() {
    try {
        const { user, practiceId } = await getAuthenticatedUser();
        const history = await paymentService.getPaymentHistory(user.id, practiceId);
        return { success: true, data: history };
    } catch (error: any) {
        console.error('Get payment history failed', error);
        return { success: false, error: error.message || 'Failed to fetch payment history' };
    }
}
