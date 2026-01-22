import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapist/copilot?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapist/copilot?error=missing_code_or_state`
    );
  }

  try {
    const { therapistId } = JSON.parse(Buffer.from(state, 'base64').toString());

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!googleClientId || !googleClientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapist/copilot?error=oauth_not_configured`
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google-calendar/callback`;

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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapist/copilot?error=${encodeURIComponent(errorText)}`
      );
    }

    const tokens = await tokenResponse.json();

    // Store tokens in Supabase
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapist/copilot?error=storage_failed`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapist/copilot?calendar=google&success=true`
    );
  } catch (error: any) {
    console.error('Google Calendar OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/therapist/copilot?error=${encodeURIComponent(error.message)}`
    );
  }
}
