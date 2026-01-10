import { NextResponse } from 'next/server';
import { getPaymentHistoryAction } from '@/app/actions/payment';
import { withApiErrorHandling } from '@/lib/api-error-handler';

export const GET = withApiErrorHandling(async () => {
    const result = await getPaymentHistoryAction();

    if (!result.success) {
        return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
});
