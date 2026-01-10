import { supabase } from './supabase';
import { Appointment, Profile } from './types';
import { sendNotification } from './notificationService';
import { sendWhatsAppMessage } from './whatsappService';
import { reportError, withRollbarSpan, endSpan } from '../services/rollbar';

/**
 * Update appointment status and notify relevant parties
 */
export const updateAppointmentStatus = async (
    appointmentId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    notes?: string
) => {
    withRollbarSpan('updateAppointmentStatus');
    try {
        console.log(`[appointmentService] Starting updateAppointmentStatus for ${appointmentId} to ${status}`);
        // 1. Fetch current appointment details to get mentor_id and mentee_id
        console.log(`[appointmentService] Fetching appointment data...`);
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select('*, mentor:profiles!mentor_id(*), mentee:profiles!mentee_id(*)')
            .eq('id', appointmentId)
            .single();

        if (fetchError || !appointment) throw fetchError || new Error('Appointment not found');

        console.log(`[appointmentService] Updating appointment status in DB...`);
        // 2. Update status
        const { data: updatedAppointment, error: updateError } = await supabase
            .from('appointments')
            .update({ status, notes: notes || appointment.notes })
            .eq('id', appointmentId)
            .select()
            .single();

        if (updateError) throw updateError;

        console.log(`[appointmentService] Sending notification and WhatsApp...`);
        // 3. Send Notification to Mentor (if status changed by mentee)
        // In this app context, assume if mentee confirms/declines, it's a mentee action
        const menteeName = (appointment.mentee as any)?.full_name || 'A mentee';
        const mentorId = appointment.mentor_id;

        const statusText = status === 'confirmed' ? 'confirmed' : (status === 'cancelled' ? 'cancelled' : 'declined');
        const title = `Session ${status.charAt(0).toUpperCase() + status.slice(1)}`;

        let sessionDate = 'TBD';
        try {
            if (appointment.start_time) {
                const d = new Date(appointment.start_time);
                if (!isNaN(d.getTime())) {
                    sessionDate = d.toLocaleDateString();
                }
            }
        } catch (e) {
            console.warn('Error formatting date for notification:', e);
        }

        const message = `${menteeName} has ${statusText} the session scheduled for ${sessionDate}.`;

        await sendNotification({
            user_id: mentorId,
            title,
            message,
            type: 'appointment',
            related_entity_id: appointmentId,
            metadata: {
                action: status,
                previous_status: appointment.status
            }
        });

        // 4. (Optional) Send WhatsApp Notification to Mentor if they have a phone number
        const mentor = appointment.mentor as Profile;
        if (mentor?.phone_number) {
            try {
                await sendWhatsAppMessage({
                    recipientId: mentorId,
                    phoneNumber: mentor.phone_number,
                    messageType: status === 'confirmed' ? 'confirmation' : 'cancellation',
                    appointmentId: appointmentId,
                    templateData: {
                        menteeName,
                        date: new Date(appointment.start_time).toLocaleDateString(),
                        time: new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: statusText
                    }
                });
            } catch (wsError) {
                console.warn('WhatsApp notification failed, but appointment updated:', wsError);
                // Don't throw here as the primary update succeeded
            }
        }

        endSpan();
        return updatedAppointment;
    } catch (error) {
        console.error('Error updating appointment status:', error);
        reportError(error, 'appointmentService:updateAppointmentStatus');
        endSpan();
        throw error;
    }
};
