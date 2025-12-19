import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Razorpay from 'npm:razorpay@2.9.2';

const razorpay = new Razorpay({
    key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
    key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
});

serve(async (req) => {
    try {
        const { appointmentId, amount, currency, notes } = await req.json();

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: currency || 'INR',
            receipt: `apt_${appointmentId}`,
            notes: notes || {},
        });

        // Store order in database
        // (Database update logic usually goes here using service_role key)

        return new Response(JSON.stringify({ order }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
