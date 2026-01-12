import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { zodToJsonSchema } from 'npm:zod-to-json-schema@3.21.4';

const retrieveHistorySchema = z.object({
    patientId: z.string().uuid(),
    lookbackDays: z.number().min(7).max(365).default(90),
});

const suggestInterventionSchema = z.object({
    symptoms: z.array(z.string()),
    therapyType: z.enum(['CBT', 'DBT', 'ACT', 'Psychodynamic', 'Humanistic']),
    sessionGoal: z.string(),
});

const flagRiskSchema = z.object({
    patientId: z.string().uuid(),
    riskType: z.enum(['suicidal_ideation', 'self_harm', 'substance_abuse', 'violence']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    evidence: z.string(),
    sessionId: z.string().uuid().optional(),
});

const soapNoteSchema = z.object({
    transcript: z.string(),
    sessionId: z.string().uuid(),
});

export const sessionTools = [
    {
        type: 'function',
        function: {
            name: 'retrieve_patient_history',
            description: 'Retrieve relevant patient history and previous session notes',
            parameters: zodToJsonSchema(retrieveHistorySchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'suggest_intervention',
            description: 'Suggest therapeutic interventions based on current conversation',
            parameters: zodToJsonSchema(suggestInterventionSchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'flag_risk_indicator',
            description: 'Flag potential risk indicators (suicidal ideation, self-harm, etc.)',
            parameters: zodToJsonSchema(flagRiskSchema),
        }
    },
    {
        type: 'function',
        function: {
            name: 'generate_soap_note_draft',
            description: 'Generate a draft SOAP note from session transcript',
            parameters: zodToJsonSchema(soapNoteSchema),
        }
    },
];

export async function executeSessionTool(
    toolName: string,
    args: any,
    supabase: any,
    embeddingService: any
): Promise<any> {
    switch (toolName) {
        case 'retrieve_patient_history':
            return await retrieveHistory(supabase, embeddingService, args);

        case 'suggest_intervention':
            return await suggestIntervention(args);

        case 'flag_risk_indicator':
            return await flagRisk(supabase, args);

        case 'generate_soap_note_draft':
            return await generateSOAPDraft(supabase, args);

        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

async function retrieveHistory(supabase: any, embeddingService: any, args: any) {
    // Use RAG to retrieve relevant memories
    const memories = await embeddingService.searchSimilarMemories(
        supabase,
        args.patientId,
        'patient history and previous sessions',
        ['session_note', 'patient_goal', 'therapist_note'],
        10
    );

    return {
        patientId: args.patientId,
        relevantHistory: memories.map((m: any) => ({
            type: m.memory_type,
            content: m.content,
            date: m.created_at,
            similarity: m.similarity,
        })),
    };
}

async function suggestIntervention(args: any) {
    // Evidence-based intervention suggestions
    const interventions: Record<string, string[]> = {
        CBT: [
            'Cognitive restructuring: Challenge negative automatic thoughts',
            'Behavioral activation: Schedule pleasant activities',
            'Exposure therapy: Gradual exposure to feared situations',
        ],
        DBT: [
            'Mindfulness: Practice present-moment awareness',
            'Distress tolerance: Use TIPP skills (Temperature, Intense exercise, Paced breathing, Paired muscle relaxation)',
            'Emotion regulation: Identify and label emotions',
        ],
        ACT: [
            'Acceptance: Practice willingness to experience difficult thoughts/feelings',
            'Cognitive defusion: Create distance from thoughts',
            'Values clarification: Identify what matters most',
        ],
        Psychodynamic: [
            'Free association: Encourage patient to speak without censorship',
            'Transference analysis: Explore feelings directed at the therapist',
            'Identifying patterns: Link current behaviors to early childhood experiences',
        ],
        Humanistic: [
            'Unconditional positive regard: Demonstrate total acceptance',
            'Empathic mirroring: Reflect back the patient\'s feelings to deepen understanding',
            'Focus on the "Here and Now": Encourage awareness of current feelings and state',
        ],
    };

    const suggested = interventions[args.therapyType] || [
        'Active listening and validation of the patient\'s experience',
        'Exploring the emotional impact of current symptoms',
        'Setting specific, achievable therapeutic goals for the coming week'
    ];

    return {
        therapyType: args.therapyType,
        symptoms: args.symptoms,
        suggestedInterventions: suggested,
        sessionGoal: args.sessionGoal,
    };
}

async function flagRisk(supabase: any, args: any) {
    // Store risk flag in database
    const { data, error } = await supabase
        .from('risk_flags')
        .insert({
            patient_id: args.patientId,
            risk_type: args.riskType,
            severity: args.severity,
            evidence: args.evidence,
            session_id: args.sessionId,
            flagged_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;

    // If critical, trigger immediate notification (if function exists)
    if (args.severity === 'critical') {
        try {
            await supabase.functions.invoke('send-emergency-alert', {
                body: { riskFlag: data },
            });
        } catch (err) {
            console.warn('send-emergency-alert function failed or does not exist:', err.message);
        }
    }

    return { flagged: true, riskFlag: data };
}

async function generateSOAPDraft(supabase: any, args: any) {
    // Call existing generate-soap-note function
    const { data, error } = await supabase.functions.invoke('generate-soap-note', {
        body: {
            transcript: args.transcript,
            sessionId: args.sessionId,
        },
    });

    if (error) throw error;
    return { soapNote: data, sessionId: args.sessionId };
}
