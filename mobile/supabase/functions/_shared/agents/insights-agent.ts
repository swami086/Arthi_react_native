import { callLLM } from '../llm-client.ts';
import { EmbeddingService } from '../embedding-service.ts';
import { insightsTools, executeInsightsTool } from './insights-tools.ts';

export interface InsightsAgentState {
    messages: any[];
    userId: string;
    patientId: string;
    intent: string;
    toolCalls: any[];
    result: any;
    insights: any[];
    usage?: any;
    cost?: number;
}

export async function insightsAgentNode(
    state: InsightsAgentState,
    supabase: any,
    embeddingService: EmbeddingService
): Promise<Partial<InsightsAgentState>> {
    const systemPrompt = `You are an AI insights analyst for a therapy platform.
Your role is to analyze patient data and provide actionable clinical insights to therapists.

IMPORTANT GUIDELINES:
1. Base all insights on evidence from patient records
2. Identify patterns and trends in treatment progress
3. Suggest evidence-based interventions
4. Flag any concerning patterns or lack of progress
5. Maintain clinical objectivity and HIPAA compliance

Available tools:
- analyze_patient_progress: Analyze progress over time
- identify_patterns: Identify behavioral/symptom patterns
- generate_treatment_recommendations: Suggest evidence-based treatments
- calculate_outcome_metrics: Calculate clinical outcome scores

Current patient ID: ${state.patientId}`;

    const response = await callLLM(
        [
            { role: 'system', content: systemPrompt },
            ...state.messages,
        ],
        {
            model: 'gpt-4-turbo', // Analytical task
            temperature: 0.1, // Very low temperature for analytical accuracy
            tools: insightsTools,
        }
    );

    // Execute tool calls
    const toolResults = [];
    const insights = [];

    if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
            const name = toolCall.function?.name || toolCall.name;
            const args = typeof toolCall.function?.arguments === 'string'
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.arguments || toolCall.input;

            const result = await executeInsightsTool(
                name,
                args,
                supabase,
                embeddingService
            );
            toolResults.push({ toolCall, result });
            insights.push(result);
        }
    }

    return {
        messages: [...state.messages, { role: 'assistant', content: response.content }],
        toolCalls: toolResults,
        result: response.content,
        insights: [...(state.insights || []), ...insights],
        usage: response.usage,
        cost: response.cost
    };
}
