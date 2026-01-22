import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { zodToJsonSchema } from 'npm:zod-to-json-schema@3.21.4';

const checkHomeworkCompletionSchema = z.object({
    patientId: z.string().uuid(),
    homeworkId: z.string().uuid().optional(),
    daysBack: z.number().default(7),
});

const sendWellnessCheckSchema = z.object({
    patientId: z.string().uuid(),
    channel: z.enum(['whatsapp', 'email', 'push']),
    message: z.string().optional(),
});

const analyzeMoodTrendSchema = z.object({
    patientId: z.string().uuid(),
    daysBack: z.number().default(30),
    threshold: z.number().min(1).max(10).default(5),
});

const escalateToTherapistSchema = z.object({
    patientId: z.string().uuid(),
    therapistId: z.string().uuid(),
    reason: z.string(),
    urgency: z.enum(['low', 'medium', 'high']),
    context: z.string().optional(),
});

export const followupTools = [
    {
        type: 'function',
        function: {
            name: 'check_homework_completion',
            description: 'Check status of patient homework items and return summary',
            parameters: zodToJsonSchema(checkHomeworkCompletionSchema),
        },
    },
    {
        type: 'function',
        function: {
            name: 'send_wellness_check',
            description: 'Send a wellness check-in message to a patient via selected channel',
            parameters: zodToJsonSchema(sendWellnessCheckSchema),
        },
    },
    {
        type: 'function',
        function: {
            name: 'analyze_mood_trend',
            description: 'Analyze mood check-in trends over a period of time',
            parameters: zodToJsonSchema(analyzeMoodTrendSchema),
        },
    },
    {
        type: 'function',
        function: {
            name: 'escalate_to_therapist',
            description: 'Escalate concerning patterns or patient requests to the therapist',
            parameters: zodToJsonSchema(escalateToTherapistSchema),
        },
    },
];

export async function executeFollowupTool(
    toolName: string,
    args: any,
    supabase: any
): Promise<any> {
    switch (toolName) {
        case 'check_homework_completion':
            return await checkHomeworkCompletion(supabase, args);
        case 'send_wellness_check':
            return await sendWellnessCheck(supabase, args);
        case 'analyze_mood_trend':
            return await analyzeMoodTrend(supabase, args);
        case 'escalate_to_therapist':
            return await escalateToTherapist(supabase, args);
        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

async function checkHomeworkCompletion(supabase: any, args: any) {
    const dateLimit = new Date(Date.now() - args.daysBack * 86400000).toISOString();

    let query = supabase
        .from('patient_homework')
        .select('id, title, description, due_date, completion_status, completed_at')
        .eq('patient_id', args.patientId)
        .gte('created_at', dateLimit);

    if (args.homeworkId) {
        query = query.eq('id', args.homeworkId);
    }

    const { data: homeworkItems, error } = await query;
    if (error) throw error;

    const totalCount = homeworkItems?.length || 0;
    const completedCount = homeworkItems?.filter((item: any) => item.completion_status === 'completed').length || 0;
    const overdueCount = homeworkItems?.filter((item: any) => item.completion_status === 'overdue').length || 0;
    const pendingCount = homeworkItems?.filter((item: any) => item.completion_status === 'pending').length || 0;

    return {
        homeworkItems,
        totalCount,
        completedCount,
        overdueCount,
        pendingCount,
    };
}

async function sendWellnessCheck(supabase: any, args: any) {
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone_number, email')
        .eq('user_id', args.patientId)
        .single();

    if (profileError) throw profileError;

    // Declare variables before use (Comment 3)
    let success = false;
    let sentAt: string | null = null;

    if (args.channel === 'whatsapp') {
        if (!profile.phone_number) {
            return {
                success: false,
                error: 'Patient phone number missing for WhatsApp delivery',
                channel: args.channel,
                recipientId: args.patientId,
            };
        }
        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
            body: {
                to: profile.phone_number,
                message: args.message || 'Hi, just checking in to see how you are doing today.',
            },
        });
        if (error) throw error;

        success = true;
        sentAt = new Date().toISOString();

    } else if (args.channel === 'email') {
        return {
            success: false,
            error: 'Email delivery not yet implemented',
            channel: args.channel,
            recipientId: args.patientId,
        };
    } else if (args.channel === 'push') {
        return {
            success: false,
            error: 'Push notification delivery not yet implemented',
            channel: args.channel,
            recipientId: args.patientId,
        };
    }

    return {
        success,
        channel: args.channel,
        sentAt,
        recipientId: args.patientId,
    };
}

