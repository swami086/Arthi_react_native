'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { calendarLocalizer } from '@/lib/calendar-localizer';
import { cn } from '@/lib/utils';

export type CalendarVariant = 'patient' | 'therapist';

export interface AppointmentsCalendarViewProps {
  appointments: any[];
  variant: CalendarVariant;
  className?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: { appointment: any; variant: CalendarVariant };
}

function appointmentToEvent(a: any, variant: CalendarVariant): CalendarEvent {
  const start = new Date(a.start_time);
  const end = new Date(a.end_time);
  const title =
    variant === 'patient'
      ? a.therapist?.full_name ?? 'Session'
      : a.patient?.full_name ?? 'Session';
  return {
    id: a.id,
    title,
    start,
    end,
    resource: { appointment: a, variant },
  };
}

function eventPropGetter(event: CalendarEvent) {
  const status = event.resource.appointment?.status;
  const cancelled = status === 'cancelled';
  const base = {
    style: {
      borderRadius: '6px',
      fontSize: '0.8125rem',
    },
  };
  if (cancelled) {
    return {
      ...base,
      style: {
        ...base.style,
        opacity: 0.5,
        textDecoration: 'line-through',
        backgroundColor: 'hsl(var(--muted))',
      },
    };
  }
  if (status === 'confirmed') {
    return {
      ...base,
      style: {
        ...base.style,
        backgroundColor: 'hsl(var(--primary) / 0.15)',
        borderLeft: '4px solid hsl(var(--primary))',
      },
    };
  }
  if (status === 'pending') {
    return {
      ...base,
      style: {
        ...base.style,
        backgroundColor: 'hsl(38 92% 50% / 0.2)',
        borderLeft: '4px solid hsl(38 92% 50%)',
      },
    };
  }
  return base;
}

export function AppointmentsCalendarView({
  appointments,
  variant,
  className,
}: AppointmentsCalendarViewProps) {
  const router = useRouter();

  const events = useMemo<CalendarEvent[]>(() => {
    return (appointments ?? [])
      .filter((a: any) => a.start_time && a.end_time)
      .map((a: any) => appointmentToEvent(a, variant));
  }, [appointments, variant]);

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      const { appointment, variant: v } = event.resource;
      if (appointment?.status === 'cancelled') return;
      if (v === 'patient') {
        router.push(`/video/${appointment.id}/waiting`);
      } else {
        router.push(`/therapist/sessions/${appointment.id}`);
      }
    },
    [router]
  );

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
      noEventsInRange: 'No sessions in this range.',
      showMore: (n: number) => `+${n} more`,
    }),
    []
  );

  return (
    <div className={cn('h-[600px] min-h-[400px]', className)}>
      <Calendar
        localizer={calendarLocalizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.WEEK}
        popup
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        messages={messages}
        culture="en-US"
        className={cn(
          'rounded-lg border border-border bg-card text-foreground',
          '[&_.rbc-toolbar]:flex [&_.rbc-toolbar]:flex-wrap [&_.rbc-toolbar]:gap-2 [&_.rbc-toolbar]:mb-4',
          '[&_.rbc-toolbarbutton]:rounded-md [&_.rbc-toolbarbutton]:px-3 [&_.rbc-toolbarbutton]:py-1.5 [&_.rbc-toolbarbutton]:text-sm [&_.rbc-toolbarbutton]:font-medium',
          '[&_.rbc-toolbarbutton:not(.rbc-active)]:bg-muted [&_.rbc-toolbarbutton:not(.rbc-active)]:text-muted-foreground [&_.rbc-toolbarbutton.rbc-active]:bg-primary [&_.rbc-toolbarbutton.rbc-active]:text-primary-foreground',
          '[&_.rbc-header]:border-border [&_.rbc-header]:py-2 [&_.rbc-header]:text-muted-foreground [&_.rbc-header]:text-sm',
          '[&_.rbc-month-view]:border-border [&_.rbc-time-view]:border-border [&_.rbc-agenda-view]:border-border',
          '[&_.rbc-day-bg]:border-border [&_.rbc-timeslot-group]:border-border [&_.rbc-off-range-bg]:bg-muted/30',
          '[&_.rbc-event]:cursor-pointer [&_.rbc-event]:px-2 [&_.rbc-event]:py-1',
          '[&_.rbc-today]:bg-primary/5',
          'dark:[&_.rbc-off-range-bg]:bg-muted/20'
        )}
      />
    </div>
  );
}
