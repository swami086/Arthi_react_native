import { useState } from 'react';
import { supabase } from '../../../api/supabase';
import { Payment } from '../../../api/types';
import { Alert } from 'react-native';
import { NotificationService } from '../../notifications/services/notificationService';
import { reportError } from '../../../services/rollbar';

export const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiatePayment = async (
        appointmentId: string,
        amount: number,
        currency: string = 'INR'
    ) => {
        setLoading(true);
        setError(null);
        try {
            // In a real implementation, this would call your Edge Function to create an order
            // For now, we simulate creating a payment record directly
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Fetch appointment to get mentor_id
            const { data: appointment } = await supabase
                .from('appointments')
                .select('mentor_id')
                .eq('id', appointmentId)
                .single();

            if (!appointment) throw new Error('Appointment not found');

            const { data, error: insertError } = await supabase
                .from('payments')
                .insert({
                    appointment_id: appointmentId,
                    mentee_id: user.id,
                    mentor_id: appointment.mentor_id,
                    amount,
                    currency,
                    status: 'pending',
                    payment_method: 'upi',
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Payment initiation error:', err);
            reportError(err, 'usePayment:initiatePayment');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentResponse = async (paymentId: string, status: 'completed' | 'failed', failureReason?: string) => {
        setLoading(true);
        try {
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
                    .select('appointment_id, mentee_id, mentor_id, amount')
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

                    // Notify Mentee
                    await NotificationService.createNotification(
                        payment.mentee_id,
                        'Payment Successful',
                        `Your payment of $${payment.amount} was successful. Appointment confirmed!`,
                        'payment',
                        payment.appointment_id
                    );

                    // Notify Mentor
                    await NotificationService.createNotification(
                        payment.mentor_id,
                        'New Appointment',
                        'You have a new confirmed appointment.',
                        'appointment',
                        payment.appointment_id
                    );
                }
            }

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
