console.log('Agent Orchestrator Function: Loading dependencies...');

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { callLLM } from '../_shared/llm-client.ts';
import { classifyIntent } from './intent-classifier.ts';
import { getAgentRegistry } from './agent-registry.ts';

console.log('Agent Orchestrator Function: Dependencies loaded. Starting server...');

serve(async (req) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    const { traceId, spanId } = extractTraceContext(req);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { message, context, conversationId } = await req.json();

        if (!message) {
            throw new Error('Message is required');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get or create conversation
        let conversation;
        if (conversationId) {
            const { data } = await supabase
                .from('agent_conversations')
                .select('*')
                .eq('id', conversationId)
                .single();
            conversation = data;
        }

        if (!conversation) {
            // Create new conversation
            const { data: newConv } = await supabase
                .from('agent_conversations')
                .insert({
                    user_id: context.userId,
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
            context,
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
                confidence,
                reasoning: response.reasoning,
                usage: response.usage,
                cost: response.cost,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Orchestrator Error:', error);

        // Attempt to log the failure if we have a conversation
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
                error: 'Internal server error',
                message: error.message,
                trace_id: traceId,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
