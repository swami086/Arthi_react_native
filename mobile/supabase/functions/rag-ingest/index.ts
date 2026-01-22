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
        const { content, userId, memoryType, metadata = {}, memories = [] } = await req.json();

        if (!userId) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing userId' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const embeddingService = new EmbeddingService(Deno.env.get('OPENAI_API_KEY')!);
        const results = [];

        // Handle single memory
        if (content && memoryType) {
            const id = await embeddingService.storeMemory(
                supabase,
                userId,
                content,
                memoryType,
                { ...metadata, source: 'web_ingest' }
            );
            const { data: record } = await supabase.from('agent_memory').select('*').eq('id', id).single();
            results.push(record);
        }

        // Handle batch memories
        if (memories.length > 0) {
            for (const m of memories) {
                const id = await embeddingService.storeMemory(
                    supabase,
                    userId,
                    m.content,
                    m.memoryType || m.metadata?.type,
                    { ...m.metadata, source: 'web_batch' }
                );
                const { data: record } = await supabase.from('agent_memory').select('*').eq('id', id).single();
                results.push(record);
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                records: results,
                count: results.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error(`RAG Ingest Error: ${error.message}`);
        reportError(error, 'rag-ingest');
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
