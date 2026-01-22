// @ts-nocheck
import { callLLM } from '../_shared/llm-client.ts';
import { EmbeddingService } from '../_shared/embedding-service.ts';
import { bookingAgentNode } from '../_shared/agents/booking-agent.ts';
import { sessionAgentNode } from '../_shared/agents/session-agent.ts';
import { insightsAgentNode } from '../_shared/agents/insights-agent.ts';
import { followupAgentNode } from '../_shared/agents/followup-agent.ts';

export interface Agent {
    name: string;
    description: string;
    execute: (params: any) => Promise<any>;
}

export function getAgentRegistry(): Record<string, Agent> {
    const embeddingService = new EmbeddingService(Deno.env.get('OPENAI_API_KEY')!);

    return {
        general: {
            name: 'GeneralAgent',
            description: 'Handles general queries and help requests',
            execute: async ({ message, context, conversation, supabase }) => {
                const systemPrompt = `You are a helpful AI assistant for TherapyFlow, a therapy platform.
You can help users with:
- General questions about the platform
- Navigation and feature explanations
- Troubleshooting common issues

Be friendly, concise, and helpful. If the user needs specialized help (booking, sessions, etc.), 
suggest they use the appropriate quick action (@book, @insights, etc.).`;

                const messages = [
                    { role: 'system', content: systemPrompt },
                    ...conversation.messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: message },
                ];

                const response = await callLLM(messages, {
                    model: 'gpt-4o',
                    temperature: 0.7,
                    maxTokens: 1000,
                });

                return {
                    content: response.content,
                    usage: response.usage,
                    cost: response.cost,
                    model: 'gpt-4o',
                };
            },
        },

        booking: {
            name: 'BookingAgent',
            description: 'Handles appointment booking and scheduling',
            execute: async ({ message, context, conversation, supabase }) => {
                const state = {
                    messages: conversation.messages.map(m => ({ role: m.role, content: m.content })),
                    userId: context.userId,
                    intent: 'booking',
                };

                // Add current message
                state.messages.push({ role: 'user', content: message });

                const result = await bookingAgentNode(state, supabase);

                return {
                    content: result.result,
                    toolCalls: result.toolCalls?.map(tc => tc.toolCall),
                    usage: result.usage,
                    cost: result.cost,
                    model: 'gpt-4o',
                };
            },
        },

        session: {
            name: 'SessionAgent',
            description: 'Real-time copilot during therapy sessions',
            execute: async ({ message, context, conversation, supabase }) => {
                const state = {
                    messages: conversation.messages.map(m => ({ role: m.role, content: m.content })),
                    userId: context.userId,
                    sessionId: conversation.id,
                    patientId: context.patientId || context.userId, // Adapt as needed
                    therapistId: context.therapistId || context.userId,
                    intent: 'session',
                };

                state.messages.push({ role: 'user', content: message });

                const result = await sessionAgentNode(state, supabase, embeddingService);

                return {
                    content: result.result,
                    toolCalls: result.toolCalls?.map(tc => tc.toolCall),
                    riskFlags: result.riskFlags,
                    usage: result.usage,
                    cost: result.cost,
                    model: 'gpt-4o',
                };
            },
        },

        insights: {
            name: 'InsightsAgent',
            description: 'Analyzes patient data and provides clinical insights',
            execute: async ({ message, context, conversation, supabase }) => {
                const state = {
                    messages: conversation.messages.map(m => ({ role: m.role, content: m.content })),
                    userId: context.userId,
                    patientId: context.patientId || context.userId,
                    intent: 'insights',
                };

                state.messages.push({ role: 'user', content: message });

                const result = await insightsAgentNode(state, supabase, embeddingService);

                return {
                    content: result.result,
                    toolCalls: result.toolCalls?.map(tc => tc.toolCall),
                    insights: result.insights,
                    components: result.components, // Pass A2UI components
                    metadata: result.metadata,     // Pass A2UI metadata
                    usage: result.usage,
                    cost: result.cost,
                    model: 'gpt-4o',
                };
            },
        },

        followup: {
            name: 'FollowupAgent',
            description: 'Post-session engagement and follow-ups',
            execute: async ({ message, context, conversation, supabase }) => {
                const state = {
                    messages: conversation.messages.map(m => ({ role: m.role, content: m.content })),
                    userId: context.userId,
                    patientId: context.patientId || context.userId,
                    intent: 'followup',
                    // Support passing action if present in message context (future enhancement)
                };

                state.messages.push({ role: 'user', content: message });

                const result = await followupAgentNode(state, supabase);

                return {
                    content: result.result,
                    toolCalls: result.toolCalls?.map(tc => tc.toolCall),
                    components: result.components, // Pass A2UI components
                    metadata: result.metadata,     // Pass A2UI metadata
                    usage: result.usage,
                    cost: result.cost,
                    model: 'gpt-4o',
                };
            },
        },
    };
}
