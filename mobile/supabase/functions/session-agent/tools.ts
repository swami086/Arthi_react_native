import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { reportError } from "../_shared/rollbar.ts";
import * as prompts from "./prompts.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

async function callOpenAI(systemPrompt: string, userContent: string, jsonMode = true) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
            ],
            response_format: jsonMode ? { type: "json_object" } : undefined,
            temperature: 0.1,
        }),
    });

    const data = await response.json();
    if (data.error) throw new Error(`OpenAI Error: ${data.error.message}`);

    const content = data.choices[0].message.content;
    try {
        return JSON.parse(content);
    } catch (e) {
        // Fallback for non-JSON or malformed
        return content;
    }
}

/**
 * Analyzes transcript for therapeutic opportunities, risks, and patterns.
 * We'll do a combined analysis for efficiency.
 */
export async function analyzeTranscript(transcriptText: string) {
    const combinedPrompt = `
    Analyze this therapy session transcript. Identify:
    1. Therapeutic opportunities for CBT, DBT, or ACT interventions.
    2. Any risk indicators for self-harm, suicide, harm-to-others, or substance abuse.
    3. Behavioral patterns, triggers, or trends.
    4. A preliminary SOAP note structure.

    Output strictly as JSON:
    {
        "interventions": [{ "type": "CBT"|"DBT"|"ACT", "title": string, "description": string, "steps": string[], "rationale": string, "confidence": number }],
        "risks": [{ "type": string, "severity": "low"|"medium"|"high"|"critical", "description": string, "evidence": string[], "detectedAt": string }],
        "patterns": [{ "title": string, "description": string, "frequency": string, "trend": "increasing"|"stable"|"decreasing", "confidence": number, "relatedSessions": number }],
        "soap": { "subjective": string, "objective": string, "assessment": string, "plan": string }
    }
    `;

    try {
        return await callOpenAI(combinedPrompt, `Transcript: ${transcriptText}`);
    } catch (error) {
        await reportError(error, 'session-agent:analyzeTranscript');
        throw error;
    }
}

export async function detectRisks(transcriptText: string) {
    try {
        return await callOpenAI(prompts.RISK_DETECTION_PROMPT, `Transcript: ${transcriptText}`);
    } catch (error) {
        await reportError(error, 'session-agent:detectRisks');
        throw error;
    }
}

export async function suggestInterventions(transcriptText: string) {
    try {
        return await callOpenAI(prompts.INTERVENTION_ANALYSIS_PROMPT, `Transcript: ${transcriptText}`);
    } catch (error) {
        await reportError(error, 'session-agent:suggestInterventions');
        throw error;
    }
}

export async function generateSOAPTemplate(transcriptText: string) {
    try {
        return await callOpenAI(prompts.SOAP_TEMPLATE_PROMPT, `Transcript: ${transcriptText}`);
    } catch (error) {
        await reportError(error, 'session-agent:generateSOAPTemplate');
        throw error;
    }
}

export async function detectPatterns(transcriptText: string) {
    try {
        return await callOpenAI(prompts.PATTERN_ANALYSIS_PROMPT, `Transcript: ${transcriptText}`);
    } catch (error) {
        await reportError(error, 'session-agent:detectPatterns');
        throw error;
    }
}
