import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER')!;

serve(async (req) => {
    const { traceId, spanId } = extractTraceContext(req);
    try {
        const { phoneNumber, messageType, templateData } = await req.json();

        // Build message based on template
        let message = '';
        switch (messageType) {
            case 'confirmation':
                message = `✅ Your therapy session with ${templateData.mentorName} is confirmed!\n\n📅 Date: ${templateData.date}\n⏰ Time: ${templateData.time}\n🔗 Join: ${templateData.meetingLink}\n\nSee you soon! 🌟`;
                break;
            case 'reminder':
                message = `⏰ Reminder: Your session with ${templateData.mentorName} is in 24 hours!\n\n📅 ${templateData.date} at ${templateData.time}\n\nDon't forget to join on time! 💙`;
                break;
            case 'cancellation':
                message = `❌ Your session has been cancelled.\nReason: ${templateData.reason}\n\nPlease visit the app for more details.`;
                break;
            case 'booking_link':
                message = `📅 Ready for your next session?\nBook here: ${templateData.link}`;
                break;
        }

        // Send via Twilio WhatsApp API
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
                },
                body: new URLSearchParams({
                    From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
                    To: `whatsapp:${phoneNumber}`,
                    Body: message,
                }),
            }
        );

        const result = await response.json();

        // Store in database
        // (Database update logic usually goes here)

        // (Database update logic usually goes here)

        reportInfo('WhatsApp message sent', 'send-whatsapp-message', {
            messageType,
            phoneNumber: phoneNumber.slice(-4),
            trace_id: traceId,
            span_id: spanId
        });

        return new Response(JSON.stringify({ success: true, messageId: result.sid }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        await reportError(error, 'send-whatsapp-message', {
            trace_id: traceId,
            span_id: spanId
        });
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
