import { Payment as DBPayment } from './database';

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id: string;
    prefill: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme: {
        color: string;
    };
    handler: (response: RazorpayResponse) => void;
    modal?: {
        ondismiss?: () => void;
    };
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface PaymentOrderData {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    client_payment_id: string; // Internal payment record ID
}

export interface PaymentVerification {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export type PaymentWithAppointment = DBPayment & {
    appointment: {
        id: string;
        start_time: string;
        end_time: string;
        therapist: {
            full_name: string | null;
            avatar_url: string | null;
            specialization: string | null;
        } | null;
    } | null;
};

export interface TherapistEarnings {
    total: number;
    thisMonth: number;
    lastMonth: number;
    pending: number;
    available: number;
    trend: number; // percentage change
}

export interface EarningsChartData {
    labels: string[];
    data: number[];
}

export type PaymentWithPatient = DBPayment & {
    patient?: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    appointment?: {
        id: string;
        start_time: string;
        status: string;
    } | null;
};

