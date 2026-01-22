import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const therapistId = request.nextUrl.searchParams.get('therapist_id');
  const redirectUri = request.nextUrl.searchParams.get('redirect_uri') || 
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/outlook-calendar/callback`;

  if (!therapistId) {
    return NextResponse.json({ error: 'therapist_id is required' }, { status: 400 });
  }

  const microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
  const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!microsoftClientId || !microsoftClientSecret) {
    return NextResponse.json(
      { error: 'Microsoft OAuth credentials not configured. Please set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in .env.local' },
      { status: 500 }
    );
  }

  // Generate OAuth URL for Microsoft Graph
  const scopes = ['Calendars.Read'];
  const state = Buffer.from(JSON.stringify({ therapistId, redirectUri })).toString('base64');
  
  const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  authUrl.searchParams.set('client_id', microsoftClientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('response_mode', 'query');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
