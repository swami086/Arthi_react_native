import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Razorpay from 'npm:razorpay@2.9.2';
import { reportError, reportInfo } from '../_shared/rollbar.ts';


serve(async (req) => {
    // Variables for error context
    let appointmentIdVal: string | undefined;
    let amountVal: number | undefined;

    try {
        const { appointmentId, amount, currency, notes } = await req.json();
        appointmentIdVal = appointmentId;

        // Validate amount
        if (!amount || isNaN(amount)) {
            throw new Error("Invalid or missing amount: " + amount);
        }
        amountVal = Number(amount);

        // Check for missing keys
        if (!Deno.env.get('RAZORPAY_KEY_ID') || !Deno.env.get('RAZORPAY_KEY_SECRET')) {
            throw new Error("Missing Razorpay credentials");
        }

        const razorpay = new Razorpay({
            key_id: Deno.env.get('RAZORPAY_KEY_ID') ?? '',
            key_secret: Deno.env.get('RAZORPAY_KEY_SECRET') ?? '',
        });

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(amountVal * 100), // Convert to paise, ensure integer
            currency: currency || 'INR',
            receipt: `apt_${appointmentId}`,
            notes: notes || {},
        });

        // Store order in database
        // (Database update logic usually goes here using service_role key)

        reportInfo('Payment order created', 'create-payment-order', { orderId: order.id });

        return new Response(JSON.stringify({ order }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        await reportError(error, 'create-payment-order', { appointmentId: appointmentIdVal, amount: amountVal });

        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
