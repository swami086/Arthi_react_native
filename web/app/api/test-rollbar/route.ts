import { NextResponse } from 'next/server';
import rollbar from '@/lib/rollbar';

export async function GET() {
    try {
        // Manually log an error
        rollbar.error('SafeSpace Rollbar Testing: Server-side manual error');

        // Simulate an uncaught error
        throw new Error('SafeSpace Rollbar Testing: Simulated uncaught runtime error');
    } catch (error) {
        if (error instanceof Error) {
            rollbar.error(error);
            return NextResponse.json({
                status: 'Error captured',
                message: error.message
            }, { status: 500 });
        }
        return NextResponse.json({ status: 'Unknown error' }, { status: 500 });
    }
}
