import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import * as tools from '../insights-agent/tools.ts';
import * as builder from '../insights-agent/surface-builder.ts';

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

        const surfaceId = `surf_insights_${user.id}`;

        // Check for existing surface
        const { data: existingSurface } = await supabaseClient
            .from('a2ui_surfaces')
            .select('*')
            .eq('surface_id', surfaceId)
            .single();

        if (existingSurface) {
            return new Response(JSON.stringify({ success: true, surfaceId }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Initialize new surface
        const analysis = await tools.analyzePatientData(supabaseClient, user.id);
        const patterns = tools.detectPatterns(analysis);
        const components = builder.buildInsightsDashboard(analysis, patterns);

        const { error: insertError } = await supabaseClient
            .from('a2ui_surfaces')
            .insert({
                surface_id: surfaceId,
                user_id: user.id,
                agent_id: 'insights-agent',
                components,
                metadata: { step: 'INITIAL_DASHBOARD', lastAnalyzed: new Date().toISOString() },
                version: 1
            });

        if (insertError) throw insertError;

        return new Response(JSON.stringify({ success: true, surfaceId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
