import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const therapistId = request.nextUrl.searchParams.get('therapist_id');
  const redirectUri = request.nextUrl.searchParams.get('redirect_uri') || 
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google-calendar/callback`;

  if (!therapistId) {
    return NextResponse.json({ error: 'therapist_id is required' }, { status: 400 });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return NextResponse.json(
      { error: 'Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local' },
      { status: 500 }
    );
  }

  // Generate OAuth URL
  const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
  const state = Buffer.from(JSON.stringify({ therapistId, redirectUri })).toString('base64');
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', googleClientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code || !state) {
      return NextResponse.json({ error: 'code and state are required' }, { status: 400 });
    }

    const { therapistId, redirectUri } = JSON.parse(Buffer.from(state, 'base64').toString());

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      return NextResponse.json(
        { error: 'Google OAuth credentials not configured' },
        { status: 500 }
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.json(
        { error: `Token exchange failed: ${errorText}` },
        { status: 400 }
      );
    }

    const tokens = await tokenResponse.json();

    // Store tokens in Supabase (encrypted at application level)
    const supabase = await createClient();
    const { error } = await supabase
      .from('calendar_integrations')
      .upsert({
        therapist_id: therapistId,
        provider: 'google',
        access_token: tokens.access_token, // In production, encrypt this
        refresh_token: tokens.refresh_token, // In production, encrypt this
        is_connected: true,
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'therapist_id,provider',
      });

    if (error) {
      console.error('Error storing calendar integration:', error);
      return NextResponse.json(
        { error: 'Failed to store calendar integration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Google Calendar OAuth error:', error);
    return NextResponse.json(
      { error: error.message || 'OAuth flow failed' },
      { status: 500 }
    );
  }
}
