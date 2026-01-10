import { NextResponse } from 'next/server';

export async function GET() {
  try {
    throw new Error('This is a test error from the API route');
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
