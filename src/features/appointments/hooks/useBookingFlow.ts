import { useState, useCallback } from 'react';
import { parse, isValid } from 'date-fns';
import { TimeSlot, generateTimeSlots, filterAvailableSlots } from '../utils/timeSlots';
import { supabase } from '../../../api/supabase';

/**
 * Hook to manage the booking flow logic.
 * Handles fetching available time slots and creating appointments.
 */
export const useBookingFlow = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches and generates available time slots for a given mentor and date.
     * 
     * @param {string} mentorId - The ID of the mentor.
     * @param {string} date - The selected date (YYYY-MM-DD).
     * @param {'morning' | 'afternoon' | 'evening'} [timeOfDay] - Optional filter for time of day.
     * @returns {Promise<TimeSlot[]>} A promise resolving to a list of time slots.
     */
    const getAvailableTimeSlots = useCallback(async (mentorId: string, date: string, timeOfDay?: 'morning' | 'afternoon' | 'evening') => {
        setLoading(true);
        try {
            // Define the start and end of the selected day
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Fetch existing appointments for the mentor on this date
            const { data: existingAppointments, error: fetchError } = await supabase
                .from('appointments')
                .select('start_time, end_time')
                .eq('mentor_id', mentorId)
                .gte('start_time', startOfDay.toISOString())
                .lte('start_time', endOfDay.toISOString());

            if (fetchError) throw fetchError;

            // Generate slots
            // Ensure date parsing matches local day constraints
            // We use T12:00:00 to avoid timezone shifts when generating slots for "today"
            const dayMid = new Date(date + 'T12:00:00');

            const slots = generateTimeSlots(dayMid, timeOfDay);
            const availableSlots = filterAvailableSlots(mentorId, date, slots, existingAppointments || []);
            return availableSlots;
        } catch (err: any) {
            console.error('Error fetching slots:', err);
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
        mentorId: string;
        date: string;
        time: string;
        endTime: string;
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

            const { data, error: insertError } = await supabase.from('appointments').insert([
                {
                    mentor_id: appointmentData.mentorId,
                    mentee_id: user.id,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    status: 'pending',
                    notes: appointmentData.notes
                }
            ]).select().single();

            if (insertError) throw insertError;
            return data;
        } catch (err: any) {
            console.error('Booking error:', err);
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
