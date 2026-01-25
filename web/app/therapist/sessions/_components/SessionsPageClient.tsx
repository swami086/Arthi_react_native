'use client';

import { useState } from 'react';
import { CalendarDays, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { SessionCard } from './SessionCard';
import { AppointmentsCalendarView } from '@/components/appointments/appointments-calendar-view';

interface SessionsPageClientProps {
  appointments: any[];
  upcoming: any[];
  past: any[];
}

export default function SessionsPageClient({
  appointments,
  upcoming,
  past,
}: SessionsPageClientProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Sessions</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your upcoming appointments and history.
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-1 bg-muted/50">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <AppointmentsCalendarView
          appointments={appointments ?? []}
          variant="therapist"
          className="mt-2"
        />
      ) : (
        <>
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Upcoming Sessions
            </h2>
            {upcoming.length === 0 ? (
              <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-slate-500">
                  <Calendar className="w-10 h-10 mb-4 opacity-50" />
                  <p>No upcoming sessions scheduled.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcoming.map((session: any) => (
                  <SessionCard key={session.id} session={session} isUpcoming />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Past Sessions
            </h2>
            {past.length === 0 ? (
              <p className="text-slate-500">No session history yet.</p>
            ) : (
              <div className="grid gap-4">
                {past.map((session: any) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
