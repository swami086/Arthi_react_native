import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { reportError } from "../_shared/rollbar.ts";
import { analyzeTranscript } from "./tools.ts";
import { buildCopilotSurface } from "./surface-builder.ts";

console.log("Session Agent Function Up and Running!");

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

        const { action, surfaceId, payload } = await req.json();
        console.log(`Action received: ${action} for surface: ${surfaceId}`);

        // 1. Fetch current surface state
        const { data: surface, error: surfaceError } = await supabaseClient
            .from('a2ui_surfaces')
            .select('*')
            .eq('surface_id', surfaceId)
            .single();

        if (surfaceError || !surface) throw new Error('Surface not found');

        let updatedComponents = [...(surface.components || [])];
        let updatedDataModel = { ...(surface.data_model || {}) };
        let updatedMetadata = { ...(surface.metadata || {}) };
        let textResponse = "Processing your request...";

        // 2. Action Router
        switch (action) {
            case 'analyze_transcript': {
                const { transcriptId, appointmentId } = payload;
                const { data: transcript, error: transError } = await supabaseClient
                    .from('transcripts')
                    .select('*')
                    .eq('id', transcriptId)
                    .single();

                if (transError || !transcript) throw new Error('Transcript not found');

                // Perform Analysis
                const analysis = await analyzeTranscript(transcript.transcript_text);

                // Build New UI
                updatedComponents = buildCopilotSurface(analysis);
                updatedDataModel = { ...updatedDataModel, analysis, lastUpdated: new Date().toISOString() };
                updatedMetadata = { ...updatedMetadata, step: 'ANALYZED', lastAnalysisAt: new Date().toISOString() };
                textResponse = "I've analyzed the session and updated your copilot suggestions.";
                break;
            }

            case 'apply_intervention': {
                const { interventionId, interventionType, title } = payload;
                // Log to metadata for now as per plan
                const applied = updatedMetadata.appliedInterventions || [];
                applied.push({ interventionId, interventionType, title, appliedAt: new Date().toISOString() });
                updatedMetadata.appliedInterventions = applied;

                textResponse = `Applied intervention: ${title}. I've logged this for your session notes.`;
                break;
            }

            case 'open_risk_assessment': {
                const { riskType, severity } = payload;
                // Add specific intervention or change UI state
                updatedMetadata.activeRiskAssessment = { riskType, severity, openedAt: new Date().toISOString() };
                textResponse = `Risk assessment for ${riskType} opened. Please follow the clinical guidelines.`;
                break;
            }

            case 'flag_for_review': {
                const { riskType, severity, reason } = payload;
                // In a real app, we might create a record in a flags table
                updatedMetadata.flagged = true;
                updatedMetadata.flagReason = reason || riskType;
                updatedMetadata.flagSeverity = severity;

                textResponse = "This session has been flagged for supervisor review. High risks require manual confirmation.";
                break;
            }

            case 'save_soap_note': {
                const { subjective, objective, assessment, plan, aiGenerated } = payload;
                const appointmentId = updatedMetadata.appointmentId;

                // Check for existing note
                const { data: existingSoap } = await supabaseClient
                    .from('soap_notes')
                    .select('id')
                    .eq('appointment_id', appointmentId)
                    .maybeSingle();

                if (existingSoap) {
                    await supabaseClient
                        .from('soap_notes')
                        .update({
                            subjective,
                            objective,
                            assessment,
                            plan,
                            edited_by_therapist: !aiGenerated,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', existingSoap.id);
                    updatedMetadata.soapNoteId = existingSoap.id;
                } else {
                    const { data: soapNote, error: soapError } = await supabaseClient
                        .from('soap_notes')
                        .insert({
                            appointment_id: appointmentId,
                            therapist_id: user.id,
                            subjective,
                            objective,
                            assessment,
                            plan,
                            is_finalized: false,
                            edited_by_therapist: !aiGenerated
                        })
                        .select()
                        .single();

                    if (soapError) throw new Error('Failed to save SOAP note');
                    updatedMetadata.soapNoteId = soapNote.id;
                }

                textResponse = "Your SOAP note has been updated. You can review it in the SOAP editor.";
                break;
            }

            case 'refresh_analysis': {
                const transcriptId = updatedMetadata.transcriptId;
                if (!transcriptId) throw new Error('No transcript ID found for refresh');

                const { data: transcript, error: transError } = await supabaseClient
                    .from('transcripts')
                    .select('*')
                    .eq('id', transcriptId)
                    .single();

                if (transError || !transcript) throw new Error('Transcript not found');

                // Perform Analysis
                const analysis = await analyzeTranscript(transcript.transcript_text);

                // Build New UI
                updatedComponents = buildCopilotSurface(analysis);
                updatedDataModel = { ...updatedDataModel, analysis, lastUpdated: new Date().toISOString() };
                updatedMetadata = { ...updatedMetadata, step: 'ANALYZED', lastAnalysisAt: new Date().toISOString() };
                textResponse = "I've refreshed the analysis with the latest transcript data.";
                break;
            }

            default:
                textResponse = `Action '${action}' not implemented yet.`;
        }

        // 3. Persist Changes
        const { error: updateError } = await supabaseClient
            .from('a2ui_surfaces')
            .update({
                components: updatedComponents,
                data_model: updatedDataModel,
                metadata: updatedMetadata,
                version: (surface.version || 1) + 1,
                updated_at: new Date().toISOString()
            })
            .eq('surface_id', surfaceId)
            .eq('user_id', user.id);

        if (updateError) throw updateError;

        // 4. Log Action
        await supabaseClient.from('a2ui_actions').insert({
            surface_id: surfaceId,
            user_id: user.id,
            action_id: `act_${Date.now()}`,
            action_type: action,
            payload: payload
        });

        // 5. Broadcast Update
        const channel = supabaseClient.channel(`a2ui:${user.id}`);
        await new Promise((resolve) => {
            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.send({
                        type: 'broadcast',
                        event: 'surfaceUpdate',
                        payload: {
                            type: 'surfaceUpdate',
                            operation: 'update',
                            surfaceId: surfaceId,
                            userId: user.id,
                            agentId: 'session-agent',
                            components: updatedComponents,
                            dataModel: updatedDataModel,
                            metadata: updatedMetadata,
                            timestamp: new Date().toISOString()
                        }
                    });
                    resolve(true);
                }
            });
        });
        await supabaseClient.removeChannel(channel);

        return new Response(
            JSON.stringify({ success: true, textResponse, surfaceId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error("Session Agent Error:", error);
        await reportError(error, 'session-agent');
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
