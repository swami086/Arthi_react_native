// @ts-nocheck
import { callLLM } from '../llm-client.ts';
import { calendarTools, executeCalendarTool } from './calendar-tools.ts';
import { CalendarService } from '../calendar-integrations/calendar-service.ts';
import { reportError, reportInfo } from '../rollbar.ts';

export interface CalendarAgentState {
  messages: any[];
  userId: string;
  intent: string;
  toolCalls: any[];
  result: any;
  usage?: any;
  cost?: number;
}

function calculateCost(usage: any): number {
  // GPT-4o: $2.50/M input, $10/M output
  const inputCost = (usage.promptTokens / 1_000_000) * 2.50;
  const outputCost = (usage.completionTokens / 1_000_000) * 10.00;
  return inputCost + outputCost;
}

export async function calendarManagementAgentNode(
  state: CalendarAgentState,
  supabase: any
): Promise<Partial<CalendarAgentState>> {
  const calendarService = new CalendarService(supabase);

  const systemPrompt = `You are a calendar management assistant for therapists.
Your role is to:
1. Check therapist availability across connected calendars (Google, Outlook, internal)
2. Propose optimal meeting slots to patients (3-5 slots recommended)
3. Detect scheduling conflicts before proposing slots
4. Manage calendar integrations (connect/disconnect Google/Outlook)
5. Provide team calendar visibility (busy/free only, respecting privacy)

Available tools:
- check_availability: Check therapist availability for a date range
- propose_slots: Propose optimal meeting slots to patient (creates proposal that expires in 48 hours)
- disconnect_calendar: Disconnect a calendar integration
- get_team_calendars: Get busy/free view of team calendars
- sync_calendar: Manually trigger calendar sync

Guidelines:
- Always verify availability before proposing slots
- Propose 3-5 slots with varying times (morning, afternoon, evening) when possible
- Consider therapist working hours and buffer times from preferences
- Respect privacy settings (show_busy_only flag)
- Use low temperature (0.2) for scheduling accuracy
- Be proactive: suggest syncing calendars if they haven't been synced recently
- When proposing slots, explain why these times are optimal

Current user ID: ${state.userId}`;

  try {
    reportInfo('Executing CalendarManagementAgent', 'calendar:agent', { userId: state.userId });

    const response = await callLLM(
      [
        { role: 'system', content: systemPrompt },
        ...state.messages,
      ],
      {
        model: 'gpt-4o',
        temperature: 0.2, // Low temperature for scheduling accuracy
        tools: calendarTools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        })),
        maxTokens: 1500,
      }
    );

    // Execute tool calls
    const toolResults = [];
    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const toolCall of response.toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

        reportInfo(`Executing calendar tool: ${toolName}`, 'calendar:agent:tool', {
          toolName,
          args: toolArgs,
        });

        const result = await executeCalendarTool(
          toolName,
          toolArgs,
          supabase,
          calendarService
        );

        toolResults.push({
          tool: toolName,
          arguments: toolArgs,
          result: result,
        });
      }
    }

    const cost = response.usage ? calculateCost(response.usage) : undefined;

    return {
      messages: [
        ...state.messages,
        {
          role: 'assistant',
          content: response.content,
          toolCalls: response.toolCalls,
        },
      ],
      toolCalls: toolResults,
      result: response.content,
      usage: response.usage,
      cost: cost,
    };
  } catch (error: any) {
    reportError(error, 'calendarManagementAgentNode', { userId: state.userId });
    return {
      messages: [
        ...state.messages,
        {
          role: 'assistant',
          content: `I encountered an error while managing your calendar: ${error.message}. Please try again or contact support.`,
        },
      ],
      result: `Error: ${error.message}`,
    };
  }
}
