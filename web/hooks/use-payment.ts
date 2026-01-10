'use client';

import { useState } from 'react';
import { loadRazorpayScript } from '@/lib/utils/razorpay-loader';
import { RazorpayOptions, RazorpayResponse } from '@/types/payment';
import { useRouter } from 'next/navigation';

export function usePayment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const openRazorpayCheckout = async (
        orderData: any,
        appointmentId: string,
        userDetails: { name?: string, email?: string, contact?: string }
    ) => {
        setLoading(true);
        setError(null);

        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            setError('Failed to load payment gateway');
            setLoading(false);
            return;
        }

        const options: RazorpayOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: 'SafeSpace',
            description: 'Session booking',
            order_id: orderData.id,
            prefill: userDetails,
            theme: {
                color: '#6366f1' // Primary branding color
            },
            handler: async (response: RazorpayResponse) => {
                // Navigate to processing page with details
                const params = new URLSearchParams({
                    paymentId: orderData.client_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature
                });
                router.push(`/payment/processing?${params.toString()}`);
            },
            modal: {
                ondismiss: async () => {
                    try {
                        await fetch('/api/payment/failure', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                paymentId: orderData.client_payment_id,
                                reason: 'Payment cancelled by user'
                            })
                        });
                    } catch (e) {
                        console.error('Failed to report payment cancellation', e);
                    }
                    setLoading(false);
                }
            }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

    const startPayment = async (appointmentId: string, amount: number, userDetails: { name?: string, email?: string, contact?: string }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, amount })
            });

            const result = await response.json();

            if (response.ok && result.success && result.data) {
                await openRazorpayCheckout(result.data, appointmentId, userDetails);
            } else {
                setError(result.error || 'Failed to initiate payment');
                setLoading(false);
            }
        } catch (err) {
            setError((err as Error).message);
            setLoading(false);
        }
    };

    return {
        startPayment,
        loading,
        error
    };
}
