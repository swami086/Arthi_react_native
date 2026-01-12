import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { zodToJsonSchema } from 'npm:zod-to-json-schema@3.21.4';

const analyzeProgressSchema = z.object({
    patientId: z.string().uuid(),
    timeframe: z.enum(['week', 'month', 'quarter', 'year']),
});

const identifyPatternsSchema = z.object({
    patientId: z.string().uuid(),
    patternType: z.enum(['symptoms', 'triggers', 'coping_strategies', 'treatment_response']),
});

const recommendationsSchema = z.object({
    patientId: z.string().uuid(),
    currentDiagnosis: z.array(z.string()),
    treatmentHistory: z.string(),
});

const outcomeMetricsSchema = z.object({
    patientId: z.string().uuid(),
    metricType: z.enum(['PHQ9', 'GAD7', 'PCL5', 'custom']),
});

export const insightsTools = [
    {
        type: 'function',
        function: {
            name: 'analyze_patient_progress',
            description: 'Analyze patient progress over time using session notes and goals',
            parameters: zodToJsonSchema(analyzeProgressSchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'identify_patterns',
            description: 'Identify patterns in patient behavior, symptoms, or treatment response',
            parameters: zodToJsonSchema(identifyPatternsSchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'generate_treatment_recommendations',
            description: 'Generate evidence-based treatment recommendations',
            parameters: zodToJsonSchema(recommendationsSchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'calculate_outcome_metrics',
            description: 'Calculate clinical outcome metrics (PHQ-9, GAD-7, etc.)',
            parameters: zodToJsonSchema(outcomeMetricsSchema),
        }
    },
];

export async function executeInsightsTool(
    toolName: string,
    args: any,
    supabase: any,
    embeddingService: any
): Promise<any> {
    switch (toolName) {
        case 'analyze_patient_progress':
            return await analyzeProgress(supabase, embeddingService, args);

        case 'identify_patterns':
            return await identifyPatterns(supabase, embeddingService, args);

        case 'generate_treatment_recommendations':
            return await generateRecommendations(supabase, embeddingService, args);

        case 'calculate_outcome_metrics':
            return await calculateMetrics(supabase, args);

        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

async function analyzeProgress(supabase: any, embeddingService: any, args: any) {
    // Retrieve session notes for timeframe
    const timeframeMap: Record<string, number> = {
        week: 7,
        month: 30,
        quarter: 90,
        year: 365,
    };
    const days = timeframeMap[args.timeframe];

    const memories = await embeddingService.searchSimilarMemories(
        supabase,
        args.patientId,
        'patient progress and treatment outcomes',
        ['session_note'],
        20
    );

    // Filter by timeframe
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentMemories = memories.filter((m: any) =>
        new Date(m.created_at) >= cutoffDate
    );

    return {
        patientId: args.patientId,
        timeframe: args.timeframe,
        sessionCount: recentMemories.length,
        progressSummary: recentMemories.map((m: any) => ({
            date: m.created_at,
            content: m.content,
        })),
    };
}

async function identifyPatterns(supabase: any, embeddingService: any, args: any) {
    const queryMap: Record<string, string> = {
        symptoms: 'symptoms and mental health indicators',
        triggers: 'triggers and stressors',
        coping_strategies: 'coping strategies and interventions',
        treatment_response: 'treatment response and outcomes',
    };

    const memories = await embeddingService.searchSimilarMemories(
        supabase,
        args.patientId,
        queryMap[args.patternType],
        ['session_note', 'therapist_note'],
        15
    );

    return {
        patientId: args.patientId,
        patternType: args.patternType,
        identifiedPatterns: memories.map((m: any) => m.content),
        count: memories.length,
    };
}

async function generateRecommendations(supabase: any, embeddingService: any, args: any) {
    // Retrieve comprehensive patient history
    const memories = await embeddingService.searchSimilarMemories(
        supabase,
        args.patientId,
        'treatment history and clinical outcomes',
        ['session_note', 'therapist_note', 'patient_goal'],
        20
    );

    return {
        patientId: args.patientId,
        currentDiagnosis: args.currentDiagnosis,
        recommendations: [
            'Continue current evidence-based therapy approach',
            'Consider adjunct mindfulness-based interventions',
            'Monitor for treatment response over next 4-6 weeks',
        ],
        evidenceBase: memories.slice(0, 5).map((m: any) => m.content),
    };
}

async function calculateMetrics(supabase: any, args: any) {
    // Fetch assessment scores from database
    const { data: assessments } = await supabase
        .from('patient_assessments')
        .select('*')
        .eq('patient_id', args.patientId)
        .eq('assessment_type', args.metricType)
        .order('assessed_at', { ascending: false })
        .limit(10);

    return {
        patientId: args.patientId,
        metricType: args.metricType,
        latestScore: assessments?.[0]?.score || null,
        trend: assessments?.map((a: any) => ({ date: a.assessed_at, score: a.score })) || [],
    };
}
