import { callLLM } from '../llm-client.ts';
import { bookingTools, executeBookingTool } from './booking-tools.ts';

export interface BookingAgentState {
    messages: any[];
    userId: string;
    intent: string;
    toolCalls: any[];
    result: any;
}

export async function bookingAgentNode(
    state: BookingAgentState,
    supabase: any
): Promise<Partial<BookingAgentState>> {
    const systemPrompt = `You are a helpful booking assistant for a therapy platform.
Your role is to help patients book appointments with therapists.

Available tools:
- check_therapist_availability: Check available slots
- create_appointment: Book an appointment
- send_booking_confirmation: Send confirmations
- suggest_alternative_slots: Suggest alternatives if preferred slot unavailable

Always:
1. Confirm patient preferences (date, time, therapist)
2. Check availability before booking
3. Send confirmation after successful booking
4. Be empathetic and patient-focused

Current user ID: ${state.userId}`;

    const response = await callLLM(
        [
            { role: 'system', content: systemPrompt },
            ...state.messages,
        ],
        {
            model: 'gpt-4o',
            temperature: 0.3,
            tools: bookingTools,
        }
    );

    // Execute tool calls if any
    const toolResults = [];
    if (response.toolCalls && response.toolCalls.length > 0) {
        for (const toolCall of response.toolCalls) {
            // Handle tool call (name and arguments are slightly different in OpenAI vs Anthropic in the SDK)
            // callLLM normalizes some things but SDK might still have differences.
            // Based on callLLM implementation, toolCalls are returned as choice.message.tool_calls (OpenAI) 
            // or response.content filter (Anthropic).

            const name = toolCall.function?.name || toolCall.name;
            const args = typeof toolCall.function?.arguments === 'string'
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.arguments || toolCall.input;

            const result = await executeBookingTool(
                name,
                args,
                supabase
            );
            toolResults.push({ toolCall, result });
        }
    }

    return {
        messages: [...state.messages, { role: 'assistant', content: response.content }],
        toolCalls: toolResults,
        result: response.content,
    };
}
