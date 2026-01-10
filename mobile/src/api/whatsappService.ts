import { supabase } from './supabase';
import { reportError, withRollbarTrace, withRollbarSpan, endSpan } from '../services/rollbar';
import { WhatsAppMessage } from './types';

export interface SendWhatsAppParams {
    appointmentId?: string;
    recipientId: string;
    phoneNumber: string;
    messageType: 'confirmation' | 'reminder' | 'cancellation' | 'booking_link';
    templateData?: Record<string, string>;
}

/**
 * Send WhatsApp message via Supabase Edge Function
 */
export const sendWhatsAppMessage = async (params: SendWhatsAppParams): Promise<boolean> => {
    try {
        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
            body: params,
            headers: withRollbarSpan('sendWhatsAppMessage')
        });

        if (error) throw error;
        endSpan();
        return data.success;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        reportError(error, 'whatsappService:sendWhatsAppMessage');
        throw error;
    }
};

/**
 * Send appointment confirmation via WhatsApp
 */
export const sendAppointmentConfirmation = async (
    appointmentId: string,
    recipientId: string,
    phoneNumber: string,
    appointmentDetails: {
        therapistName: string;
        date: string;
        time: string;
        meetingLink: string;
    }
): Promise<boolean> => {
    return sendWhatsAppMessage({
        appointmentId,
        recipientId,
        phoneNumber,
        messageType: 'confirmation',
        templateData: appointmentDetails
    });
};

/**
 * Send appointment reminder (24h before)
 */
export const sendAppointmentReminder = async (
    appointmentId: string,
    recipientId: string,
    phoneNumber: string,
    appointmentDetails: {
        therapistName: string;
        date: string;
        time: string;
    }
): Promise<boolean> => {
    return sendWhatsAppMessage({
        appointmentId,
        recipientId,
        phoneNumber,
        messageType: 'reminder',
        templateData: appointmentDetails
    });
};

/**
 * Send cancellation notification
 */
export const sendCancellationNotification = async (
    appointmentId: string,
    recipientId: string,
    phoneNumber: string,
    reason?: string
): Promise<boolean> => {
    return sendWhatsAppMessage({
        appointmentId,
        recipientId,
        phoneNumber,
        messageType: 'cancellation',
        templateData: { reason: reason || 'Appointment cancelled' }
    });
};

/**
 * Get WhatsApp message history for user
 */
export const getWhatsAppMessages = async (userId: string): Promise<WhatsAppMessage[]> => {
    try {
        const { data, error } = await supabase
            .from('whatsapp_messages')
            .select('*')
            .eq('recipient_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching WhatsApp messages:', error);
        reportError(error, 'whatsappService:getWhatsAppMessages');
        return [];
    }
};
