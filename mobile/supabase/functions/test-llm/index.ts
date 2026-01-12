// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { callLLM } from '../_shared/llm-client.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { message } = await req.json();

        const response = await callLLM(
            [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: message || 'Hello, how are you?' },
            ],
            {
                model: 'gpt-4-turbo',
                temperature: 0.7,
                maxTokens: 500,
            }
        );

        return new Response(
            JSON.stringify({
                response: response.content,
                usage: response.usage,
                cost: response.cost,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
