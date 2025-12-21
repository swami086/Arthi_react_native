import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { reportError, reportInfo } from '../_shared/rollbar.ts';

const GOOGLE_MEET_API_URL = 'https://meet.googleapis.com/v2';
const GOOGLE_OAUTH_TOKEN = Deno.env.get('GOOGLE_OAUTH_TOKEN')!;

interface CreateMeetingRequest {
    appointmentId: string;
    userId: string;
    userEmail: string;
    userName: string;
    userRole: 'mentor' | 'mentee';
}

serve(async (req) => {
    try {
        const { appointmentId, userId, userEmail, userName, userRole, googleAccessToken } =
            await req.json() as CreateMeetingRequest & { googleAccessToken?: string };

        const token = googleAccessToken || GOOGLE_OAUTH_TOKEN;

        // Create meeting space via Google Meet API
        const createSpaceResponse = await fetch(
            `${GOOGLE_MEET_API_URL}/spaces`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    config: {
                        accessType: 'OPEN',
                        entryPointAccess: 'ALL',
                    },
                }),
            }
        );

        if (!createSpaceResponse.ok) {
            const errorText = await createSpaceResponse.text();
            console.error('Google Meet API Error:', createSpaceResponse.status, errorText);
            throw new Error(
                `Failed to create Google Meet space: ${createSpaceResponse.status} - ${errorText}`
            );
        }

        const space = await createSpaceResponse.json();
        const meetingCode = space.meetingCode;
        const meetingUrl = `https://meet.google.com/${meetingCode}`;

        // Store in database
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const { data: videoRoom, error: dbError } = await supabase
            .from('video_rooms')
            .insert({
                appointment_id: appointmentId,
                room_name: meetingCode,
                room_url: meetingUrl,
                provider: 'google_meet',
                status: 'created',
                recording_enabled: true,
                google_meet_code: meetingCode,
                google_meet_space_name: space.name,
                metadata: {
                    space_name: space.name,
                    created_by: userId,
                    created_at: new Date().toISOString(),
                },
            })
            .select()
            .single();

        if (dbError) throw dbError;

        if (dbError) throw dbError;

        reportInfo('Google Meet room created', 'create-google-meet-room', { appointmentId, meetingCode });

        return new Response(
            JSON.stringify({
                videoRoom,
                meetingUrl,
                meetingCode,
            }),
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        console.error('Error creating Google Meet room:', error);
        reportError(error, 'create-google-meet-room', { appointmentId: (req as any).appointmentId });
        // Return 200 with error details to bypass FunctionsHttpError shielding
        return new Response(
            JSON.stringify({
                error: error.message,
                details: error.toString()
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
});
