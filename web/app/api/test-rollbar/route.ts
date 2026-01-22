import { NextResponse } from 'next/server';
import { reportError } from '@/lib/rollbar';

export async function GET() {
  try {
    throw new Error('Verification: Server-side test error captured in Rollbar');
  } catch (error) {
    reportError(error, 'web-api:test-rollbar');
    return NextResponse.json({ error: (error as Error).message, captured: true }, { status: 500 });
  }
}
