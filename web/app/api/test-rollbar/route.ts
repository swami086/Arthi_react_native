import { NextResponse } from 'next/server';
import { reportServerError } from '@/lib/rollbar-server';

export async function GET() {
  try {
    throw new Error('Verification: Server-side test error captured in Rollbar');
  } catch (error) {
    reportServerError(error, 'web-api:test-rollbar');
    return NextResponse.json({ error: (error as Error).message, captured: true }, { status: 500 });
  }
}
