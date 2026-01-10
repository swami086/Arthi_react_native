'use server';

import { createClient } from '@/lib/supabase/server';
import { getDailyConfig, videoRoomConfig } from '@/lib/daily-config';
import { DailyRoomResponse, VideoRoom } from '@/types/video';
import { reportError } from '@/lib/rollbar-utils';
import { revalidatePath } from 'next/cache';

const { apiKey, apiUrl } = getDailyConfig();

/**
 * Creates a Daily.co room for an appointment
 */
export async function createDailyRoom(appointmentId: string) {
    try {
        const supabase = await createClient();

        // 1. Check if room already exists
        const { data: existingRoomResult } = await (supabase
            .from('video_rooms') as any)
            .select('*')
            .eq('appointment_id', appointmentId)
            .single();

        const existingRoom = existingRoomResult as any;

        if (existingRoom) {
            return { success: true, room: existingRoom };
        }

        // 2. Create room on Daily.co
        const exp = Math.floor(Date.now() / 1000) + 7200; // 2 hours
        const response = await fetch(`${apiUrl}/rooms`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: `safespace-${appointmentId}-${Date.now()}`,
                privacy: videoRoomConfig.privacy,
                properties: {
                    ...videoRoomConfig.properties,
                    exp,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Daily API Error: ${error.message || response.statusText}`);
        }

        const roomData: DailyRoomResponse = await response.json();

        // 3. Store room in database
        const { data: newRoomResult, error: dbError } = await (supabase
            .from('video_rooms') as any)
            .insert({
                appointment_id: appointmentId,
                room_name: roomData.name,
                room_url: roomData.url,
                daily_room_id: roomData.id,
                provider: 'daily',
                status: 'created',
                recording_enabled: true,
                duration_minutes: 60,
            } as any)
            .select()
            .single();

        const newRoom = newRoomResult as any;

        if (dbError) throw dbError;

        // 4. Update appointment with video room ref logic if needed (optional via FK or logic)
        await (supabase
            .from('appointments') as any)
            .update({ video_room_id: newRoom.id } as any)
            .eq('id', appointmentId);

        revalidatePath(`/appointments/${appointmentId}`);
        revalidatePath('/video');

        return { success: true, room: newRoom as VideoRoom }; // Cast to VideoRoom
    } catch (error) {
        reportError(error, 'createDailyRoom', { appointmentId });
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Generates a meeting token for a participant
 */
export async function getDailyRoomToken(roomName: string, userId: string, role: 'mentor' | 'mentee') {
    try {
        const payload = {
            properties: {
                room_name: roomName,
                user_id: userId,
                is_owner: role === 'mentor', // Mentors are owners
                enable_recording_ui: true,
                enable_screenshare: true,
                start_video_off: false,
                start_audio_off: false,
            },
        };

        const response = await fetch(`${apiUrl}/meeting-tokens`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to generate token');
        }

        const data = await response.json();
        return { success: true, token: data.token };

    } catch (error) {
        reportError(error, 'getDailyRoomToken', { roomName, userId, role });
        return { success: false, error: 'Failed to generate meeting token' };
    }
}

/**
 * Updates room status in the database
 */
export async function updateRoomStatus(roomId: string, status: 'active' | 'ended') {
    try {
        const supabase = await createClient();
        const updateData: any = { status };

        if (status === 'active') {
            updateData.started_at = new Date().toISOString();
        } else if (status === 'ended') {
            updateData.ended_at = new Date().toISOString();
        }

        const { error } = await (supabase
            .from('video_rooms') as any)
            .update(updateData)
            .eq('id', roomId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        reportError(error, 'updateRoomStatus', { roomId, status });
        return { success: false, error: 'Failed to update room status' };
    }
}

/**
 * Fetches appointment with video room details
 */
export async function getAppointmentWithRoom(appointmentId: string) {
    try {
        const supabase = await createClient();

        const { data: appointment, error } = await (supabase
            .from('appointments') as any)
            .select(`
                *,
                mentee:profiles!mentee_id(*),
                mentor:profiles!mentor_id(*),
                video_room:video_rooms(*)
            `)
            .eq('id', appointmentId)
            .single();

        if (error) throw error;

        // Handle array response from video_room join if necessary, though single() should handle it 
        // if relationship is 1:1 or N:1 correctly defined. 
        // Supabase join syntax `video_rooms(*)` usually returns an object if 1:1 or array if 1:N. 
        // Assuming 1:1 or taking first if array.

        return { success: true, data: appointment as any }; // Cast for now until explicit types defined
    } catch (error) {
        reportError(error, 'getAppointmentWithRoom', { appointmentId });
        return { success: false, error: 'Failed to fetch appointment' };
    }
}

/**
 * Submits post-session feedback
 */
export async function submitSessionFeedback(
    appointmentId: string,
    rating: number,
    feedback: string | undefined,
    userId: string,
    userRole: 'mentor' | 'mentee'
) {
    try {
        const supabase = await createClient();

        // Use userRole to determine correct column (assuming structure logic)
        // Typically feedback is from mentee to mentor

        // Check database schema for reviews. 
        // reviews table has mentor_id, mentee_id, appointment_id, rating, comment.

        // We need to fetch mentor/mentee IDs from appointment if not passed, 
        // but let's assume we insert into reviews table.

        // First get appointment to identify counterparty
        const { data: appointmentResult } = await (supabase
            .from('appointments') as any)
            .select('mentor_id, mentee_id')
            .eq('id', appointmentId)
            .single();

        const appointment = appointmentResult as any;

        if (!appointment) throw new Error('Appointment not found');

        const appointmentAny = appointment as any;

        const { error } = await (supabase.from('reviews') as any).insert({
            appointment_id: appointmentId,
            mentor_id: appointmentAny.mentor_id,
            mentee_id: appointmentAny.mentee_id!,
            rating,
            comment: feedback
        } as any);

        if (error) throw error;

        // Also update appointment feedback column if it's a general feedback text
        if (feedback) {
            await (supabase.from('appointments') as any).update({
                feedback: feedback,
                status: 'completed'
            } as any).eq('id', appointmentId);
        }

        return { success: true };
    } catch (error) {
        reportError(error, 'submitSessionFeedback', { appointmentId });
        return { success: false, error: 'Failed to submit feedback' };
    }
}
