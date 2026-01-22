import { callLLM } from '../llm-client.ts';
import { EmbeddingService } from '../embedding-service.ts';
import { insightsTools, executeInsightsTool, analyzePatientData, detectPatterns } from './insights-tools.ts';
import { buildInsightsDashboard } from '../../insights-agent/surface-builder.ts';

export interface InsightsAgentState {
    messages: any[];
    userId: string;
    patientId: string;
    intent: string;
    action?: string; // Support for A2UI actions
    toolCalls: any[];
    result: any;
    insights: any[];
    components?: any[]; // A2UI components
    metadata?: any; // A2UI metadata
    usage?: any;
    cost?: number;
}

export async function insightsAgentNode(
    state: InsightsAgentState,
    supabase: any,
    embeddingService: EmbeddingService
): Promise<Partial<InsightsAgentState>> {
    // 1. Handle explicit A2UI actions
    if (state.action === 'generate_insights' || state.intent === 'generate_insights') {
        const analysis = await analyzePatientData(supabase, state.patientId);
        const patterns = detectPatterns(analysis);
        const components = buildInsightsDashboard(analysis, patterns);

        return {
            result: "Here is your detailed insights dashboard.",
            components,
            metadata: { analysis, patterns },
            insights: patterns
        };
    }

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
            model: 'gpt-4o', // Analytical task
            temperature: 0.1, // Very low temperature for analytical accuracy
            tools: insightsTools,
        }
    );

    // Execute tool calls
    const toolResults = [];
    const insights = [];
    let dashboardGenerated = false;
    let components = undefined;
    let metadata = undefined;

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

            // If we identified patterns or analyzed progress, let's proactively generate the dashboard
            if ((name === 'identify_patterns' || name === 'analyze_patient_progress') && !dashboardGenerated) {
                const analysis = await analyzePatientData(supabase, state.patientId);
                const patterns = detectPatterns(analysis);
                components = buildInsightsDashboard(analysis, patterns);
                metadata = { analysis, patterns };
                dashboardGenerated = true;
            }
        }
    }

    return {
        messages: [...state.messages, { role: 'assistant', content: response.content }],
        toolCalls: toolResults,
        result: response.content,
        insights: [...(state.insights || []), ...insights],
        components, // Return A2UI components if generated
        metadata,
        usage: response.usage,
        cost: response.cost
    };
}

