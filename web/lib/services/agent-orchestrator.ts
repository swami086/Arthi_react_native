import { createClient } from '../supabase/client';

export interface SendMessageParams {
    message: string;
    context?: Record<string, any>;
    conversationId?: string;
}

export interface AgentOrchestratorResponse {
    conversationId: string;
    agentType: string;
    response: string;
    toolCalls?: any[];
    components?: any[];
    metadata?: any;
    confidence?: number;
    reasoning?: string[];
    usage?: any;
    cost?: number;
}

/**
 * Unified entry point for the AI Agent Orchestrator.
 * Routes all requests through a single edge function which handles intent classification and dispatch.
 */
export async function sendMessageToOrchestrator({
    message,
    context = {},
    conversationId
}: SendMessageParams): Promise<AgentOrchestratorResponse> {
    const supabase = createClient();

    const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
        body: {
            message,
            context,
            conversationId
        }
    });

    if (error) {
        console.error('Agent Orchestrator Request Failed:', error);
        throw error;
    }

    return data as AgentOrchestratorResponse;
}

/**
 * Enhanced streaming support for real-time agent responses
 */
export async function streamMessageFromOrchestrator({
    message,
    context = {},
    conversationId,
    onToken,
    onComplete,
    onError
}: SendMessageParams & {
    onToken: (token: string) => void;
    onComplete?: (response: AgentOrchestratorResponse) => void;
    onError?: (error: any) => void;
}) {
    const supabase = createClient();

    try {
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/agent-orchestrator`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,

                },
                body: JSON.stringify({
                    message,
                    context,
                    conversationId,
                    stream: true
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Streaming failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                onToken(chunk);
            }
        }

        // Final response object (mocked or parsed from final chunk if protocol supports it)
        onComplete?.({
            response: fullResponse,
            conversationId: conversationId || 'new-conv',
            agentType: 'orchestrator'
        } as AgentOrchestratorResponse);

    } catch (error) {
        console.error('Streaming error:', error);
        onError?.(error);
    }
}

/**
 * Retrieve conversation history
 */
export async function getConversationHistory(conversationId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

/**
 * Clear conversation state
 */
export async function clearConversation(conversationId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('agent_conversations')
        .delete()
        .eq('id', conversationId);

    if (error) throw error;
}

/**
 * Retry a failed message
 */
export async function retryMessage(params: SendMessageParams) {
    return sendMessageToOrchestrator(params);
}

