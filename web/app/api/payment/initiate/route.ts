import { NextRequest, NextResponse } from 'next/server';
import { initiatePayment } from '@/app/actions/payment';
import { withApiErrorHandling } from '@/lib/api-error-handler';

export const POST = withApiErrorHandling(async (request: NextRequest) => {
    const body = await request.json();
    const { appointmentId, amount } = body;

    if (!appointmentId) {
        return NextResponse.json(
            { success: false, error: 'Appointment ID is required' },
            { status: 400 }
        );
    }

    const result = await initiatePayment(appointmentId, amount);

    if (!result.success) {
        return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
});
