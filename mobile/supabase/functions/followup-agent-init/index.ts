import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import * as tools from '../followup-agent/tools.ts';
import * as builder from '../followup-agent/surface-builder.ts';

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

        const surfaceId = `surf_followup_${Date.now()}`;

        // Initialize new surface
        const history = await tools.getPatientHistory(supabaseClient, user.id);
        const questions = tools.selectQuestions(history);
        const components = builder.buildFollowupForm(questions);

        const { error: insertError } = await supabaseClient
            .from('a2ui_surfaces')
            .insert({
                surface_id: surfaceId,
                user_id: user.id,
                agent_id: 'followup-agent',
                components,
                metadata: { step: 'FORM_INITIALIZED', responses: {} },
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
