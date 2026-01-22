// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { reportError, reportInfo } from '../rollbar.ts';

export interface TimeSlot {
  start: Date;
  end: Date;
  confidence?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isBusy: boolean;
  source: 'google' | 'outlook' | 'internal';
}

export class CalendarService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async getIntegrations(therapistId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('calendar_integrations')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('is_connected', true);

    if (error) {
      reportError(error, 'CalendarService.getIntegrations', { therapistId });
      throw error;
    }

    return data || [];
  }

  async syncTherapistCalendars(therapistId: string): Promise<void> {
    const integrations = await this.getIntegrations(therapistId);

    for (const integration of integrations) {
      if (!integration.is_connected) continue;

      try {
        reportInfo(`Syncing ${integration.provider} calendar for therapist ${therapistId}`, 'calendar:sync');
        
        const events = integration.provider === 'google'
          ? await this.syncGoogleCalendar(integration)
          : await this.syncOutlookCalendar(integration);

        // Cache events for 24 hours
        await this.cacheEvents(therapistId, events, integration.provider);

        // Update last_synced_at
        await this.supabase
          .from('calendar_integrations')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', integration.id);

      } catch (error) {
        reportError(error, 'CalendarService.syncTherapistCalendars', {
          therapistId,
          provider: integration.provider,
        });
        // Continue with other calendars
      }
    }
  }

  async syncGoogleCalendar(integration: any): Promise<CalendarEvent[]> {
    let accessToken = integration.access_token;
    
    // Refresh token if needed (check if token is expired or about to expire)
    try {
      accessToken = await this.refreshGoogleToken(integration);
    } catch (error) {
      reportError(error, 'CalendarService.syncGoogleCalendar.tokenRefresh', {
        therapistId: integration.therapist_id,
      });
      // Continue with existing token, will fail if expired
    }

    // Fetch events from Google Calendar API v3
    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 30); // Sync next 30 days

    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('timeMin', timeMin.toISOString());
    url.searchParams.set('timeMax', timeMax.toISOString());
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '250');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try refresh
        try {
          accessToken = await this.refreshGoogleToken(integration);
          // Retry with new token
          const retryResponse = await fetch(url.toString(), {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            throw new Error(`Google Calendar API error: ${retryResponse.status} ${errorText}`);
          }
          const retryData = await retryResponse.json();
          return this.parseGoogleEvents(retryData.items || []);
        } catch (refreshError) {
          reportError(refreshError, 'CalendarService.syncGoogleCalendar.refreshRetry', {
            therapistId: integration.therapist_id,
          });
          throw new Error('Failed to refresh Google Calendar token');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Google Calendar API error: ${response.status} ${errorText}`);
      }
    }

    const data = await response.json();
    return this.parseGoogleEvents(data.items || []);
  }

  async refreshGoogleToken(integration: any): Promise<string> {
    if (!integration.refresh_token) {
      throw new Error('No refresh token available');
    }

    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        refresh_token: integration.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const tokens = await response.json();

    // Update stored tokens
    await this.supabase
      .from('calendar_integrations')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || integration.refresh_token, // Keep old if not provided
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    return tokens.access_token;
  }

  parseGoogleEvents(items: any[]): CalendarEvent[] {
    return items
      .filter(item => item.start && item.end)
      .map(item => ({
        id: item.id,
        title: item.summary || 'No Title',
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        isBusy: item.transparency !== 'transparent' && item.status !== 'cancelled',
        source: 'google' as const,
      }));
  }

  async syncOutlookCalendar(integration: any): Promise<CalendarEvent[]> {
    let accessToken = integration.access_token;
    
    // Refresh token if needed
    try {
      accessToken = await this.refreshOutlookToken(integration);
    } catch (error) {
      reportError(error, 'CalendarService.syncOutlookCalendar.tokenRefresh', {
        therapistId: integration.therapist_id,
      });
      // Continue with existing token
    }

    // Fetch events from Microsoft Graph API
    const startDateTime = new Date();
    startDateTime.setHours(0, 0, 0, 0);
    const endDateTime = new Date();
    endDateTime.setDate(endDateTime.getDate() + 30); // Sync next 30 days

    const url = new URL('https://graph.microsoft.com/v1.0/me/calendarview');
    url.searchParams.set('startDateTime', startDateTime.toISOString());
    url.searchParams.set('endDateTime', endDateTime.toISOString());
    url.searchParams.set('$orderby', 'start/dateTime');
    url.searchParams.set('$top', '250');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try refresh
        try {
          accessToken = await this.refreshOutlookToken(integration);
          // Retry with new token
          const retryResponse = await fetch(url.toString(), {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            throw new Error(`Microsoft Graph API error: ${retryResponse.status} ${errorText}`);
          }
          const retryData = await retryResponse.json();
          return this.parseOutlookEvents(retryData.value || []);
        } catch (refreshError) {
          reportError(refreshError, 'CalendarService.syncOutlookCalendar.refreshRetry', {
            therapistId: integration.therapist_id,
          });
          throw new Error('Failed to refresh Outlook token');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Microsoft Graph API error: ${response.status} ${errorText}`);
      }
    }

    const data = await response.json();
    return this.parseOutlookEvents(data.value || []);
  }

  async refreshOutlookToken(integration: any): Promise<string> {
    if (!integration.refresh_token) {
      throw new Error('No refresh token available');
    }

    const microsoftClientId = Deno.env.get('MICROSOFT_CLIENT_ID');
    const microsoftClientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');

    if (!microsoftClientId || !microsoftClientSecret) {
      throw new Error('Microsoft OAuth credentials not configured');
    }

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: microsoftClientId,
        client_secret: microsoftClientSecret,
        refresh_token: integration.refresh_token,
        grant_type: 'refresh_token',
        scope: 'Calendars.Read',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const tokens = await response.json();

    // Update stored tokens
    await this.supabase
      .from('calendar_integrations')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || integration.refresh_token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    return tokens.access_token;
  }

  parseOutlookEvents(items: any[]): CalendarEvent[] {
    return items
      .filter(item => item.start && item.end)
      .map(item => ({
        id: item.id,
        title: item.subject || 'No Title',
        start: new Date(item.start.dateTime),
        end: new Date(item.end.dateTime),
        isBusy: item.showAs !== 'free' && item.isCancelled !== true,
        source: 'outlook' as const,
      }));
  }

  async cacheEvents(
    therapistId: string,
    events: CalendarEvent[],
    source: 'google' | 'outlook' | 'internal'
  ): Promise<void> {
    // Delete old cached events for this therapist and source
    await this.supabase
      .from('calendar_events_cache')
      .delete()
      .eq('therapist_id', therapistId)
      .eq('source', source);

    // Insert new events
    if (events.length > 0) {
      const eventsToInsert = events.map(event => ({
        therapist_id: therapistId,
        external_event_id: event.id,
        title: event.title,
        start_time: event.start.toISOString(),
        end_time: event.end.toISOString(),
        is_busy: event.isBusy,
        source: source,
        synced_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }));

      const { error } = await this.supabase
        .from('calendar_events_cache')
        .insert(eventsToInsert);

      if (error) {
        reportError(error, 'CalendarService.cacheEvents', { therapistId, source });
        throw error;
      }
    }
  }

  async getCachedEvents(
    therapistId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<CalendarEvent[]> {
    const { data, error } = await this.supabase
      .from('calendar_events_cache')
      .select('*')
      .eq('therapist_id', therapistId)
      .gte('end_time', dateRange.start.toISOString())
      .lte('start_time', dateRange.end.toISOString())
      .gt('expires_at', new Date().toISOString());

    if (error) {
      reportError(error, 'CalendarService.getCachedEvents', { therapistId });
      throw error;
    }

    return (data || []).map((event: any) => ({
      id: event.external_event_id || event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      isBusy: event.is_busy,
      source: event.source,
    }));
  }

  async checkAvailability(
    therapistId: string,
    dateRange: { start: Date; end: Date },
    duration: number
  ): Promise<TimeSlot[]> {
    // Get cached events
    const events = await this.getCachedEvents(therapistId, dateRange);

    // Get therapist preferences
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('calendar_preferences')
      .eq('user_id', therapistId)
      .single();

    const preferences = profile?.calendar_preferences || {
      working_hours: { start: '09:00', end: '17:00' },
      buffer_minutes: 15,
    };

    // Find free slots
    const freeSlots = this.findFreeSlots(events, dateRange, duration, preferences);

    return freeSlots;
  }

  findFreeSlots(
    events: CalendarEvent[],
    dateRange: { start: Date; end: Date },
    duration: number,
    preferences: any
  ): TimeSlot[] {
    const freeSlots: TimeSlot[] = [];
    const bufferMinutes = preferences.buffer_minutes || 15;
    const workingHours = preferences.working_hours || { start: '09:00', end: '17:00' };

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Clamp date range to working hours boundaries
    const rangeStart = new Date(Math.max(dateRange.start.getTime(), dateRange.start.getTime()));
    const rangeEnd = new Date(Math.min(dateRange.end.getTime(), dateRange.end.getTime()));

    let currentTime = new Date(rangeStart);
    currentTime.setHours(0, 0, 0, 0);

    // Process each day in the range
    while (currentTime < rangeEnd) {
      const dayStart = new Date(currentTime);
      const [startHour, startMin] = workingHours.start.split(':').map(Number);
      dayStart.setHours(startHour, startMin, 0, 0);

      // Clamp dayStart to rangeStart if on first day
      if (dayStart < rangeStart) {
        dayStart.setTime(rangeStart.getTime());
      }

      const dayEnd = new Date(currentTime);
      const [endHour, endMin] = workingHours.end.split(':').map(Number);
      dayEnd.setHours(endHour, endMin, 0, 0);

      // Clamp dayEnd to rangeEnd if on last day
      if (dayEnd > rangeEnd) {
        dayEnd.setTime(rangeEnd.getTime());
      }

      // Find events that overlap with this day (event.end > dayStart AND event.start < dayEnd)
      const dayEvents = sortedEvents.filter(
        e => e.end > dayStart && e.start < dayEnd
      );

      // Find gaps between events
      let slotStart = new Date(Math.max(dayStart.getTime(), rangeStart.getTime()));
      
      for (const event of dayEvents) {
        // Ensure event times are within the day bounds
        const eventStart = new Date(Math.max(event.start.getTime(), dayStart.getTime()));
        const eventEnd = new Date(Math.min(event.end.getTime(), dayEnd.getTime()));

        // Only process if there's a gap before this event
        if (eventStart > slotStart) {
          const gapStart = new Date(slotStart);
          const gapEnd = new Date(eventStart);
          const gapDuration = (gapEnd.getTime() - gapStart.getTime()) / (1000 * 60); // minutes

          if (gapDuration >= duration + bufferMinutes) {
            const slotEnd = new Date(gapStart.getTime() + duration * 60 * 1000);
            // Ensure slot doesn't exceed dayEnd or rangeEnd
            const clampedSlotEnd = new Date(Math.min(slotEnd.getTime(), dayEnd.getTime(), rangeEnd.getTime()));
            if (clampedSlotEnd > gapStart) {
              freeSlots.push({
                start: gapStart,
                end: clampedSlotEnd,
                confidence: 1.0,
              });
            }
          }
        }

        // Move slotStart to after this event (with buffer)
        slotStart = new Date(Math.max(slotStart.getTime(), eventEnd.getTime() + bufferMinutes * 60 * 1000));
      }

      // Check gap after last event (or from start if no events)
      const finalGapStart = new Date(slotStart);
      const finalGapEnd = new Date(Math.min(dayEnd.getTime(), rangeEnd.getTime()));
      
      if (finalGapEnd > finalGapStart) {
        const finalGapDuration = (finalGapEnd.getTime() - finalGapStart.getTime()) / (1000 * 60);

        if (finalGapDuration >= duration + bufferMinutes) {
          const slotEnd = new Date(finalGapStart.getTime() + duration * 60 * 1000);
          const clampedSlotEnd = new Date(Math.min(slotEnd.getTime(), finalGapEnd.getTime()));
          if (clampedSlotEnd > finalGapStart) {
            freeSlots.push({
              start: finalGapStart,
              end: clampedSlotEnd,
              confidence: 1.0,
            });
          }
        }
      }

      // Move to next day
      currentTime.setDate(currentTime.getDate() + 1);
      currentTime.setHours(0, 0, 0, 0);
    }

    return freeSlots;
  }

  async disconnectCalendar(therapistId: string, provider: string): Promise<void> {
    // Mark as disconnected (don't delete tokens)
    const { error } = await this.supabase
      .from('calendar_integrations')
      .update({ is_connected: false })
      .eq('therapist_id', therapistId)
      .eq('provider', provider);

    if (error) {
      reportError(error, 'CalendarService.disconnectCalendar', { therapistId, provider });
      throw error;
    }

    // Clear cached events
    await this.supabase
      .from('calendar_events_cache')
      .delete()
      .eq('therapist_id', therapistId)
      .eq('source', provider);
  }

  async getTeamCalendars(
    therapistId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<Record<string, CalendarEvent[]>> {
    // Get practice_id for the therapist
    const { data: therapistProfile } = await this.supabase
      .from('profiles')
      .select('practice_id')
      .eq('user_id', therapistId)
      .single();

    if (!therapistProfile?.practice_id) {
      return {};
    }

    // Get all therapists in the same practice
    const { data: teamTherapists } = await this.supabase
      .from('profiles')
      .select('user_id, full_name, calendar_visibility')
      .eq('practice_id', therapistProfile.practice_id)
      .eq('role', 'therapist')
      .eq('calendar_visibility->>visible_to_practice', 'true');

    const teamCalendars: Record<string, CalendarEvent[]> = {};

    for (const therapist of teamTherapists || []) {
      const events = await this.getCachedEvents(therapist.user_id, dateRange);
      
      // Filter to show only busy/free if show_busy_only is true
      const showBusyOnly = therapist.calendar_visibility?.show_busy_only !== false;
      const filteredEvents = showBusyOnly
        ? events.filter(e => e.isBusy)
        : events;

      teamCalendars[therapist.user_id] = filteredEvents;
    }

    return teamCalendars;
  }
}
