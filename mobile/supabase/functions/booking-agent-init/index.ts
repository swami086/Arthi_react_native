import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import * as tools from '../booking-agent/tools.ts';
import * as builder from '../booking-agent/surface-builder.ts';

/**
 * Booking Agent Initialization Point.
 * Creates the initial surface and starts the booking context.
 */
serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        // Authenticate user
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Unauthorized');
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Unauthorized');

        // 2. Parse Request
        const body = await req.json().catch(() => ({}));
        const { specialization, query } = body;

        // 3. Generate Initial Surface Data
        const surfaceId = `booking-${user.id.substring(0, 8)}-${Date.now()}`;
        const therapists = await tools.searchTherapists(query, specialization);
        const components = builder.buildTherapistSelectionSurface(therapists);

        // 4. Persist initial surface
        const { data: surface, error: insertError } = await supabaseClient
            .from('a2ui_surfaces')
            .insert({
                surface_id: surfaceId,
                user_id: user.id,
                agent_id: 'booking-agent',
                components: components,
                metadata: {
                    step: 'THERAPIST_SELECTION',
                    specialization,
                    initializedAt: new Date().toISOString()
                },
                version: 1
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // 5. Broadcast Initial Surface
        const channel = supabaseClient.channel(`a2ui:${user.id}`);
        await new Promise((resolve) => {
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
                            agentId: 'booking-agent',
                            components: components,
                            metadata: surface.metadata,
                            timestamp: new Date().toISOString()
                        }
                    });
                    resolve(true);
                }
            });
        });
        await supabaseClient.removeChannel(channel);

        // 6. Return Response
        return new Response(JSON.stringify({
            success: true,
            surfaceId: surface.surface_id,
            surface: surface,
            textResponse: "Hello! I'm your Booking Assistant. Let's find the perfect therapist for you. Here are some specialists currently available."
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('BookingAgent Init Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
