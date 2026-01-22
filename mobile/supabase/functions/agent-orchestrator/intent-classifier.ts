// @ts-nocheck
import { callLLM } from '../_shared/llm-client.ts';

export interface IntentResult {
    intent: 'booking' | 'session' | 'insights' | 'followup' | 'general';
    confidence: number;
    reasoning: string[];
}

export async function classifyIntent(
    message: string,
    context: any
): Promise<IntentResult> {
    const systemPrompt = `You are an intent classifier for a therapy platform. 
Classify the user's message into one of these intents:
- booking: User wants to book/schedule an appointment
- session: Related to ongoing therapy sessions, SOAP notes, or session management
- insights: Requesting analytics, progress reports, or dashboard insights
- followup: Post-session follow-up, mood tracking, or feedback
- general: General questions, help, or other topics

Respond with JSON: {"intent": "booking", "confidence": 85, "reasoning": ["User mentioned 'book'", "Mentioned anxiety specialty"]}`;

    const response = await callLLM(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nMessage: ${message}` },
        ],
        {
            model: 'gpt-4o-mini', // Use cheaper model for classification
            temperature: 0.1,
            maxTokens: 200,
        }
    );

    try {
        const result = JSON.parse(response.content);
        return {
            intent: result.intent,
            confidence: result.confidence,
            reasoning: result.reasoning || [],
        };
    } catch (error) {
        // Fallback to keyword-based classification
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
            return { intent: 'booking', confidence: 70, reasoning: ['Keyword: book/appointment'] };
        }

        if (lowerMessage.includes('session') || lowerMessage.includes('soap') || lowerMessage.includes('notes')) {
            return { intent: 'session', confidence: 70, reasoning: ['Keyword: session/soap'] };
        }

        if (lowerMessage.includes('insight') || lowerMessage.includes('progress') || lowerMessage.includes('analytics')) {
            return { intent: 'insights', confidence: 70, reasoning: ['Keyword: insights/progress'] };
        }

        if (lowerMessage.includes('followup') || lowerMessage.includes('feeling') || lowerMessage.includes('mood')) {
            return { intent: 'followup', confidence: 70, reasoning: ['Keyword: followup/mood'] };
        }

        return { intent: 'general', confidence: 50, reasoning: ['No clear intent detected'] };
    }
}
