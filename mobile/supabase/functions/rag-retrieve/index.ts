import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { EmbeddingService } from '../_shared/embedding-service.ts';
import { reportError } from '../_shared/rollbar.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { query, userId, memoryTypes = ['session_note', 'therapist_note', 'patient_goal'], limit = 5, matchThreshold = 0.7 } = await req.json();

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const embeddingService = new EmbeddingService(Deno.env.get('OPENAI_API_KEY')!);

        // Retrieve relevant memories
        const memories = await embeddingService.searchSimilarMemories(
            supabase,
            userId,
            query,
            memoryTypes,
            limit,
            matchThreshold
        );

        // Format context for LLM
        const context = memories.map((m, idx) =>
            `[${idx + 1}] ${m.memory_type}: ${m.content} (similarity: ${m.similarity.toFixed(2)})`
        ).join('\n\n');

        return new Response(
            JSON.stringify({
                success: true,
                context,
                memories,
                count: memories.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error(`RAG Retrieve Error: ${error.message}`);
        reportError(error, 'rag-retrieve');
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
