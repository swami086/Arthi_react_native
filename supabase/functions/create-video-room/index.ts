import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { reportError, reportInfo } from '../_shared/rollbar.ts';

const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')!;

serve(async (req) => {
    try {
        const { appointmentId } = await req.json();

        // Create Daily.co room
        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                name: `safespace-${appointmentId}`,
                privacy: 'private',
                properties: {
                    enable_recording: 'cloud',
                    enable_chat: false,
                    enable_screenshare: false,
                    max_participants: 2,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
                },
            }),
        });

        const room = await response.json();

        // Store in database
        // (Database update logic usually goes here)

        // (Database update logic usually goes here)

        reportInfo('Daily.co room created', 'create-video-room', { appointmentId, roomName: room.name });

        return new Response(JSON.stringify({ videoRoom: room }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        reportError(error, 'create-video-room', { appointmentId: (req as any).appointmentId });
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
