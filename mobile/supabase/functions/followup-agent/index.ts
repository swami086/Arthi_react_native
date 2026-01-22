import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import * as tools from './tools.ts';
import * as builder from './surface-builder.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Authorization header');
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Unauthorized');

        const body = await req.json();
        const { action, surfaceId, payload } = body;

        if (!surfaceId) throw new Error('Missing surfaceId');

        const { data: surface, error: surfaceError } = await supabaseClient
            .from('a2ui_surfaces')
            .select('*')
            .eq('surface_id', surfaceId)
            .eq('user_id', user.id)
            .single();

        if (surfaceError || !surface) throw new Error('Surface not found');

        let updatedComponents = surface.components;
        let updatedMetadata = surface.metadata || {};
        let textResponse = "";

        // Handle value changes (state management in metadata)
        if (action.startsWith('on_change_')) {
            const field = action.replace('on_change_', '');
            let value = payload.value !== undefined ? payload.value : (payload.values !== undefined ? payload.values : payload);

            // Payload normalization (Comment 4)
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // Check if it's an object with numeric keys (sometimes happens with certain form libs)
                const keys = Object.keys(value);
                if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
                    value = Object.values(value);
                }
            }

            // Ensure mood_score is numeric
            if (field === 'mood_score' || field === 'mood') {
                value = Number(value);
            }

            updatedMetadata = {
                ...updatedMetadata,
                responses: {
                    ...(updatedMetadata.responses || {}),
                    [field]: value
                }
            };

            // Persist the state update (Comment 4)
            await supabaseClient
                .from('a2ui_surfaces')
                .update({
                    metadata: updatedMetadata,
                    version: (surface.version || 1) + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('surface_id', surfaceId);

            // Broadcast the update (Comment 4)
            const channel = supabaseClient.channel(`a2ui:${user.id}`);
            await channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.send({
                        type: 'broadcast',
                        event: 'surfaceUpdate',
                        payload: {
                            type: 'surfaceUpdate',
                            operation: 'update',
                            surfaceId: surfaceId,
                            userId: user.id,
                            agentId: 'followup-agent',
                            metadata: updatedMetadata,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            });

            return new Response(JSON.stringify({
                success: true,
                surface: { ...surface, metadata: updatedMetadata, version: (surface.version || 1) + 1 }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        switch (action) {
            case 'submit_wellness_check': {
                const responses = updatedMetadata.responses || {};

                // Ensure mood_score is a number for tools (Comment 4)
                if (responses.mood_score) {
                    responses.mood_score = Number(responses.mood_score);
                }

                await tools.saveWellnessCheck(supabaseClient, user.id, responses);

                updatedComponents = builder.buildCompletionSurface();
                updatedMetadata = { ...updatedMetadata, step: 'COMPLETED' };
                textResponse = "I've received your check-in. Thank you for sharing!";
                break;
            }

            case 'request_help': {
                textResponse = "I hear you. If you are in immediate danger, please contact emergency services or use one of the hotlines in the resources section.";
                break;
            }

            case 'view_detailed_insights': {
                textResponse = "Opening your personal insights dashboard...";
                break;
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        // Persist
        await supabaseClient
            .from('a2ui_surfaces')
            .update({
                components: updatedComponents,
                metadata: updatedMetadata,
                version: (surface.version || 1) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('surface_id', surfaceId);

        // Broadcast
        const channel = supabaseClient.channel(`a2ui:${user.id}`);
        await channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'surfaceUpdate',
                    payload: {
                        type: 'surfaceUpdate',
                        operation: 'update',
                        surfaceId: surfaceId,
                        userId: user.id,
                        agentId: 'followup-agent',
                        components: updatedComponents,
                        metadata: updatedMetadata,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        });

        return new Response(JSON.stringify({
            success: true,
            textResponse,
            surface: {
                ...surface,
                components: updatedComponents,
                metadata: updatedMetadata,
                version: (surface.version || 1) + 1
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
