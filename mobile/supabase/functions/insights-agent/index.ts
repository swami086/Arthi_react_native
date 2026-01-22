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

        switch (action) {
            case 'generate_insights':
            case 'refresh_analysis': {
                const analysis = await tools.analyzePatientData(supabaseClient, user.id);
                const patterns = tools.detectPatterns(analysis);

                updatedComponents = builder.buildInsightsDashboard(analysis, patterns);
                updatedMetadata = { ...updatedMetadata, lastAnalyzed: new Date().toISOString() };
                textResponse = tools.generateInsightsSummary(patterns);
                break;
            }

            case 'export_report': {
                textResponse = "I've prepared your full insights report. Your download will start shortly.";
                // In a real app, this might return a signed URL or trigger a separate export job
                break;
            }

            case 'view_detailed_insights': {
                textResponse = "Navigating to your detailed analytics view.";
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
                        agentId: 'insights-agent',
                        components: updatedComponents,
                        metadata: updatedMetadata,
                        timestamp: new Date().toISOString()
                    }
                });
            }
        });

        // Log
        await supabaseClient.from('a2ui_actions').insert({
            surface_id: surfaceId,
            user_id: user.id,
            action_id: `act_${Date.now()}`,
            action_type: action,
            payload: payload,
            metadata: { agent: 'insights-agent' }
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
