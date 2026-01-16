import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: unknown;
}

export function TimeView() {
    const { notes } = useNotes();
    const { setSelectedNoteId, setActiveView } = useView();

    const events = useMemo(() => {
        const evts: CalendarEvent[] = [];

        notes.forEach(note => {
            const props = note.properties;
            if (!props || props.length === 0) return;

            // Helper to get date value from keys
            const getDate = (keys: string[]) => {
                for (const key of keys) {
                    const prop = props.find(p => p.key.toLowerCase() === key.toLowerCase());
                    if (prop && prop.values[0]) {
                        const val = prop.values[0];
                        // Try parsing simple dates
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) return d;
                    }
                }
                return null;
            };

            const start = getDate(['startDateTime', 'startDate', 'start', 'startTime', 'date', 'time', 'datetime', 'begin']);
            const end = getDate(['endDateTime', 'endDate', 'end', 'endTime', 'deadline', 'dueDate', 'finish']);

            if (start) {
                // If we have start and end, use them.
                // If only start, default to 1 hour duration.
                evts.push({
                    id: note.id,
                    title: note.title || 'Untitled',
                    start: start,
                    end: end || new Date(start.getTime() + 60 * 60 * 1000),
                    allDay: false
                });
            } else if (end) {
                // Only deadline/due date, show as point event (or 1 hour ending at time?)
                // Let's show as 1 hour ending at time to be visible
                 evts.push({
                    id: note.id,
                    title: note.title || 'Untitled',
                    start: new Date(end.getTime() - 60 * 60 * 1000),
                    end: end,
                    allDay: false
                });
            }
        });

        return evts;
    }, [notes]);

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedNoteId(event.id);
        setActiveView('notes');
    };

    return (
        <div className="h-full bg-gray-900 p-4 flex flex-col overflow-hidden">
            <style>{`
                .rbc-calendar { color: #e5e7eb; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
                .rbc-toolbar button { color: #e5e7eb; border-color: #374151; }
                .rbc-toolbar button:hover { background-color: #374151; }
                .rbc-toolbar button.rbc-active { background-color: #2563eb; color: white; border-color: #2563eb; }
                .rbc-off-range-bg { background: #111827; }
                .rbc-today { background: #1f2937; }
                .rbc-event { background-color: #2563eb; border-radius: 4px; }
                .rbc-time-view, .rbc-month-view { border-color: #374151; }
                .rbc-day-bg + .rbc-day-bg { border-left-color: #374151; }
                .rbc-time-header-content { border-left-color: #374151; }
                .rbc-time-content { border-top-color: #374151; }
                .rbc-timeslot-group { border-bottom-color: #374151; }
                .rbc-time-content > * + * > * { border-left-color: #374151; }
                .rbc-header { border-bottom-color: #374151; }
                .rbc-month-row + .rbc-month-row { border-top-color: #374151; }
                .rbc-day-bg { border-left-color: #374151; }
            `}</style>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                views={['month', 'week', 'day', 'agenda']}
                defaultView='month'
            />
        </div>
    );
}
