import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { corsHeaders } from '../_shared/cors.ts';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER')!;

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { traceId, spanId } = extractTraceContext(req);

    try {
        const body = await req.json().catch(() => ({}));
        const {
            phoneNumber,
            messageType,
            templateData,
            scheduledFor,
            templateName,
            templateParams,
            message: directMessage
        } = body;

        // Validation
        if (!phoneNumber) {
            throw new Error('Missing required field: phoneNumber');
        }
        if (!messageType && !templateName && !directMessage) {
            throw new Error('Must provide one of: messageType, templateName, or message');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceKey = Deno.env.get('SERVICE_ROLE_KEY')!;

        if (!supabaseUrl || !serviceKey) {
            throw new Error('Server configuration error: Missing Supabase credentials');
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceKey);

        // Build legacy message content if needed
        let legacyMessageContent = '';
        if (messageType) {
            switch (messageType) {
                case 'confirmation':
                    legacyMessageContent = `✅ Your therapy session with ${templateData.therapistName} is confirmed!\n\n📅 Date: ${templateData.date}\n⏰ Time: ${templateData.time}\n🔗 Join: ${templateData.meetingLink}\n\nSee you soon! 🌟`;
                    break;
                case 'reminder':
                    legacyMessageContent = `⏰ Reminder: Your session with ${templateData.therapistName} is in 24 hours!\n\n📅 ${templateData.date} at ${templateData.time}\n\nDon't forget to join on time! 💙`;
                    break;
                case 'cancellation':
                    legacyMessageContent = `❌ Your session has been cancelled.\nReason: ${templateData.reason}\n\nPlease visit the app for more details.`;
                    break;
                case 'booking_link':
                    legacyMessageContent = `📅 Ready for your next session?\nBook here: ${templateData.link}`;
                    break;
            }
        }

        const finalMessageText = directMessage || legacyMessageContent;

        // 2. Implement Scheduled Message Storage Logic
        if (scheduledFor) {
            const scheduleDate = new Date(scheduledFor);
            const now = new Date();

            if (isNaN(scheduleDate.getTime())) {
                throw new Error('Invalid scheduledFor timestamp');
            }

            if (scheduleDate > now) {
                const { data: insertedRecord, error: insertError } = await supabaseAdmin
                    .from('scheduled_messages')
                    .insert({
                        to: phoneNumber,
                        message: finalMessageText || `(Template: ${templateName})`, // Ensure not null as per schema
                        template_name: templateName || null,
                        template_params: templateParams || null,
                        scheduled_for: scheduledFor,
                        channel: 'whatsapp',
                        status: 'pending'
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                reportInfo('Message scheduled', 'send-whatsapp-message', {
                    scheduledFor,
                    to: phoneNumber.slice(-4),
                    templateName,
                    traceId,
                    spanId
                });

                return new Response(JSON.stringify({
                    success: true,
                    scheduled: true,
                    messageId: insertedRecord.id
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // 3. Add Twilio ContentSid Template Support / Immediate Send
        const apiBody = new URLSearchParams();
        apiBody.append('From', `whatsapp:${TWILIO_WHATSAPP_NUMBER}`);
        apiBody.append('To', `whatsapp:${phoneNumber}`);

        if (templateName) {
            // Path A: ContentSid
            apiBody.append('ContentSid', templateName);
            if (templateParams) {
                apiBody.append('ContentVariables', JSON.stringify(templateParams));
            }
        } else {
            // Path B & C: Legacy or Direct
            if (!finalMessageText) {
                throw new Error('Validation Error: No message content provided for immediate send');
            }
            apiBody.append('Body', finalMessageText);
        }

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
                },
                body: apiBody,
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Twilio API Error: ${result.message || response.statusText} (Code: ${result.code})`);
        }

        // 4. Implement WhatsApp Logs Database Insertion
        // We log what we tried to send.
        const { error: logError } = await supabaseAdmin.from('whatsapp_messages').insert({
            to: phoneNumber,
            message: finalMessageText || `(Template: ${templateName})`,
            template_name: templateName,
            twilio_sid: result.sid,
            status: result.status,
            sent_at: new Date().toISOString()
        });

        if (logError) {
            // We report this internal error but don't fail the request since the message was sent
            await reportError(new Error(`Log insertion failed: ${logError.message}`), 'send-whatsapp-message', {
                trace_id: traceId,
                span_id: spanId
            });
        }

        // 5. Update Response and Error Handling
        reportInfo('WhatsApp message sent', 'send-whatsapp-message', {
            messageType: messageType || (templateName ? 'template' : 'direct'),
            templateName,
            phoneNumber: phoneNumber.slice(-4),
            channel: 'whatsapp',
            scheduled: false,
            twilioSid: result.sid,
            traceId,
            spanId,
            messageLength: finalMessageText?.length || 0,
            isScheduled: !!scheduledFor,
            templateUsed: !!templateName
        });

        return new Response(JSON.stringify({
            success: true,
            messageId: result.sid,
            scheduled: false
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        await reportError(error, 'send-whatsapp-message', {
            trace_id: traceId,
            span_id: spanId
        });

        return new Response(JSON.stringify({
            error: error.message,
            traceId
        }), {
            status: 400, // Returning 400 for bad requests/failures as per common practice, though 500 is also valid.
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
