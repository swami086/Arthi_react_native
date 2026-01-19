import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { format, parseISO, addMinutes, setHours, setMinutes, isBefore, parse } from "https://esm.sh/date-fns@2.30.0";

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Searches for therapists based on query and specialization.
 */
export async function searchTherapists(query?: string, specialization?: string) {
    let dbQuery = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'therapist');

    if (specialization) {
        dbQuery = dbQuery.ilike('specialization', `%${specialization}%`);
    }

    if (query) {
        dbQuery = dbQuery.or(`full_name.ilike.%${query}%,bio.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery.limit(6);
    if (error) throw error;
    return data;
}

/**
 * Fetches available time slots for a therapist on a specific date.
 */
export async function getAvailableTimeSlots(therapistId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingAppointments, error: fetchError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('therapist_id', therapistId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .neq('status', 'cancelled');

    if (fetchError) throw fetchError;

    const slots: any[] = [];
    const startHour = 9;
    const endHour = 19;
    const slotDuration = 45;
    const interval = 60;

    // Generate slots for the day
    let currentTime = setMinutes(setHours(new Date(date), startHour), 0);
    const endTime = setMinutes(setHours(new Date(date), endHour), 0);

    while (isBefore(currentTime, endTime)) {
        const slotEnd = addMinutes(currentTime, slotDuration);
        const timeString = format(currentTime, 'h:mm a');
        const endTimeString = format(slotEnd, 'h:mm a');

        const slotStartVal = currentTime;
        const slotEndVal = slotEnd;

        const isBooked = (existingAppointments || []).some(appt => {
            const apptStart = new Date(appt.start_time);
            const apptEnd = new Date(appt.end_time);
            return slotStartVal < apptEnd && slotEndVal > apptStart;
        });

        slots.push({
            time: timeString,
            endTime: endTimeString,
            available: !isBooked
        });

        currentTime = addMinutes(currentTime, interval);
    }

    return slots;
}

/**
 * Creates an appointment and a video room.
 */
export async function createAppointment(userId: string, data: {
    therapistId: string;
    date: string;
    time: string;
    endTime: string;
    price?: number;
    notes?: string;
}) {
    const parseDateTime = (d: string, t: string) => {
        return parse(`${d} ${t}`, 'yyyy-MM-dd h:mm a', new Date());
    };

    const startDateTime = parseDateTime(data.date, data.time);
    const endDateTime = parseDateTime(data.date, data.endTime);

    const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
            therapist_id: data.therapistId,
            patient_id: userId,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            status: 'confirmed',
            price: data.price || 1500,
            notes: data.notes || 'Booked via BookingAgent',
        })
        .select('*')
        .single();

    if (error) throw error;

    // Create video room
    const meetCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    const meetLink = `https://meet.google.com/${meetCode}`;

    await supabase
        .from('video_rooms')
        .insert({
            appointment_id: appointment.id,
            room_name: `Session-${appointment.id.substring(0, 8)}`,
            room_url: meetLink,
            provider: 'google_meet',
            google_meet_code: meetCode,
            status: 'created'
        });

    // Update appointment with link
    const { data: updatedAppt, error: updateError } = await supabase
        .from('appointments')
        .update({ meeting_link: meetLink })
        .eq('id', appointment.id)
        .select(`
      *,
      therapist:profiles!appointments_therapist_id_fkey (
        full_name,
        avatar_url,
        specialization
      )
    `)
        .single();

    if (updateError) throw updateError;
    return updatedAppt;
}

/**
 * Fetches user's booking history.
 */
export async function getBookingHistory(userId: string) {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      therapist:profiles!appointments_therapist_id_fkey (
        full_name,
        avatar_url,
        specialization
      )
    `)
        .eq('patient_id', userId)
        .order('start_time', { ascending: false })
        .limit(5);

    if (error) throw error;
    return data;
}
