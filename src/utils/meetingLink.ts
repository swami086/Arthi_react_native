export const generateJitsiMeetLink = (mentorId: string, menteeId: string, uniqueId: string): string => {
    const roomName = `SafeSpace-${mentorId}-${menteeId}-${uniqueId}`;
    // Sanitize room name to be safe
    const safeRoomName = roomName.replace(/[^a-zA-Z0-9-_]/g, '');
    return `https://meet.jit.si/${safeRoomName}`;
};
