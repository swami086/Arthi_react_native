
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { piiMaskingService } from '../_shared/pii-masking.ts';

console.log("Mask PII Function Loaded");

serve(async (req) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { traceId, spanId } = extractTraceContext(req);

    try {
        const body = await req.json().catch(() => ({}));
        const { text, conversationId } = body;

        // Validation
        if (!text && !conversationId) {
            const error = new Error('Missing required field: Provide either "text" or "conversationId"');
            Object.assign(error, { status: 400 });
            throw error;
        }
        if (text && conversationId) {
            const error = new Error('Ambiguous request: Provide either "text" or "conversationId", not both');
            Object.assign(error, { status: 400 });
            throw error;
        }

        // Path A: Text Masking
        if (text) {
            if (typeof text !== 'string') {
                const error = new Error('Field "text" must be a string');
                Object.assign(error, { status: 400 });
                throw error;
            }

            const maskedText = piiMaskingService.maskText(text);
            const originalLength = text.length;
            const maskedLength = maskedText.length;
            const maskingRatio = originalLength > 0 ? maskedLength / originalLength : 1;

            reportInfo('Text masked', 'mask-pii:text', {
                originalLength,
                maskedLength,
                maskingRatio,
                traceId,
                spanId
            });

            return new Response(JSON.stringify({
                success: true,
                maskedText,
                metrics: { originalLength, maskedLength, maskingRatio }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Path B: Conversation Masking
        if (conversationId) {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
            const serviceKey = Deno.env.get('SERVICE_ROLE_KEY')!;

            if (!supabaseUrl || !serviceKey) {
                throw new Error('Server configuration error: Missing Supabase credentials'); // Default 500
            }

            const supabaseAdmin = createClient(supabaseUrl, serviceKey);

            const { data: conversation, error: fetchError } = await supabaseAdmin
                .from('agent_conversations')
                .select('id, messages, user_id')
                .eq('id', conversationId)
                .maybeSingle(); // Use maybeSingle to avoid throw on null

            if (fetchError) {
                throw fetchError; // Default 500
            }

            if (!conversation) {
                const error = new Error('Conversation not found');
                Object.assign(error, { status: 404 });
                throw error;
            }

            const messages = conversation.messages || [];
            const maskedMessages = piiMaskingService.maskConversation(messages);

            const messageCount = messages.length;
            const totalOriginalLength = JSON.stringify(messages).length;
            const totalMaskedLength = JSON.stringify(maskedMessages).length;
            const maskingRatio = totalOriginalLength > 0 ? totalMaskedLength / totalOriginalLength : 1;

            reportInfo('Conversation masked', 'mask-pii:conversation', {
                conversationId,
                messageCount,
                totalOriginalLength,
                totalMaskedLength,
                maskingRatio,
                traceId,
                spanId
            });

            return new Response(JSON.stringify({
                success: true,
                conversationId,
                maskedMessages,
                metrics: {
                    messageCount,
                    totalOriginalLength,
                    totalMaskedLength,
                    maskingRatio
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Unexpected execution path');

    } catch (error: any) {
        await reportError(error, 'mask-pii', { traceId, spanId });

        // Determine status code
        let status = 500;
        if (error.status) {
            status = error.status;
        } else if (error.code && (error.code === 'PGRST116' || error.message.includes('not found'))) {
            status = 404;
        }

        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error',
            traceId
        }), {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
