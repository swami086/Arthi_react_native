import { supabase } from './supabase';
import { VideoRoom } from './types';

/**
 * Create Daily.co video room for appointment
 */
export const createVideoRoom = async (appointmentId: string): Promise<VideoRoom> => {
    try {
        // Call Supabase Edge Function to create Daily.co room
        const { data, error } = await supabase.functions.invoke('create-video-room', {
            body: { appointmentId }
        });

        if (error) throw error;
        return data.videoRoom;
    } catch (error) {
        console.error('Error creating video room:', error);
        throw error;
    }
};

/**
 * Get video room details for appointment
 */
export const getVideoRoom = async (appointmentId: string): Promise<VideoRoom | null> => {
    try {
        const { data, error } = await supabase
            .from('video_rooms')
            .select('*')
            .eq('appointment_id', appointmentId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching video room:', error);
        return null;
    }
};

/**
 * Generate meeting token for user
 */
export const generateMeetingToken = async (
    roomName: string,
    userId: string,
    role: 'mentor' | 'mentee'
): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('generate-meeting-token', {
            body: { roomName, userId, role }
        });

        if (error) throw error;
        return data.token;
    } catch (error) {
        console.error('Error generating meeting token:', error);
        throw error;
    }
};

/**
 * Update video room status
 */
export const updateVideoRoomStatus = async (
    roomId: string,
    status: 'active' | 'ended',
    metadata?: Record<string, any>
): Promise<boolean> => {
    try {
        const updates: any = { status, updated_at: new Date().toISOString() };

        if (status === 'active') {
            updates.started_at = new Date().toISOString();
        } else if (status === 'ended') {
            updates.ended_at = new Date().toISOString();
        }

        if (metadata) {
            updates.metadata = metadata;
        }

        const { error } = await supabase
            .from('video_rooms')
            .update(updates)
            .eq('id', roomId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating video room status:', error);
        return false;
    }
};

/**
 * Delete video room (cleanup)
 */
export const deleteVideoRoom = async (roomId: string): Promise<boolean> => {
    try {
        const { error } = await supabase.functions.invoke('delete-video-room', {
            body: { roomId }
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting video room:', error);
        return false;
    }
};
