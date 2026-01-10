import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentFailure } from '@/app/actions/payment';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { paymentId, reason } = body;

        if (!paymentId || !reason) {
            return NextResponse.json(
                { success: false, error: 'Payment ID and reason are required' },
                { status: 400 }
            );
        }

        const result = await handlePaymentFailure(paymentId, reason);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
