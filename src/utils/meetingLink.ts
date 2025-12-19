import { createVideoRoom } from '../api/videoService';

/**
 * Generate Daily.co meeting link for appointment
 * @deprecated Use createVideoRoom from videoService instead
 */
export const generateJitsiMeetLink = (mentorId: string, menteeId: string, uniqueId: string): string => {
    const roomName = `SafeSpace-${mentorId}-${menteeId}-${uniqueId}`;
    const safeRoomName = roomName.replace(/[^a-zA-Z0-9-_]/g, '');
    return `https://meet.jit.si/${safeRoomName}`;
};

/**
 * Generate Daily.co meeting link for appointment
 */
export const generateDailyMeetLink = async (appointmentId: string): Promise<string> => {
    try {
        const videoRoom = await createVideoRoom(appointmentId);
        return videoRoom.room_url;
    } catch (error) {
        console.error('Error generating Daily.co link:', error);
        throw error;
    }
};
