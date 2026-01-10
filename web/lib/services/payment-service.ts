import { createClient } from '../supabase/server';
import { PaymentWithAppointment, PaymentOrderData, PaymentVerification, MentorEarnings, PaymentWithMentee } from '../../types/payment';
import { reportError, withRollbarTrace, startTimer, endTimer } from '../rollbar-utils';

export const paymentService = {
    /**
     * Create Razorpay order via Supabase edge function
     */
    async createPaymentOrder(appointmentId: string, amount: number, currency: string = 'INR'): Promise<PaymentOrderData> {
        const supabase = await createClient();
        startTimer('payment_order_creation');

        try {
            const { data, error } = await supabase.functions.invoke('create-payment-order', {
                body: {
                    appointmentId,
                    amount,
                    currency
                },
                headers: withRollbarTrace()
            });

            if (error) {
                reportError(error, 'paymentService:createPaymentOrder', { appointmentId, amount });
                throw error;
            }

            endTimer('payment_order_creation', 'paymentService:createPaymentOrder', { appointmentId, amount });
            return data;
        } catch (error) {
            endTimer('payment_order_creation', 'paymentService:createPaymentOrder', { error: true, appointmentId });
            reportError(error, 'paymentService:createPaymentOrder');
            throw error;
        }
    },

    /**
     * Verify payment signature via Supabase edge function
     */
    async verifyPaymentSignature(verification: PaymentVerification): Promise<boolean> {
        const supabase = await createClient();
        startTimer('payment_verification');

        try {
            const { data, error } = await supabase.functions.invoke('verify-payment', {
                body: {
                    paymentId: verification.paymentId,
                    razorpay_order_id: verification.razorpayOrderId,
                    razorpay_payment_id: verification.razorpayPaymentId,
                    razorpay_signature: verification.razorpaySignature
                },
                headers: withRollbarTrace()
            });

            if (error) {
                reportError(error, 'paymentService:verifyPaymentSignature', { paymentId: verification.paymentId });
                throw error;
            }

            endTimer('payment_verification', 'paymentService:verifyPaymentSignature', { paymentId: verification.paymentId, success: data?.success });
            return data?.success || false;
        } catch (error) {
            endTimer('payment_verification', 'paymentService:verifyPaymentSignature', { error: true, paymentId: verification.paymentId });
            reportError(error, 'paymentService:verifyPaymentSignature');
            throw error;
        }
    },

    /**
     * Get payment history for user
     */
    async getPaymentHistory(userId: string): Promise<PaymentWithAppointment[]> {
        const supabase = await createClient();
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    appointment: appointments(
                        id,
                        start_time,
                        end_time,
                        mentor: profiles!appointments_mentor_id_fkey(
                            full_name,
                            avatar_url,
                            specialization
                        )
                    )
                `)
                .or(`mentee_id.eq.${userId},mentor_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as PaymentWithAppointment[];
        } catch (error) {
            reportError(error, 'paymentService:getPaymentHistory', { userId });
            throw error;
        }
    },

    /**
     * Get single payment details
     */
    async getPaymentById(paymentId: string): Promise<PaymentWithAppointment | null> {
        const supabase = await createClient();
        try {
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    appointment: appointments(
                        id,
                        start_time,
                        end_time,
                        mentor: profiles!appointments_mentor_id_fkey(
                            full_name,
                            avatar_url,
                            specialization
                        )
                    )
                `)
                .eq('id', paymentId)
                .single();

            if (error) throw error;
            return data as PaymentWithAppointment;
        } catch (error) {
            reportError(error, 'paymentService:getPaymentById', { paymentId });
            return null;
        }
    },

    /**
     * Update payment status manually (internal use)
     */
    async updatePaymentStatus(paymentId: string, status: string, razorpayData?: any): Promise<void> {
        const supabase = await createClient();
        try {
            const { error } = await (supabase
                .from('payments') as any)
                .update({
                    status: status as any,
                    ...razorpayData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentId);

            if (error) throw error;
        } catch (error) {
            reportError(error, 'paymentService:updatePaymentStatus', { paymentId, status });
            throw error;
        }
    },

    /**
     * Get earnings summary for a mentor
     */
    async getMentorEarnings(mentorId: string, startDate?: string, endDate?: string): Promise<MentorEarnings> {
        const supabase = await createClient();
        startTimer('mentor_earnings_fetch');
        try {
            let query = (supabase
                .from('payments') as any)
                .select('amount, mentor_payout, status, created_at')
                .eq('mentor_id', mentorId);

            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data, error } = await query;
            if (error) throw error;

            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            let total = 0;
            let thisMonth = 0;
            let lastMonth = 0;
            let pending = 0;
            let available = 0;

            const paymentData = (data || []) as any[];

            paymentData.forEach(payment => {
                const payout = payment.mentor_payout || (payment.amount * 0.9);
                const createdAt = new Date(payment.created_at);

                if (payment.status === 'completed') {
                    total += payout;
                    available += payout;

                    if (createdAt >= startOfThisMonth) {
                        thisMonth += payout;
                    } else if (createdAt >= startOfLastMonth && createdAt <= endOfLastMonth) {
                        lastMonth += payout;
                    }
                } else if (payment.status === 'pending' || payment.status === 'processing') {
                    pending += payout;
                }
            });

            // Trend is 0 if lastMonth is 0 to avoid Infinity or misleading 100%
            const trend = lastMonth === 0 ? 0 : ((thisMonth - lastMonth) / lastMonth) * 100;

            endTimer('mentor_earnings_fetch', 'paymentService:getMentorEarnings', { mentorId });
            return { total, thisMonth, lastMonth, pending, available, trend };
        } catch (error) {
            endTimer('mentor_earnings_fetch', 'paymentService:getMentorEarnings', { error: true, mentorId });
            reportError(error, 'paymentService:getMentorEarnings');
            throw error;
        }
    },

    /**
     * Get recent transactions for a mentor
     */
    async getMentorTransactions(mentorId: string, limit = 10, offset = 0): Promise<PaymentWithMentee[]> {
        const supabase = await createClient();
        try {
            const { data, error } = await (supabase
                .from('payments') as any)
                .select(`
                    *,
                    mentee: profiles!payments_mentee_id_fkey(full_name, avatar_url),
                    appointment: appointments(id, start_time, status)
                `)
                .eq('mentor_id', mentorId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return data as PaymentWithMentee[];
        } catch (error) {
            reportError(error, 'paymentService:getMentorTransactions', { mentorId });
            throw error;
        }
    },

    /**
     * Get detailed payment breakdown for a mentor
     */
    async getMentorPaymentBreakdown(mentorId: string) {
        const supabase = await createClient();
        try {
            const { data, error } = await (supabase
                .from('payments') as any)
                .select(`
                    id,
                    amount,
                    mentor_payout,
                    status,
                    created_at,
                    mentee: profiles!payments_mentee_id_fkey(id, full_name, avatar_url),
                    appointment: appointments(id, start_time, status)
                `)
                .eq('mentor_id', mentorId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as PaymentWithMentee[];
        } catch (error) {
            reportError(error, 'paymentService:getMentorPaymentBreakdown', { mentorId });
            throw error;
        }
    }
};


