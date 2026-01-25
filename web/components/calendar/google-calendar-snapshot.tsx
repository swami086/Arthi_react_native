'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { calendarLocalizer } from '@/lib/calendar-localizer';
import { cn } from '@/lib/utils';
import { startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns';

export interface GoogleCalendarSnapshotProps {
  /** Initial date; week view shows the week containing this date. */
  date?: Date;
  /** Time range for fetching. Defaults to ±1 week around `date`. */
  timeMin?: string;
  timeMax?: string;
  className?: string;
  /** Max height for the calendar (default 380px for use in dialogs). */
  height?: number;
}

interface GCalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
  events?: GCalEvent[];
}

function toRbcEvent(e: GCalEvent) {
  return {
    id: e.id,
    title: e.title,
    start: new Date(e.start),
    end: new Date(e.end),
  };
}

export function GoogleCalendarSnapshot({
  date = new Date(),
  timeMin: timeMinProp,
  timeMax: timeMaxProp,
  className,
  height = 380,
}: GoogleCalendarSnapshotProps) {
  const [viewDate, setViewDate] = useState(date);
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);

  const weekStart = useMemo(
    () => startOfWeek(viewDate, { weekStartsOn: 0 }),
    [viewDate]
  );
  const weekEnd = useMemo(
    () => endOfWeek(viewDate, { weekStartsOn: 0 }),
    [viewDate]
  );

  const timeMin = timeMinProp ?? weekStart.toISOString();
  const timeMax = timeMaxProp ?? weekEnd.toISOString();

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      setLoading(true);
      setError(null);
      setNotConnected(false);
      try {
        const q = new URLSearchParams({ timeMin, timeMax });
        const res = await fetch(`/api/calendar/google-events?${q}`);
        const data = (await res.json()) as ApiResponse;

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error ?? 'Failed to load Google Calendar');
          setEvents([]);
          return;
        }

        if (data.error === 'Google Calendar not connected') {
          setNotConnected(true);
          setEvents([]);
          return;
        }

        setEvents(data.events ?? []);
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message ?? 'Failed to load calendar');
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [timeMin, timeMax]);

  const rbcEvents = useMemo(() => events.map(toRbcEvent), [events]);

  const messages = useMemo(
    () => ({
      today: 'Today',
      previous: 'Back',
      next: 'Next',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      agenda: 'Agenda',
      date: 'Date',
      time: 'Time',
      event: 'Event',
      noEventsInRange: 'No events in this range.',
      showMore: (n: number) => `+${n} more`,
    }),
    []
  );

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-border bg-muted/30',
          className
        )}
        style={{ minHeight: height }}
      >
        <p className="text-sm text-muted-foreground">Loading Google Calendar…</p>
      </div>
    );
  }

  if (notConnected) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 py-8',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">
          Connect Google Calendar to see your schedule here.
        </p>
        <p className="text-xs text-muted-foreground/80">
          Use Calendar Integrations above to connect.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-6',
          className
        )}
      >
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <h4 className="text-sm font-semibold text-foreground">
          Your Google Calendar
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewDate((d) => subWeeks(d, 1))}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Previous week"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date())}
            className="px-2 py-1 rounded text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setViewDate((d) => addWeeks(d, 1))}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label="Next week"
          >
            →
          </button>
        </div>
      </div>
      <div style={{ height }}>
        <Calendar
          localizer={calendarLocalizer}
          events={rbcEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          view={Views.WEEK}
          date={viewDate}
          onNavigate={(d) => setViewDate(d)}
          toolbar={false}
          messages={messages}
          culture="en-US"
          eventPropGetter={() => ({
            style: {
              borderRadius: 4,
              fontSize: '0.75rem',
              backgroundColor: 'hsl(210 100% 56% / 0.2)',
              borderLeft: '4px solid hsl(210 100% 56%)',
            },
          })}
          className={cn(
            'text-foreground',
            '[&_.rbc-header]:border-border [&_.rbc-header]:bg-muted/40 [&_.rbc-header]:py-1.5 [&_.rbc-header]:text-xs [&_.rbc-header]:font-medium [&_.rbc-header]:text-muted-foreground',
            '[&_.rbc-time-view]:border-border [&_.rbc-timeslot-group]:border-border [&_.rbc-day-slot]:min-h-[20px]',
            '[&_.rbc-time-gutter]:bg-muted/20 [&_.rbc-time-gutter]:text-xs [&_.rbc-time-gutter]:text-muted-foreground',
            '[&_.rbc-event]:cursor-default [&_.rbc-event]:px-1.5 [&_.rbc-event]:py-0.5 [&_.rbc-event]:overflow-hidden',
            '[&_.rbc-today]:bg-primary/5',
            '[&_.rbc-off-range-bg]:bg-muted/10',
            'dark:[&_.rbc-event]:bg-blue-500/20 dark:[&_.rbc-event]:border-l-blue-500'
          )}
        />
      </div>
    </div>
  );
}
