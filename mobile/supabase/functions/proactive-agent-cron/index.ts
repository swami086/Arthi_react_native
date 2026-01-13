
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { traceId, spanId } = extractTraceContext(req);
    const startTime = Date.now();

    reportInfo('Proactive agent cron started', 'proactive-agent-cron:start', { traceId });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let scheduledMessagesSent = 0;
    let wellnessChecksTriggered = 0;
    let homeworkReminders = 0;

    try {
        // Workflow 1: Process Scheduled Messages
        const workflow1Start = Date.now();
        reportInfo('Processing scheduled messages', 'proactive-agent-cron:scheduled-messages', { traceId });
        try {
            const { data: pendingMessages, error: fetchError } = await supabase
                .from('scheduled_messages')
                .select('*')
                .eq('status', 'pending')
                .lte('scheduled_for', new Date().toISOString());

            if (fetchError) throw fetchError;

            if (pendingMessages && pendingMessages.length > 0) {
                for (const msg of pendingMessages) {
                    try {
                        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp-message`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                                'X-Rollbar-Trace-Id': traceId,
                                'X-Rollbar-Span-Id': spanId
                            },
                            body: JSON.stringify({
                                phoneNumber: msg.to,
                                message: msg.message,
                                templateName: msg.template_name,
                                templateParams: msg.template_params
                            })
                        });

                        const result = await response.json();
                        if (response.ok && result.success) {
                            await supabase
                                .from('scheduled_messages')
                                .update({ status: 'sent', sent_at: new Date().toISOString() })
                                .eq('id', msg.id);
                            scheduledMessagesSent++;
                        } else {
                            await supabase
                                .from('scheduled_messages')
                                .update({
                                    status: 'failed',
                                    error: result.error || response.statusText
                                })
                                .eq('id', msg.id);
                        }
                    } catch (msgError: any) {
                        reportError(msgError, 'proactive-agent-cron:workflow:scheduled-messages:item', {
                            messageId: msg.id, traceId, spanId
                        });
                        await supabase
                            .from('scheduled_messages')
                            .update({ status: 'failed', error: msgError.message })
                            .eq('id', msg.id);
                    }
                }
            }
            const workflow1Duration = Date.now() - workflow1Start;
            reportInfo('Scheduled messages processed', 'proactive-agent-cron:scheduled-messages:complete', {
                count: scheduledMessagesSent, duration: workflow1Duration, traceId
            });
        } catch (err: any) {
            reportError(err, 'proactive-agent-cron:workflow:scheduled-messages', { traceId, spanId });
        }

        // Workflow 2: Trigger Wellness Checks
        const workflow2Start = Date.now();
        reportInfo('Triggering wellness checks', 'proactive-agent-cron:wellness-checks', { traceId });
        try {
            const { data: users, error: userError } = await supabase
                .from('user_agent_preferences')
                .select('user_id, wellness_check_frequency, quiet_hours')
                .contains('enabled_agents', ['followup']);

            if (userError) throw userError;

            if (users) {
                for (const user of users) {
                    try {
                        // Quiet Hours Check
                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMin = now.getMinutes();
                        const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

                        const quietHours = user.quiet_hours || { start: "22:00", end: "08:00" };
                        if (currentTimeStr >= quietHours.start || currentTimeStr <= quietHours.end) {
                            continue; // Skip during quiet hours
                        }

                        // Frequency Check
                        const { data: lastCheck } = await supabase
                            .from('agent_conversations')
                            .select('updated_at')
                            .eq('user_id', user.user_id)
                            .eq('agent_type', 'followup')
                            .order('updated_at', { ascending: false })
                            .limit(1)
                            .maybeSingle();

                        const lastCheckTime = lastCheck ? new Date(lastCheck.updated_at).getTime() : 0;
                        const diffDays = (now.getTime() - lastCheckTime) / (1000 * 60 * 60 * 24);

                        let due = false;
                        const freq = user.wellness_check_frequency || 'normal';
                        if (freq === 'normal' && diffDays >= 1) due = true;
                        else if (freq === 'reduced' && diffDays >= 3) due = true;
                        else if (freq === 'minimal' && diffDays >= 7) due = true;

                        if (due) {
                            const response = await fetch(`${SUPABASE_URL}/functions/v1/agent-orchestrator`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                                    'X-Rollbar-Trace-Id': traceId,
                                    'X-Rollbar-Span-Id': spanId
                                },
                                body: JSON.stringify({
                                    message: "Automated wellness check",
                                    context: { userId: user.user_id, automated: true, type: 'wellness_check' },
                                    conversationId: null
                                })
                            });

                            if (response.ok) wellnessChecksTriggered++;
                        }
                    } catch (userError: any) {
                        reportError(userError, 'proactive-agent-cron:workflow:wellness-checks:item', {
                            userId: user.user_id, traceId, spanId
                        });
                    }
                }
            }
            const workflow2Duration = Date.now() - workflow2Start;
            reportInfo('Wellness checks triggered', 'proactive-agent-cron:wellness-checks:complete', {
                count: wellnessChecksTriggered, duration: workflow2Duration, traceId
            });
        } catch (err: any) {
            reportError(err, 'proactive-agent-cron:workflow:wellness-checks', { traceId, spanId });
        }

        // Workflow 3: Send Homework Reminders
        const workflow3Start = Date.now();
        reportInfo('Processing homework reminders', 'proactive-agent-cron:homework-reminders', { traceId });
        try {
            const { data: overdueHomework, error: hwError } = await supabase
                .from('patient_homework')
                .select(`
          id,
          patient_id,
          title,
          due_date
        `)
                .eq('completion_status', 'pending')
                .lt('due_date', new Date().toISOString())
                .gt('due_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Overdue in last 24h

            if (hwError) throw hwError;

            if (overdueHomework) {
                for (const hw of overdueHomework) {
                    try {
                        // Check if reminder was already sent (check recent followup/reminders)
                        // For simplicity in this iteration, we trigger orchestrator which should handle idempotency or just send.
                        // Plan says: "invoke agent-orchestrator function with homework context"
                        const response = await fetch(`${SUPABASE_URL}/functions/v1/agent-orchestrator`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                                'X-Rollbar-Trace-Id': traceId,
                                'X-Rollbar-Span-Id': spanId
                            },
                            body: JSON.stringify({
                                message: "Homework reminder",
                                context: {
                                    userId: hw.patient_id,
                                    automated: true,
                                    type: 'homework_reminder',
                                    homeworkId: hw.id,
                                    homeworkTitle: hw.title,
                                    dueDate: hw.due_date
                                },
                                conversationId: null
                            })
                        });

                        if (response.ok) homeworkReminders++;
                    } catch (hwItemError: any) {
                        reportError(hwItemError, 'proactive-agent-cron:workflow:homework-reminders:item', {
                            homeworkId: hw.id, traceId, spanId
                        });
                    }
                }
            }
            const workflow3Duration = Date.now() - workflow3Start;
            reportInfo('Homework reminders sent', 'proactive-agent-cron:homework-reminders:complete', {
                count: homeworkReminders, duration: workflow3Duration, traceId
            });
        } catch (err: any) {
            reportError(err, 'proactive-agent-cron:workflow:homework-reminders', { traceId, spanId });
        }

        const totalDuration = Date.now() - startTime;
        reportInfo('Proactive agent cron completed', 'proactive-agent-cron:complete', {
            scheduledMessagesSent,
            wellnessChecksTriggered,
            homeworkReminders,
            totalDuration,
            traceId
        });

        return new Response(JSON.stringify({
            success: true,
            scheduledMessagesSent,
            wellnessChecksTriggered,
            homeworkReminders,
            duration: totalDuration,
            timestamp: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error: any) {
        await reportError(error, 'proactive-agent-cron', { traceId, spanId });
        return new Response(JSON.stringify({ error: error.message, traceId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});
