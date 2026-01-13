import { callLLM } from '../llm-client.ts';
import { followupTools, executeFollowupTool } from './followup-tools.ts';
import { reportInfo, startTimer } from '../rollbar.ts';

export interface FollowupAgentState {
    messages: any[];
    userId: string;
    intent: string;
    toolCalls: any[];
    result: any;
    usage?: any;
    cost?: number;
}

export async function followupAgentNode(
    state: FollowupAgentState,
    supabase: any
): Promise<Partial<FollowupAgentState>> {
    const startTime = startTimer('followup-agent:execute');

    const systemPrompt = `You are an empathetic, patient-focused Followup Assistant for a mental health platform.
Your primary role is post-session engagement and monitoring patient well-being between therapy sessions.

Core Responsibilities:
1. POST-SESSION ENGAGEMENT: Follow up after therapy sessions to see how patients are processing their reflections.
2. HOMEWORK TRACKING: Check if patients have completed their assigned homework/exercises. Provide encouragement and help overcome barriers to completion.
3. WELLNESS CHECKS: Conduct compassionate wellness checks to monitor daily wellbeing.
4. MOOD TREND ANALYSIS: Analyze mood patterns over time to identify improvements or concerning declines.
5. THERAPIST ESCALATION: Identify when a situation requires professional intervention (e.g., significant mood decline, missed critical homework, or direct patient request for help) and escalate to their therapist with appropriate context and urgency.

Tone and Style:
- Always be supportive, non-judgmental, and compassionate.
- Use warm, professional language suitable for a therapeutic context.
- Prioritize patient safety and emotional comfort.

Available Tools:
- check_homework_completion: For tracking assigned tasks.
- send_wellness_check: For reaching out via WhatsApp/Email/Push.
- analyze_mood_trend: For evaluating emotional progress over time.
- escalate_to_therapist: For notifying the professional when risk is identified.

Current Patient ID: ${state.userId}`;

    const response = await callLLM(
        [
            { role: 'system', content: systemPrompt },
            ...state.messages,
        ],
        {
            model: 'gpt-4o',
            temperature: 0.7,
            tools: followupTools,
        }
    );

    // Execute tool calls if any
    const toolResults = [];
    if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
            const name = toolCall.function?.name || toolCall.name;
            const args = typeof toolCall.function?.arguments === 'string'
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.arguments || toolCall.input;

            try {
                const result = await executeFollowupTool(
                    name,
                    args,
                    supabase
                );
                toolResults.push({ toolCall, result });
            } catch (error) {
                console.error(`Error executing tool ${name}:`, error);
                toolResults.push({ toolCall, error: error.message });
            }
        }
    }

    // Calculate metrics
    const toolCallsCount = toolResults.length;
    const escalationsCount = toolResults.filter(tr =>
        tr.toolCall.function?.name === 'escalate_to_therapist' ||
        tr.toolCall.name === 'escalate_to_therapist'
    ).length;
    const duration = Date.now() - startTime;

    reportInfo('FollowupAgent execution completed', 'followup-agent:execute', {
        toolCallsCount,
        escalationsCount,
        duration,
        userId: state.userId,
        intent: state.intent,
        tokensUsed: response.usage?.totalTokens || 0,
        cost: response.cost || 0
    });

    return {
        messages: [...state.messages, { role: 'assistant', content: response.content }],
        toolCalls: toolResults,
        result: response.content,
        usage: response.usage,
        cost: response.cost
    };
}
