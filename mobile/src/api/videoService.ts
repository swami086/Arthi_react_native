import { supabase } from './supabase';
import { VideoRoom } from './types';
import { reportError, withRollbarTrace, withRollbarSpan, startSpan, endSpan, startTimer, endTimer, getTraceId } from '../services/rollbar';

/**
 * Create Daily.co video room for appointment
 */
export const createVideoRoom = async (appointmentId: string): Promise<VideoRoom> => {
    startTimer('video_room_creation');
    // Removed redundant startSpan here as withRollbarSpan handles the trace
    try {
        const { data, error } = await supabase.functions.invoke('create-video-room', {
            body: { appointmentId },
            headers: withRollbarSpan('api.video.createRoom')
        });

        if (error) {
            reportError(error, 'videoService:createVideoRoom', { appointmentId });
            throw error;
        }

        endTimer('video_room_creation', 'videoService:createVideoRoom', {
            appointmentId,
            roomName: data.videoRoom?.name
        });
        return data.videoRoom;
    } catch (error) {
        endTimer('video_room_creation', 'videoService:createVideoRoom', {
            error: true,
            appointmentId
        });
        reportError(error, 'videoService:createVideoRoom');
        throw error;
    } finally {
        endSpan();
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
        reportError(error, 'videoService:getVideoRoom');
        return null;
    }
};

/**
 * Generate meeting token for user
 */
export const generateMeetingToken = async (
    roomName: string,
    userId: string,
    role: 'therapist' | 'patient'
): Promise<string> => {
    startTimer('video_token_generation');
    try {
        const { data, error } = await supabase.functions.invoke('generate-meeting-token', {
            body: { roomName, userId, role },
            headers: withRollbarSpan('api.video.generateToken')
        });

        if (error) {
            reportError(error, 'videoService:generateMeetingToken', {
                roomName,
                userId,
                role
            });
            throw error;
        }

        endTimer('video_token_generation', 'videoService:generateMeetingToken', {
            roomName,
            userId
        });
        return data.token;
    } catch (error) {
        endTimer('video_token_generation', 'videoService:generateMeetingToken', {
            error: true,
            roomName,
            userId
        });
        reportError(error, 'videoService:generateMeetingToken');
        throw error;
    } finally {
        endSpan();
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
        reportError(error, 'videoService:updateVideoRoomStatus');
        return false;
    }
};

/**
 * Delete video room (cleanup)
 */
export const deleteVideoRoom = async (roomId: string): Promise<boolean> => {
    try {
        const { error } = await supabase.functions.invoke('delete-video-room', {
            body: { roomId },
            headers: withRollbarSpan('deleteVideoRoom')
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting video room:', error);
        reportError(error, 'videoService:deleteVideoRoom');
        return false;
    } finally {
        endSpan();
    }
};

export const createGoogleMeetRoom = async (
    appointmentId: string,
    userId: string,
    userEmail: string,
    userName: string,
    userRole: 'therapist' | 'patient',
    accessToken?: string
): Promise<VideoRoom> => {
    try {
        const { data, error } = await supabase.functions.invoke(
            'create-google-meet-room',
            {
                body: {
                    appointmentId,
                    userId,
                    userEmail,
                    userName,
                    userRole,
                    googleAccessToken: accessToken,
                },
                headers: withRollbarSpan('createGoogleMeetRoom')
            }
        );

        if (error) throw error;

        if (data.error) {
            throw new Error(`Edge Function Error: ${data.error} ${data.details || ''}`);
        }

        return data.videoRoom;
    } catch (error) {
        console.error('Error creating Google Meet room:', error);
        reportError(error, 'videoService:createGoogleMeetRoom');
        throw error;
    } finally {
        endSpan();
    }
};