async function analyzeMoodTrend(supabase: any, args: any) {
    const dateLimit = new Date(Date.now() - args.daysBack * 86400000).toISOString();

    const { data: moods, error } = await supabase
        .from('mood_checkins')
        .select('mood_score, checked_in_at')
        .eq('patient_id', args.patientId)
        .gte('checked_in_at', dateLimit)
        .order('checked_in_at', { ascending: false });

    if (error) throw error;

    if (!moods || moods.length === 0) {
        return { count: 0, needsEscalation: false };
    }

    const scores = moods.map((m: any) => m.mood_score);
    const averageScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    const lowestScore = Math.min(...scores);
    const highestScore = Math.max(...scores);

    // Trend direction: compare first half vs second half averages
    const mid = Math.floor(scores.length / 2);
    const recentHalf = scores.slice(0, mid);
    const olderHalf = scores.slice(mid);

    const recentAvg = recentHalf.length > 0 ? recentHalf.reduce((a: number, b: number) => a + b, 0) / recentHalf.length : averageScore;
    const olderAvg = olderHalf.length > 0 ? olderHalf.reduce((a: number, b: number) => a + b, 0) / olderHalf.length : averageScore;

    const trendDirection = recentAvg > olderAvg ? 'improving' : (recentAvg < olderAvg ? 'declining' : 'stable');
    const concerningCheckins = moods.filter((m: any) => m.mood_score < args.threshold);

    const needsEscalation = averageScore < args.threshold || trendDirection === 'declining';

    return {
        averageScore,
        lowestScore,
        highestScore,
        trendDirection,
        concerningCheckins,
        needsEscalation,
        count: scores.length,
    };
}

async function escalateToTherapist(supabase: any, args: any) {
    const content = `ESCALATION - Urgency: ${args.urgency.toUpperCase()}\nReason: ${args.reason}\nContext: ${args.context || 'None provided'}`;

    const { data: escalation, error } = await supabase
        .from('therapist_notes')
        .insert({
            therapist_id: args.therapistId,
            patient_id: args.patientId,
            note_type: 'escalation',
            content: content,
        })
        .select()
        .single();

    if (error) throw error;

    let notifiedAt = null;
    let notificationError = null;

    // Notify therapist via WhatsApp if possible
    const { data: therapistProfile } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('user_id', args.therapistId)
        .single();

    if (therapistProfile?.phone_number) {
        const { error: notifyError } = await supabase.functions.invoke('send-whatsapp-message', {
            body: {
                to: therapistProfile.phone_number,
                message: `High priority escalation for patient. Urgency: ${args.urgency}. Reason: ${args.reason}`,
            },
        });

        if (notifyError) {
            notificationError = notifyError.message || notifyError;
        } else {
            notifiedAt = new Date().toISOString();
        }
    }

    return {
        escalationId: escalation.id,
        notifiedAt,
        notificationError,
        urgency: args.urgency,
        notified: !!notifiedAt,
    };
}

/**
 * Fetches patient history and treatment plan.
 */
export async function getPatientHistory(supabase: any, userId: string) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    const { data: sessions } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId)
        .order('start_time', { ascending: false })
        .limit(5);

    return {
        profile,
        recentSessions: sessions || []
    };
}

/**
 * Selects personalized questions based on history.
 */
export function selectQuestions(history: any) {
    // Default question set
    const questions = [
        {
            id: 'mood_score',
            type: 'slider',
            label: 'Overall, how are you feeling today?',
            min: 1,
            max: 10,
            required: true
        },
        {
            id: 'homework_completion',
            type: 'checkbox',
            label: 'Were you able to complete your homework assignment from the last session?',
            options: [{ value: 'done', label: 'Yes, completed it' }],
            required: false
        },
        {
            id: 'sleep_quality',
            type: 'radio',
            label: 'How would you rate your sleep last night?',
            options: [
                { value: 'great', label: 'Great (7+ hours)' },
                { value: 'good', label: 'Good (5-7 hours)' },
                { value: 'poor', label: 'Poor (<5 hours)' }
            ],
            required: true
        }
    ];

    return questions;
}

/**
 * Saves wellness check results.
 */
export async function saveWellnessCheck(supabase: any, userId: string, responses: any) {
    const moodScore = responses.mood_score || 5;
    const { data, error } = await supabase
        .from('wellness_checks')
        .insert({
            user_id: userId,
            responses,
            mood_score: moodScore,
            completed_at: new Date().toISOString(),
            flagged_for_review: moodScore <= 3
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

