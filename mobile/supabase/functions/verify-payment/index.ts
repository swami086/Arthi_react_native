import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import { reportError, reportInfo, extractTraceContext } from '../_shared/rollbar.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const { traceId, spanId } = extractTraceContext(req);

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = await req.json();

        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            throw new Error('Invalid signature');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // Update payment status
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .update({
                status: 'success',
                razorpay_payment_id,
                updated_at: new Date().toISOString()
            })
            .eq('razorpay_order_id', razorpay_order_id)
            .select()
            .single();

        if (paymentError) throw paymentError;

        // Update appointment status if needed
        if (appointmentId) {
            await supabase
                .from('appointments')
                .update({ status: 'confirmed' })
                .eq('id', appointmentId);
        }

        reportInfo('Payment verified successfully', 'verify-payment', { razorpay_order_id }, traceId, spanId);

        return new Response(JSON.stringify({ success: true, payment }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        await reportError(error, 'verify-payment', { trace_id: traceId }, traceId, spanId);
        return new Response(JSON.stringify({ error: error.message, trace_id: traceId }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
