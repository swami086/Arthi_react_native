import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Transcribe Audio Function Up and Running!")

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { recording_id, test_url } = await req.json()

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        let audioResponse;
        let recordingDataForDb = null;

        if (test_url) {
            console.log(`Manual Test Mode: Fetching from ${test_url}`);
            audioResponse = await fetch(test_url);
        } else {
            if (!recording_id) {
                throw new Error('Recording ID is required')
            }
            // 1. Get recording details
            const { data: recording, error: recError } = await supabaseClient
                .from('session_recordings')
                .select('*')
                .eq('id', recording_id)
                .single()

            if (recError || !recording) {
                throw new Error('Recording not found')
            }
            recordingDataForDb = recording;

            // 2. Create signed URL for the audio file
            const { data: signedUrlData, error: signError } = await supabaseClient
                .storage
                .from('session-recordings')
                .createSignedUrl(recording.recording_url, 60 * 10) // 10 minutes

            if (signError || !signedUrlData) {
                throw new Error('Could not access audio file')
            }
            audioResponse = await fetch(signedUrlData.signedUrl);
        }
        if (!audioResponse.ok) {
            throw new Error(`Failed to download audio: ${audioResponse.statusText}`);
        }
        const arrayBuffer = await audioResponse.arrayBuffer()

        console.log(`Downloaded audio size: ${arrayBuffer.byteLength} bytes`);

        if (arrayBuffer.byteLength === 0) {
            throw new Error('Downloaded audio file is empty');
        }

        // 4. Send to OpenAI Whisper
        let fileExt = test_url ? test_url.split('.').pop()?.toLowerCase() || 'mp3' : (recordingDataForDb?.recording_url.split('.').pop()?.toLowerCase() || 'mp4');
        let contentType = 'audio/mpeg'; // Default

        // Improved mapping for OpenAI compatibility
        if (fileExt === 'm4a') {
            fileExt = 'm4a';
            contentType = 'audio/m4a';
        } else if (fileExt === 'mp4') {
            fileExt = 'mp4';
            contentType = 'audio/mp4';
        }
        else if (fileExt === 'wav') {
            contentType = 'audio/wav';
        } else if (fileExt === 'webm') {
            contentType = 'audio/webm';
        }

        console.log(`Processing file with ext: ${fileExt}, contentType: ${contentType}`);

        // Re-create Blob with explicit type to ensure FormData handles it correctly
        const audioBlob = new Blob([arrayBuffer], { type: contentType });
        const fileName = `recording.${fileExt}`

        const formData = new FormData()
        formData.append('file', audioBlob, fileName)
        formData.append('model', 'whisper-1')

        console.log('Sending to OpenAI Whisper...');
        const openAIResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            },
            body: formData,
        })

        console.log(`OpenAI Response Status: ${openAIResponse.status}`);
        const openAIData = await openAIResponse.json()

        if (openAIData.error || !openAIResponse.ok) {
            console.error('OpenAI Error Details:', openAIData);
            throw new Error(`OpenAI Error: ${openAIData.error?.message || openAIResponse.statusText}`)
        }

        const transcriptText = openAIData.text
        console.log(`Transcription successful. Length: ${transcriptText.length} chars`);

        if (!recording_id) {
            return new Response(
                JSON.stringify({ transcript: { transcript_text: transcriptText }, test_mode: true }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 5. Save transcript to DB
        const { data: transcript, error: transError } = await supabaseClient
            .from('transcripts')
            .insert({
                recording_id: recording_id,
                transcript_text: transcriptText,
                language_detected: 'en', // Whisper doesn't always return language in simple response, assume en or enhance
                word_count: transcriptText.split(/\s+/).length,
            })
            .select()
            .single()

        if (transError) {
            console.error('DB Insert Error:', transError);
            throw new Error('Failed to save transcript')
        }

        // Update recording status
        await supabaseClient
            .from('session_recordings')
            .update({ recording_status: 'completed' })
            .eq('id', recording_id)

        return new Response(
            JSON.stringify({ transcript }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error("Transcription Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
