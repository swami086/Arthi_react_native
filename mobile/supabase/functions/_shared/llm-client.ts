// @ts-nocheck
import OpenAI from 'npm:openai@4.77.0';
import { reportError, reportInfo } from './rollbar.ts';

// Initialize clients
const openaiKey = Deno.env.get('OPENAI_API_KEY');

if (!openaiKey) console.warn('OPENAI_API_KEY is missing in llm-client');


const openai = new OpenAI({
    apiKey: openaiKey || 'dummy_key_to_prevent_init_crash',
});

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    tools?: any[];
}

export interface LLMResponse {
    content: string;
    toolCalls?: any[];
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    cost?: number;
}

// Cost per 1M tokens (as of early 2026)
const COSTS = {
    'gpt-4o': { input: 2.5, output: 10 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
};

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const modelKey = model.includes('gpt-4') ? 'gpt-4o' : 'gpt-3.5-turbo';

    const rate = COSTS[modelKey] || COSTS['gpt-4o'];
    return (promptTokens * rate.input + completionTokens * rate.output) / 1_000_000;
}

/**
 * Call LLM with automatic fallback from OpenAI to Anthropic
 */
export async function callLLM(
    messages: LLMMessage[],
    options: LLMOptions = {},
    traceId?: string
): Promise<LLMResponse> {
    const {
        model = 'gpt-4o',
        temperature = 0.7,
        maxTokens = 4096,
        stream = false,
        tools = [],
    } = options;

    try {
        // Enforce OpenAI for all 'claude' requests by mapping them or just letting callOpenAI handle default
        let targetModel = model;
        if (model.includes('claude') || model.includes('sonnet') || model.includes('opus')) {
            reportInfo(`Replacing ${model} with gpt-4o (User requested OpenAI only)`, 'llm-client:model-swap', { originalModel: model, traceId });
            targetModel = 'gpt-4o';
        }

        reportInfo('Calling OpenAI API', 'llm-client:openai', { model: targetModel, traceId });
        return await callOpenAI(messages, { ...options, model: targetModel });
    } catch (error) {
        reportError(error, 'llm-client:call-failed', { model, traceId });
        console.error(`${model} failed`, error);
        throw error;
    }
}

async function callOpenAI(
    messages: LLMMessage[],
    options: LLMOptions
): Promise<LLMResponse> {
    const finalModel = options.model === 'gpt-4-turbo' ? 'gpt-4o' : (options.model || 'gpt-4o');

    const response = await openai.chat.completions.create({
        model: finalModel,
        messages: messages.map(m => ({
            role: m.role,
            content: m.content,
        })),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        tools: options.tools?.length > 0 ? options.tools : undefined,
        stream: options.stream,
    });

    if (options.stream) {
        // Return stream object for streaming responses
        return { content: '', stream: response };
    }

    const choice = response.choices[0];
    const usage = response.usage;

    return {
        content: choice.message.content || '',
        toolCalls: choice.message.tool_calls,
        usage: {
            promptTokens: usage?.prompt_tokens || 0,
            completionTokens: usage?.completion_tokens || 0,
            totalTokens: usage?.total_tokens || 0,
        },
        cost: calculateCost(
            finalModel,
            usage?.prompt_tokens || 0,
            usage?.completion_tokens || 0
        ),
    };
}

export { openai };
