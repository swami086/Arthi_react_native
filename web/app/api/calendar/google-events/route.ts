import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/calendar/google-events
 * Fetches the authenticated therapist's Google Calendar events for a date range.
 * Query: timeMin (RFC3339), timeMax (RFC3339). Defaults to now → +7 days.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    let timeMin = searchParams.get('timeMin');
    let timeMax = searchParams.get('timeMax');

    const now = new Date();
    if (!timeMin) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      timeMin = start.toISOString();
    }
    if (!timeMax) {
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);
      timeMax = end.toISOString();
    }

    const { data: integration, error: intError } = await (supabase as any)
      .from('calendar_integrations')
      .select('id, access_token, refresh_token, therapist_id')
      .eq('therapist_id', user.id)
      .eq('provider', 'google')
      .eq('is_connected', true)
      .maybeSingle();

    if (intError) {
      console.error('Calendar integration fetch error:', intError);
      return NextResponse.json(
        { error: 'Failed to load calendar integration' },
        { status: 500 }
      );
    }

    if (!integration) {
      return NextResponse.json(
        { error: 'Google Calendar not connected', events: [] },
        { status: 200 }
      );
    }

    let accessToken = integration.access_token as string;
    const refreshToken = integration.refresh_token as string | null;

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!googleClientId || !googleClientSecret) {
      return NextResponse.json(
        { error: 'Google Calendar not configured' },
        { status: 500 }
      );
    }

    const url = new URL(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events'
    );
    url.searchParams.set('timeMin', timeMin);
    url.searchParams.set('timeMax', timeMax);
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '250');

    let res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401 && refreshToken) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: googleClientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (tokenRes.ok) {
        const tokens = await tokenRes.json();
        accessToken = tokens.access_token;

        await (supabase as any)
          .from('calendar_integrations')
          .update({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? refreshToken,
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id);

        res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error('Google Calendar API error:', res.status, errText);
      return NextResponse.json(
        { error: `Google Calendar API error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        summary?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        status?: string;
      }>;
    };

    const items = data.items ?? [];
    const events = items
      .filter((e) => e.start && e.end && e.status !== 'cancelled')
      .map((e) => {
        const start = e.start!.dateTime ?? e.start!.date!;
        const end = e.end!.dateTime ?? e.end!.date!;
        return {
          id: e.id,
          title: e.summary || 'No title',
          start: start,
          end: end,
        };
      });

    return NextResponse.json({ success: true, events });
  } catch (e) {
    console.error('google-events error:', e);
    return NextResponse.json(
      { error: (e as Error).message || 'Failed to fetch Google Calendar events' },
      { status: 500 }
    );
  }
}
