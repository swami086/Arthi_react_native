'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
    reportError,
    reportInfo,
    addBreadcrumb,
    getTraceId
} from '@/lib/rollbar-utils';
import { generateTimeSlots, filterAvailableSlots } from '@/lib/appointments/time-slots';
import { parseISO, parse } from 'date-fns';

/**
 * Fetches available time slots for a mentor on a specific date.
 */
export async function getAvailableTimeSlots(
    mentorId: string,
    date: string, // YYYY-MM-DD
    timeOfDay?: 'morning' | 'afternoon' | 'evening'
) {
    const traceId = getTraceId();
    addBreadcrumb('Fetching available time slots', 'appointments.getAvailableTimeSlots', 'info', { mentorId, date, timeOfDay, traceId });

    try {
        const supabase = await createClient();

        // 1. Fetch existing appointments for the mentor on this date
        // Use local start/end of day logic approximation or UTC?
        // Let's assume date param 'YYYY-MM-DD' implies the mentor's local day or UTC day.
        // For simplicity and consistency with current RN logic that likely relies on simple date matching or UTC if generic.
        // We'll query a range covering specific date strings if stored as ISO.

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Note: Supabase/Postgres timestamptz comparisons need valid ISOs.
        // We assume 'date' is a valid date string.

        const { data: existingAppointments, error: fetchError } = await supabase
            .from('appointments')
            .select('start_time, end_time')
            .eq('mentor_id', mentorId)
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString())
            .neq('status', 'cancelled'); // Don't block cancelled slots

        if (fetchError) throw fetchError;

        // 2. Generate all possible slots
        // Using noon to avoid timezone drifts for slot generation base
        const dayMid = new Date(date + 'T12:00:00');
        const slots = generateTimeSlots(dayMid, timeOfDay);

        // 3. Filter available slots
        const availableSlots = filterAvailableSlots(
            mentorId,
            date,
            slots,
            existingAppointments || []
        );

        return { success: true, data: availableSlots };
    } catch (error) {
        reportError(error, 'appointments.getAvailableTimeSlots', { mentorId, date, traceId });
        return { success: false, error: 'Failed to fetch available time slots' };
    }
}

interface CreateAppointmentData {
    mentorId: string;
    date: string; // YYYY-MM-DD
    time: string; // h:mm a
    endTime: string; // h:mm a
    price: number;
    notes?: string;
}

/**
 * Creates a new appointment.
 */
export async function createAppointment(data: CreateAppointmentData) {
    const traceId = getTraceId();
    addBreadcrumb('Creating appointment', 'appointments.createAppointment', 'info', { mentorId: data.mentorId, date: data.date, traceId });

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Not authenticated');
        }

        // Construct ISO strings
        // We need consistent parsing.
        // Using a similar approach to RN: Construct date object from date+time string
        const parseDateTime = (d: string, t: string) => {
            // Parse date string "YYYY-MM-DD h:mm a" strictly
            return parse(`${d} ${t}`, 'yyyy-MM-dd h:mm a', new Date());
        };

        const startDateTime = parseDateTime(data.date, data.time);
        const endDateTime = parseDateTime(data.date, data.endTime);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            throw new Error('Invalid date/time format');
        }

        // 1. Create Appointment
        const { data: appointmentResult, error: insertError } = await (supabase
            .from('appointments') as any)
            .insert({
                mentor_id: data.mentorId,
                mentee_id: user.id,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                status: 'pending',
                price: data.price,
                notes: data.notes,
                meeting_link: null,
            } as any)
            .select()
            .single();

        const appointment = appointmentResult as any;

        if (insertError) throw insertError;

        // 2. Create Video Room
        // Mocking Google Meet link generation for now, consistent with RN logic
        // In reality this might be an Edge Function call
        const meetCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
        const meetLink = `https://meet.google.com/${meetCode}`;

        const { data: videoRoomResult, error: videoError } = await (supabase
            .from('video_rooms') as any)
            .insert({
                appointment_id: appointment.id,
                room_name: `Session-${appointment.id.substring(0, 8)}`,
                room_url: meetLink,
                provider: 'google_meet',
                google_meet_code: meetCode,
                status: 'created',
                created_at: new Date().toISOString(),
                recording_enabled: false
            } as any)
            .select()
            .single();

        const videoRoom = videoRoomResult as any;

        if (videoError) {
            console.error('Failed to create video room', videoError);
            // Proceeding, but ideally we should rollback or Flag
            reportError(videoError, 'appointments.createAppointment.videoRoom', { appointmentId: appointment.id, traceId });
        } else {
            // 3. Update Appointment
            await (supabase
                .from('appointments') as any)
                .update({
                    meeting_link: meetLink,
                    video_room_id: videoRoom.id
                } as any)
                .eq('id', appointment.id);
        }

        reportInfo('Appointment created successfully', 'appointments.createAppointment', { appointmentId: appointment.id, traceId });
        revalidatePath('/appointments');
        revalidatePath(`/mentors/${data.mentorId}`);

        return { success: true, data: { appointmentId: appointment.id } };

    } catch (error) {
        reportError(error, 'appointments.createAppointment', { ...data, traceId });
        return { success: false, error: (error as Error).message || 'Failed to create appointment' };
    }
}

export async function getAppointments(userId?: string) {
    const traceId = getTraceId();
    try {
        const supabase = await createClient();

        let targetUserId = userId;
        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { success: false, error: 'Not authenticated' };
            targetUserId = user.id;
        }

        // Fetch appointments with mentor details
        // Note: Relationship name might vary! 'mentor:profiles!appointments_mentor_id_fkey'
        // Using explicit join syntax if possible or assuming default relation
        const { data, error } = await (supabase
            .from('appointments') as any)
            .select(`
                *,
                mentor:profiles!appointments_mentor_id_fkey (
                    full_name,
                    avatar_url,
                    specialization
                )
            `)
            .eq('mentee_id', targetUserId)
            .order('start_time', { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        reportError(error, 'appointments.getAppointments', { userId, traceId });
        return { success: false, error: 'Failed to fetch appointments' };
    }
}

export async function updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'cancelled') {
    try {
        const supabase = await createClient();
        const { error } = await (supabase
            .from('appointments') as any)
            .update({ status } as any)
            .eq('id', appointmentId);

        if (error) throw error;

        revalidatePath('/appointments');
        return { success: true };
    } catch (error) {
        reportError(error, 'appointments.updateAppointmentStatus', { appointmentId, status });
        return { success: false, error: 'Failed to update status' };
    }
}
