import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentSuccess } from '@/app/actions/payment';
import { withApiErrorHandling } from '@/lib/api-error-handler';

export const POST = withApiErrorHandling(async (request: NextRequest) => {
    const body = await request.json();
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!paymentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(
            { success: false, error: 'Missing required payment verification parameters' },
            { status: 400 }
        );
    }

    const result = await handlePaymentSuccess(
        paymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    );

    if (!result.success) {
        return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
});
