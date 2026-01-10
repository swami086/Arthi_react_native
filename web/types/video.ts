
import { Database } from '@/types/database';

export type VideoRoom = Database['public']['Tables']['video_rooms']['Row'];

export interface DailyRoomConfig {
    name: string;
    privacy: 'private' | 'public';
    properties: {
        enable_recording: 'cloud' | 'local' | 'none';
        enable_chat: boolean;
        enable_screenshare: boolean;
        max_participants: number;
        exp?: number;
        eject_after_elapsed?: number;
        eject_at_room_exp?: boolean;
    };
}

export interface DailyRoomResponse {
    id: string;
    name: string;
    api_created: boolean;
    privacy: string;
    url: string;
    created_at: string;
    config: DailyRoomConfig;
}

export interface VideoTokenResponse {
    token: string;
}

export interface VideoCallError {
    type: 'permission' | 'device' | 'network' | 'api' | 'unknown';
    message: string;
    originalError?: any;
}

export interface DeviceStatus {
    hasPermission: boolean;
    deviceId: string;
    label: string;
}

export interface DeviceTestResult {
    audioInput: boolean;
    audioOutput: boolean;
    videoInput: boolean;
    network: boolean;
}
