import { useState } from 'react';
import { supabase } from '../../../api/supabase';
import { Payment } from '../../../api/types';
import { Alert } from 'react-native';
import { NotificationService } from '../../notifications/services/notificationService';
import { reportError, reportInfo, getTraceId, startSpan, endSpan } from '../../../services/rollbar';

export const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiatePayment = async (
        appointmentId: string,
        amount: number,
        currency: string = 'INR'
    ) => {
        startSpan('hook.payment.initiate');
        setLoading(true);
        try {
            reportInfo('Initiating payment', 'usePayment:initiatePayment', {
                appointmentId,
                amount,
                trace_id: getTraceId()
            });
            // In a real implementation, this would call your Edge Function to create an order
            // For now, we simulate creating a payment record directly, propagating the trace
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Fetch appointment to get therapist_id
            const { data: appointment } = await supabase
                .from('appointments')
                .select('therapist_id')
                .eq('id', appointmentId)
                .single();

            if (!appointment) throw new Error('Appointment not found');

            const { data, error: insertError } = await supabase
                .from('payments')
                .insert({
                    appointment_id: appointmentId,
                    patient_id: user.id,
                    therapist_id: appointment.therapist_id,
                    amount,
                    currency,
                    status: 'pending',
                    payment_method: 'upi',
                    // Note: Supabase JS library doesn't easily accept headers on .insert() calls directly 
                    // unless using a function. For DB operations, we rely on the context reportInfo logs.
                    // If we were calling an Edge Function, we'd use .invoke('fn', { headers: withRollbarTrace() })
                })
                .select()
                .single();

            if (insertError) throw insertError;

            reportInfo('Payment record created', 'usePayment:initiatePayment:insert', {
                paymentId: data.id,
                trace_id: getTraceId()
            });
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Payment initiation error:', err);
            reportError(err, 'usePayment:initiatePayment');
            throw err;
        } finally {
            setLoading(false);
            endSpan();
        }
    };

    const handlePaymentResponse = async (paymentId: string, status: 'completed' | 'failed', failureReason?: string) => {
        setLoading(true);
        try {
            reportInfo('Handling payment response', 'usePayment:handlePaymentResponse', {
                paymentId,
                status,
                trace_id: getTraceId()
            });
            const { error } = await supabase
                .from('payments')
                .update({
                    status,
                    failure_reason: failureReason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', paymentId);

            if (error) throw error;

            // If payment successful, update appointment payment status
            if (status === 'completed') {
                // Get appointment ID from payment
                const { data: payment } = await supabase
                    .from('payments')
                    .select('appointment_id, patient_id, therapist_id, amount')
                    .eq('id', paymentId)
                    .single();

                if (payment?.appointment_id) {
                    await supabase
                        .from('appointments')
                        .update({
                            payment_status: 'paid',
                            status: 'confirmed' // Auto-confirm on payment
                        })
                        .eq('id', payment.appointment_id);

                    // Notify Patient
                    await NotificationService.createNotification(
                        payment.patient_id,
                        'Payment Successful',
                        `Your payment of $${payment.amount} was successful. Appointment confirmed!`,
                        'payment',
                        payment.appointment_id
                    );

                    // Notify Therapist
                    await NotificationService.createNotification(
                        payment.therapist_id,
                        'New Appointment',
                        'You have a new confirmed appointment.',
                        'appointment',
                        payment.appointment_id
                    );
                }
            }

            reportInfo('Payment processing complete', 'usePayment:handlePaymentResponse:complete', {
                paymentId,
                status,
                trace_id: getTraceId()
            });
            return true;
        } catch (err: any) {
            setError(err.message);
            reportError(err, 'usePayment:handlePaymentResponse');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Simulate UPI processing
    const simulateUPIPayment = async (paymentId: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(async () => {
                const success = Math.random() > 0.1; // 90% success rate
                await handlePaymentResponse(
                    paymentId,
                    success ? 'completed' : 'failed',
                    success ? undefined : 'Bank server timeout'
                );
                resolve(success);
            }, 3000);
        });
    };

    return {
        loading,
        error,
        initiatePayment,
        handlePaymentResponse,
        simulateUPIPayment
    };
};
