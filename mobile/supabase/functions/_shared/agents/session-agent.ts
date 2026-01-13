import { callLLM } from '../llm-client.ts';
import { EmbeddingService } from '../embedding-service.ts';
import { sessionTools, executeSessionTool } from './session-tools.ts';

export interface SessionAgentState {
    messages: any[];
    userId: string;
    sessionId: string;
    patientId: string;
    therapistId: string;
    intent: string;
    toolCalls: any[];
    result: any;
    riskFlags: any[];
    usage?: any;
    cost?: number;
}

export async function sessionAgentNode(
    state: SessionAgentState,
    supabase: any,
    embeddingService: EmbeddingService
): Promise<Partial<SessionAgentState>> {
    // Retrieve patient context using RAG
    const patientContext = await embeddingService.searchSimilarMemories(
        supabase,
        state.patientId,
        'patient background and treatment history',
        ['session_note', 'patient_goal', 'therapist_note'],
        5
    );

    const contextSummary = patientContext
        .map((m: any) => `- ${m.content}`)
        .join('\n');

    const systemPrompt = `You are an AI copilot assisting a therapist during a live therapy session.
Your role is to provide real-time suggestions, flag risks, and help with documentation.

IMPORTANT GUIDELINES:
1. NEVER provide direct advice to the patient - only assist the therapist
2. Flag any risk indicators immediately (suicidal ideation, self-harm, etc.)
3. Suggest evidence-based interventions appropriate to the therapy modality
4. Be concise - therapists need quick, actionable insights
5. Maintain HIPAA compliance - all data is encrypted and logged

Patient Context:
${contextSummary}

Current session ID: ${state.sessionId}
Therapist ID: ${state.therapistId}
Patient ID: ${state.patientId}`;

    const response = await callLLM(
        [
            { role: 'system', content: systemPrompt },
            ...state.messages,
        ],
        {
            model: 'gpt-4o',
            temperature: 0.2, // Very low temperature for clinical accuracy
            tools: sessionTools,
        }
    );

    // Execute tool calls
    const toolResults = [];
    const riskFlags = [];

    if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
            const name = toolCall.function?.name || toolCall.name;
            const args = typeof toolCall.function?.arguments === 'string'
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.arguments || toolCall.input;

            const result = await executeSessionTool(
                name,
                args,
                supabase,
                embeddingService
            );
            toolResults.push({ toolCall, result });

            // Track risk flags
            if (name === 'flag_risk_indicator') {
                riskFlags.push(result.riskFlag);
            }
        }
    }

    return {
        messages: [...state.messages, { role: 'assistant', content: response.content }],
        toolCalls: toolResults,
        result: response.content,
        riskFlags: [...(state.riskFlags || []), ...riskFlags],
        usage: response.usage,
        cost: response.cost
    };
}
