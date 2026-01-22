import { createClient } from '../supabase/client';

export interface AgentMetric {
    agentId: string;
    userId: string;
    responseTime: number;
    tokensPrompt: number;
    tokensCompletion: number;
    cost: number;
    success: boolean;
    error?: string;
    metadata?: Record<string, any>;
}

/**
 * Service for tracking AI agent performance and usage analytics.
 */
export const analyticsService = {
    /**
     * Track a specific agent interaction.
     */
    async trackAgentInteraction(metric: AgentMetric) {
        const supabase = createClient();

        // Log to agent_executions for audit and analytics
        const { error } = await supabase.from('agent_executions').insert({
            agent_id: metric.agentId,
            user_id: metric.userId,
            execution_time_ms: metric.responseTime,
            tokens_prompt: metric.tokensPrompt,
            tokens_completion: metric.tokensCompletion,
            total_cost: metric.cost,
            status: metric.success ? 'success' : 'failure',
            error_message: metric.error,
            metadata: {
                ...metric.metadata,
                client: 'web',
                timestamp: new Date().toISOString()
            }
        });

        if (error) {
            console.error('Failed to log agent analytics:', error);
        }

        // Potential PostHog integration
        // if (typeof window !== 'undefined' && (window as any).posthog) {
        //     (window as any).posthog.capture('agent_interaction', metric);
        // }
    },

    /**
     * Track user satisfaction with an agent response.
     */
    async trackSatisfaction(executionId: string, rating: number, feedback?: string) {
        const supabase = createClient();

        const { error } = await supabase
            .from('agent_executions')
            .update({
                metadata: {
                    user_rating: rating,
                    user_feedback: feedback
                }
            })
            .eq('id', executionId);

        if (error) {
            console.error('Failed to log satisfaction score:', error);
        }
    }
};
