import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { reportError, reportInfo } from '../_shared/rollbar.ts'


console.log("Generate SOAP Note Function Up and Running!")

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { transcript_id, appointment_id } = await req.json()
        if (!transcript_id || !appointment_id) {
            throw new Error('Transcript ID and Appointment ID are required')
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get transcript
        console.log(`Fetching transcript for ID: ${transcript_id}`);
        const { data: transcriptData, error: transError } = await supabaseClient
            .from('transcripts')
            .select('*')
            .eq('id', transcript_id)
            .single()

        if (transError || !transcriptData) {
            console.error("Transcript Error:", transError);
            throw new Error('Transcript not found')
        }

        console.log(`Transcript found. Length: ${transcriptData.transcript_text.length}`);

        // 1.5 Check if SOAP note already exists for this transcript
        const { data: existingSoap } = await supabaseClient
            .from('soap_notes')
            .select('*')
            .eq('transcript_id', transcript_id)
            .maybeSingle()

        if (existingSoap) {
            console.log("SOAP note already exists for this transcript, returning existing.");
            return new Response(
                JSON.stringify({ soapNote: existingSoap }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Call OpenAI GPT-4o
        console.log("Calling OpenAI GPT-4o...");
        const systemPrompt = `You are a clinical AI scribe. Convert the following therapy session transcript into multiple SOAP note sections (Subjective, Objective, Assessment, Plan). 
        Return a JSON object with keys: "subjective", "objective", "assessment", "plan". 
        Important: Ensure the values are detailed clinical notes based on the transcript.`

        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Transcript: ${transcriptData.transcript_text}` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
            }),
        })

        const openAIData = await openAIResponse.json()

        if (openAIData.error) {
            console.error("OpenAI API Error:", openAIData.error);
            const err = new Error(`OpenAI Error: ${openAIData.error.message}`);
            reportError(err, 'generate-soap-note:openai', { transcript_id });
            throw err;
        }

        const content = openAIData.choices[0].message.content
        console.log("GPT-4o response received.");
        let soapContent
        try {
            const cleanedContent = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
            soapContent = JSON.parse(cleanedContent)
        } catch (e) {
            console.error("JSON Parse Error. Raw content:", content);
            reportError(e, 'generate-soap-note:json-parse', { content });
            throw new Error('Failed to parse AI response as JSON')
        }

        // 3. Get Mentor ID from Appointment
        console.log(`Fetching appointment details for: ${appointment_id}`);
        const { data: appointmentData, error: appError } = await supabaseClient
            .from('appointments')
            .select('mentor_id')
            .eq('id', appointment_id)
            .single()

        if (appError || !appointmentData) {
            console.error("Appointment Fetch Error:", appError);
            throw new Error('Appointment not found or could not verify mentor')
        }

        const mentor_id = appointmentData.mentor_id

        // 4. Save SOAP Note
        console.log("Saving SOAP note to DB...");
        const { data: soapNote, error: soapError } = await supabaseClient
            .from('soap_notes')
            .insert({
                transcript_id,
                appointment_id,
                mentor_id,
                subjective: soapContent.subjective,
                objective: soapContent.objective,
                assessment: soapContent.assessment,
                plan: soapContent.plan,
                is_finalized: false,
            })
            .select()
            .single()

        if (soapError) {
            console.error("DB Insert Error", soapError);
            throw new Error('Failed to save SOAP note to database')
        }

        console.log("SOAP note saved successfully.");
        reportInfo('SOAP note generated', 'generate-soap-note', { soapNoteId: soapNote.id });
        return new Response(
            JSON.stringify({ soapNote }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error("SOAP Gen Error:", error);
        reportError(error, 'generate-soap-note', { transcript_id: (req as any).transcript_id, appointment_id: (req as any).appointment_id });
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
