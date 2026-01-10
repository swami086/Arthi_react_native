import { useState, useCallback } from 'react';
import { parse, isValid } from 'date-fns';
import { TimeSlot, generateTimeSlots, filterAvailableSlots } from '../utils/timeSlots';
import { supabase } from '../../../api/supabase';
import { reportError } from '../../../services/rollbar';

/**
 * Hook to manage the booking flow logic.
 * Handles fetching available time slots and creating appointments.
 */
export const useBookingFlow = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches and generates available time slots for a given therapist and date.
     * 
     * @param {string} therapistId - The ID of the therapist.
     * @param {string} date - The selected date (YYYY-MM-DD).
     * @param {'morning' | 'afternoon' | 'evening'} [timeOfDay] - Optional filter for time of day.
     * @returns {Promise<TimeSlot[]>} A promise resolving to a list of time slots.
     */
    const getAvailableTimeSlots = useCallback(async (therapistId: string, date: string, timeOfDay?: 'morning' | 'afternoon' | 'evening') => {
        setLoading(true);
        try {
            // Define the start and end of the selected day
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Fetch existing appointments for the therapist on this date
            const { data: existingAppointments, error: fetchError } = await supabase
                .from('appointments')
                .select('start_time, end_time')
                .eq('therapist_id', therapistId)
                .gte('start_time', startOfDay.toISOString())
                .lte('start_time', endOfDay.toISOString());

            if (fetchError) throw fetchError;

            // Generate slots
            // Ensure date parsing matches local day constraints
            // We use T12:00:00 to avoid timezone shifts when generating slots for "today"
            const dayMid = new Date(date + 'T12:00:00');

            const slots = generateTimeSlots(dayMid, timeOfDay);
            const availableSlots = filterAvailableSlots(therapistId, date, slots, existingAppointments || []);
            return availableSlots;
        } catch (err: any) {
            console.error('Error fetching slots:', err);
            reportError(err, 'useBookingFlow:getAvailableTimeSlots');
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Creates a new appointment in the database.
     * 
     * @param {object} appointmentData - The appointment details.
     * @returns {Promise<boolean>} True if successful.
     */
    const createAppointment = useCallback(async (appointmentData: {
        therapistId: string;
        date: string;
        time: string;
        endTime: string;
        price: number;
        notes?: string;
    }) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Construct ISO strings for start_time and end_time using date-fns for reliability
            // appointmentData.date is YYYY-MM-DD
            // appointmentData.time is "h:mm a" (e.g. "10:00 AM")

            // Helper to parse date and time
            const parseDateTime = (d: string, t: string) => {
                const parsed = parse(`${d} ${t}`, 'yyyy-MM-dd h:mm a', new Date());
                if (!isValid(parsed)) {
                    throw new Error(`Invalid date/time format: ${d} ${t}`);
                }
                return parsed;
            };

            const startDateTime = parseDateTime(appointmentData.date, appointmentData.time);
            const endDateTime = parseDateTime(appointmentData.date, appointmentData.endTime);

            // Double check for NaN (isValid covers this, but being explicit per instructions)
            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                throw new Error('Failed to parse appointment date/time');
            }

            // 1. Create Appointment first
            const { data: appointment, error: insertError } = await supabase.from('appointments').insert([
                {
                    therapist_id: appointmentData.therapistId,
                    patient_id: user.id,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    status: 'pending',
                    price: appointmentData.price,
                    notes: appointmentData.notes,
                    meeting_link: null, // Will be updated after video room creation
                    video_room_id: null
                }
            ]).select().single();

            if (insertError) throw insertError;

            // 2. Create Video Room (Simulating Google Meet creation or using Edge Function in future)
            const meetCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
            const meetLink = `https://meet.google.com/${meetCode}`;

            const { data: videoRoom, error: videoError } = await supabase.from('video_rooms').insert({
                appointment_id: appointment.id,
                room_name: `Session-${appointment.id.substring(0, 8)}`,
                room_url: meetLink,
                provider: 'google_meet',
                google_meet_code: meetCode,
                status: 'created',
                created_at: new Date().toISOString(),
                recording_enabled: false
            }).select().single();

            if (videoError) {
                console.error("Failed to create video room", videoError);
                // Don't fail the whole booking, but log it. 
                // However, we should try to update the appointment with just the link if room creation fails?
                // For now, throw to ensure integrity.
                throw videoError;
            }

            // 3. Update Appointment with Video Room details
            const { data: updatedAppointment, error: updateError } = await supabase
                .from('appointments')
                .update({
                    meeting_link: meetLink,
                    video_room_id: videoRoom.id
                })
                .eq('id', appointment.id)
                .select()
                .single();

            if (updateError) throw updateError;

            return updatedAppointment;
        } catch (err: any) {
            console.error('Booking error:', err);
            reportError(err, 'useBookingFlow:createAppointment');
            setError(err.message || 'Failed to create appointment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getAvailableTimeSlots,
        createAppointment
    };
};
