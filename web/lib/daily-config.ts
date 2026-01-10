
export const DAILY_API_KEY = process.env.DAILY_API_KEY!;
export const NEXT_PUBLIC_DAILY_DOMAIN = process.env.NEXT_PUBLIC_DAILY_DOMAIN || 'https://safespace.daily.co';

export const DAILY_REST_API = 'https://api.daily.co/v1';

export const videoRoomConfig = {
    privacy: 'private' as const,
    properties: {
        enable_recording: 'cloud' as const,
        enable_chat: true,
        enable_screenshare: true,
        max_participants: 2,
        eject_at_room_exp: true,
        // Default expiry 2 hours from creation, overriden in dynamic creation
    },
};

export const getDailyConfig = () => {
    if (!DAILY_API_KEY) {
        console.warn('DAILY_API_KEY is not set in environment variables');
    }
    return {
        apiKey: DAILY_API_KEY,
        domain: NEXT_PUBLIC_DAILY_DOMAIN,
        apiUrl: DAILY_REST_API,
    };
};
