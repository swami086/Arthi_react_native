import { supabase } from './supabase';
import { Payment } from './types';
import { reportError, withRollbarTrace, withRollbarSpan, startSpan, endSpan, startTimer, endTimer, getTraceId } from '../services/rollbar';

// Razorpay configuration (Placeholder for now, in Direct UPI context these might be less used but kept for plan consistency)
const RAZORPAY_KEY_ID = '';
const RAZORPAY_KEY_SECRET = '';

export interface CreateOrderParams {
    appointmentId: string;
    amount: number;
    currency?: string;
    notes?: Record<string, string>;
}

export interface PaymentVerification {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

/**
 * Create Razorpay order for appointment payment
 */
export const createPaymentOrder = async (params: CreateOrderParams): Promise<any> => {
    startTimer('payment_order_creation');
    try {
        const { data, error } = await supabase.functions.invoke('create-payment-order', {
            body: {
                appointmentId: params.appointmentId,
                amount: params.amount,
                currency: params.currency || 'INR'
            },
            headers: withRollbarSpan('api.payment.createOrder')
        });

        if (error) {
            reportError(error, 'paymentService:createPaymentOrder', {
                appointmentId: params.appointmentId,
                amount: params.amount
            });
            throw error;
        }

        endTimer('payment_order_creation', 'paymentService:createPaymentOrder', {
            appointmentId: params.appointmentId,
            amount: params.amount
        });
        return data;
    } catch (error) {
        endTimer('payment_order_creation', 'paymentService:createPaymentOrder', {
            error: true,
            appointmentId: params.appointmentId
        });
        reportError(error, 'paymentService:createPaymentOrder');
        throw error;
    } finally {
        endSpan();
    }
};

/**
 * Verify payment signature and update payment status
 */
export const verifyPayment = async (verification: PaymentVerification): Promise<boolean> => {
    startTimer('payment_verification');
    try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: verification,
            headers: withRollbarSpan('api.payment.verify')
        });

        if (error) {
            reportError(error, 'paymentService:verifyPayment', {
                paymentId: (verification as any).paymentId
            });
            throw error;
        }

        endTimer('payment_verification', 'paymentService:verifyPayment', {
            paymentId: (verification as any).paymentId,
            success: data?.success
        });
        return data.success;
    } catch (error) {
        endTimer('payment_verification', 'paymentService:verifyPayment', {
            error: true,
            paymentId: (verification as any).paymentId
        });
        reportError(error, 'paymentService:verifyPayment');
        throw error;
    } finally {
        endSpan();
    }
};

/**
 * Get payment history for user
 */
export const getPaymentHistory = async (userId: string): Promise<Payment[]> => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select(`
    *,
    appointment: appointments(
        id,
        start_time,
        end_time,
        mentor: profiles!mentor_id(full_name, avatar_url)
    )
      `)
            .or(`mentee_id.eq.${userId}, mentor_id.eq.${userId} `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as any[]; // Type cast as supabase selector join types can be complex
    } catch (error) {
        console.error('Error fetching payment history:', error);
        reportError(error, 'paymentService:getPaymentHistory');
        throw error;
    }
};

/**
 * Get payment details by ID
 */
export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching payment:', error);
        reportError(error, 'paymentService:getPaymentById');
        return null;
    }
};

/**
 * Request refund for payment
 */
export const requestRefund = async (paymentId: string, reason: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase.functions.invoke('request-refund', {
            body: { paymentId, reason },
            headers: withRollbarSpan('requestRefund')
        });

        if (error) throw error;
        return data.success;
    } catch (error) {
        console.error('Error requesting refund:', error);
        reportError(error, 'paymentService:requestRefund');
        throw error;
    } finally {
        endSpan();
    }
};

/**
 * Get mentor earnings summary
 */
export const getMentorEarnings = async (
    mentorId: string,
    startDate?: string,
    endDate?: string
): Promise<any> => {
    try {
        const { data, error } = await supabase.rpc('get_mentor_earnings', {
            mentor_user_id: mentorId,
            start_date: startDate,
            end_date: endDate
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching mentor earnings:', error);
        reportError(error, 'paymentService:getMentorEarnings');
        throw error;
    }
};
