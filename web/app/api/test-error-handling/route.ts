import { NextRequest, NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/api-error-handler';

export const GET = withApiErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'error') {
        throw new Error('Test API Error');
    }

    if (type === 'redirect') {
        throw new Error('NEXT_REDIRECT'); // Simulate redirect error
    }

    return NextResponse.json({ success: true, message: 'Test API Success' });
});
