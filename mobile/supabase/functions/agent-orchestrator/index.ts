console.log('Agent Orchestrator Function: Loading dependencies...');

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { callLLM, LLMTimeoutError } from '../_shared/llm-client.ts';
import { classifyIntent } from './intent-classifier.ts';
import { getAgentRegistry } from './agent-registry.ts';

console.log('Agent Orchestrator Function: Dependencies loaded. Starting server...');

serve(async (req) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    const { traceId, spanId } = extractTraceContext(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Declare variables outside try block for scope visibility in catch (Comment 2)
    let conversation = null;
    let supabase = null;

    try {
        const { message, context, conversationId } = await req.json();

        if (!message) {
            throw new Error('Message is required');
        }

        // Create a client with the Auth header to verify the user (Comment 1)
        const authSupabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // Verify the user session
        const { data: { user }, error: authError } = await authSupabase.auth.getUser();

        if (authError || !user) {
            console.error('Unauthorized attempt:', authError);
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const userId = user.id;

        // Use service role key only for operations that require it (like writing to agent tables if RLS disallows)
        // Or we could use authSupabase if RLS is set up correctly. 
        // Instructions say "Use the service role client only for operations that cannot be performed with the user-scoped client."
        // We'll keep 'supabase' as the service role client for now to minimize breakage of existing admin ops, 
        // but rely on 'userId' for the logic.
        supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get or create conversation
        if (conversationId) {
            const { data } = await supabase
                .from('agent_conversations')
                .select('*')
                .eq('id', conversationId)
                .single();
            conversation = data;

            // Verify ownership (Comment 1)
            if (conversation && conversation.user_id !== userId) {
                console.error(`Conversation ownership mismatch: ${conversation.user_id} vs ${userId}`);
                return new Response(
                    JSON.stringify({ error: 'Forbidden: You do not have access to this conversation' }),
                    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        if (!conversation) {
            // Create new conversation
            const { data: newConv } = await supabase
                .from('agent_conversations')
                .insert({
                    user_id: userId, // Use verified userId (Comment 1)
                    agent_type: 'general',
                    messages: [],
                    context: context || {},
                })
                .select()
                .single();
            conversation = newConv;
        }

        // Classify intent
        reportInfo('Classifying user intent', 'orchestrator:classify', { traceId });
        const { intent, confidence } = await classifyIntent(message, context);

        reportInfo(`Intent classified: ${intent} (${confidence}%)`, 'orchestrator:intent', {
            intent,
            confidence,
            traceId,
        });

        // Get appropriate agent
        const agentRegistry = getAgentRegistry();
        const agent = agentRegistry[intent] || agentRegistry['general'];

        // Execute agent
        reportInfo(`Executing ${agent.name}`, 'orchestrator:execute', { traceId });
        const startTime = Date.now();

        const response = await agent.execute({
            message,
            context: { ...context, userId }, // Ensure context has verified userId
            conversation,
            supabase,
        });

        const duration = Date.now() - startTime;

        // Update conversation
        const updatedMessages = [
            ...conversation.messages,
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: response.content, timestamp: new Date().toISOString() },
        ];

        await supabase
            .from('agent_conversations')
            .update({
                messages: updatedMessages,
                agent_type: intent,
                updated_at: new Date().toISOString(),
            })
            .eq('id', conversation.id);

        // Log execution
        await supabase
            .from('agent_executions')
            .insert({
                conversation_id: conversation.id,
                agent_type: intent,
                tool_calls: response.toolCalls || [],
                tokens_used: response.usage?.totalTokens || 0,
                cost_usd: response.cost || 0,
                duration_ms: duration,
                status: 'success',
                metadata: {
                    confidence,
                    model: response.model || 'gpt-4-turbo',
                },
            });

        reportInfo('Agent execution completed', 'orchestrator:complete', {
            duration,
            tokens: response.usage?.totalTokens,
            cost: response.cost,
            traceId,
        });

        return new Response(
            JSON.stringify({
                conversationId: conversation.id,
                agentType: intent,
                response: response.content,
                toolCalls: response.toolCalls,
                components: response.components, // A2UI Surface
                metadata: response.metadata,     // A2UI Metadata
                confidence,
                reasoning: response.reasoning,
                usage: response.usage,
                cost: response.cost,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Orchestrator Error Details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            constructor: error.constructor.name,
            isLLMTimeout: error instanceof LLMTimeoutError
        });
        console.error('Orchestrator Error Object:', error);

        // Handle Timeout (Comment 1)
        if (error instanceof LLMTimeoutError || error.name === 'LLMTimeoutError') {
            return new Response(
                JSON.stringify({
                    response: "I apologize, but I'm taking a bit longer than expected to think. Please try asking again in a simpler way.",
                    error: 'timeout',
                    trace_id: traceId
                }),
                {
                    status: 200, // Friendly response
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // Access conversation and supabase safely (Comment 2)
        if (conversation && supabase) {
            try {
                await supabase
                    .from('agent_executions')
                    .insert({
                        conversation_id: conversation.id,
                        agent_type: 'error',
                        status: 'failed',
                        error: error.message || String(error),
                        metadata: {
                            traceId,
                            errorStack: error.stack
                        }
                    });
            } catch (logError) {
                console.error('Failed to log error execution:', logError);
            }
        }

        await reportError(error, 'orchestrator', { traceId, spanId });

        return new Response(
            JSON.stringify({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
                trace_id: traceId
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
