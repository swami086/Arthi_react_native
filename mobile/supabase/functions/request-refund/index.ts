import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from 'npm:razorpay@2.9.2';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { traceId, spanId } = extractTraceContext(req);

    try {
        const { paymentId, amount, notes } = await req.json();

        const razorpay = new Razorpay({
            key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
            key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
        });

        // Request refund from Razorpay
        const refund = await razorpay.payments.refund(paymentId, {
            amount: amount ? Math.round(amount * 100) : undefined, // in paise
            notes: notes || {},
        });

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Update payment record
        const { error: dbError } = await supabase
            .from('payments')
            .update({
                status: 'refunded',
                refund_id: refund.id,
                updated_at: new Date().toISOString()
            })
            .eq('razorpay_payment_id', paymentId);

        if (dbError) throw dbError;

        reportInfo('Refund requested', 'request-refund', { refundId: refund.id }, traceId, spanId);

        return new Response(JSON.stringify({ success: true, refund }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        await reportError(error, 'request-refund', { trace_id: traceId }, traceId, spanId);
        return new Response(JSON.stringify({ error: error.message, trace_id: traceId }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
