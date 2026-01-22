import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { reportError } from "../_shared/rollbar.ts";
import { analyzeTranscript } from "../session-agent/tools.ts";
import { buildCopilotSurface } from "../session-agent/surface-builder.ts";

console.log("Session Agent Init Function Up and Running!");

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        // Get the authenticated user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error('Unauthorized');

        const { appointmentId, transcriptId } = await req.json();
        if (!appointmentId) throw new Error('Appointment ID is required');

        const surfaceId = `session-copilot-${appointmentId}`;

        // 1. Check if surface already exists
        const { data: existingSurface } = await supabaseClient
            .from('a2ui_surfaces')
            .select('*')
            .eq('surface_id', surfaceId)
            .maybeSingle();

        if (existingSurface) {
            // Verify access even if surface exists
            const { data: appointment, error: appointmentError } = await supabaseClient
                .from('appointments')
                .select('therapist_id')
                .eq('id', appointmentId)
                .single();

            if (appointmentError || !appointment || appointment.therapist_id !== user.id) {
                throw new Error('Unauthorized access to appointment');
            }

            return new Response(
                JSON.stringify({ success: true, surfaceId, isNew: false }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 2. Verify Access before creating if doesn't exist
        const { data: appointment, error: appointmentError } = await supabaseClient
            .from('appointments')
            .select('therapist_id')
            .eq('id', appointmentId)
            .single();

        if (appointmentError || !appointment || appointment.therapist_id !== user.id) {
            throw new Error('Unauthorized access to appointment');
        }

        // 3. Fetch transcript if available
        let analysis = { interventions: [], risks: [], patterns: [], soap: null };
        if (transcriptId) {
            const { data: transcript } = await supabaseClient
                .from('transcripts')
                .select('*')
                .eq('id', transcriptId)
                .maybeSingle();

            if (transcript && transcript.transcript_text.length > 100) {
                analysis = await analyzeTranscript(transcript.transcript_text);
            }
        }

        // 3. Build Initial Surface
        const components = buildCopilotSurface(analysis);
        const metadata = {
            appointmentId,
            transcriptId,
            step: transcriptId ? 'ANALYZED' : 'INITIALIZED',
            createdAt: new Date().toISOString()
        };

        const { data: newSurface, error: createError } = await supabaseClient
            .from('a2ui_surfaces')
            .insert({
                surface_id: surfaceId,
                user_id: user.id,
                agent_id: 'session-agent',
                components: components,
                data_model: { analysis },
                metadata: metadata,
                version: 1
            })
            .select()
            .single();

        if (createError) throw createError;

        // 4. Broadcast Initial Surface with timeout to prevent hanging
        const channel = supabaseClient.channel(`a2ui:${user.id}`);
        await Promise.race([
            new Promise((resolve) => {
                channel.subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.send({
                            type: 'broadcast',
                            event: 'surfaceUpdate',
                            payload: {
                                type: 'surfaceUpdate',
                                operation: 'create',
                                surfaceId: surfaceId,
                                userId: user.id,
                                agentId: 'session-agent',
                                components: components,
                                dataModel: { analysis },
                                metadata: metadata,
                                timestamp: new Date().toISOString()
                            }
                        });
                        resolve(true);
                    }
                });
            }),
            new Promise((resolve) => setTimeout(() => {
                console.warn('[session-agent-init] Broadcast timeout after 5s');
                resolve(false);
            }, 5000))
        ]);
        await supabaseClient.removeChannel(channel);

        return new Response(
            JSON.stringify({ success: true, surfaceId, isNew: true, analysis }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error("Session Agent Init Error:", error);
        await reportError(error, 'session-agent-init');
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
