import React, { useMemo } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { ClockIcon, ArrowRightIcon } from '../layout/icons';
import { Button } from '../common/Button';
import { DashboardCard } from './DashboardCard';
import type { Note } from '../../types';

interface TimelineEvent {
    note: Note;
    date: Date;
    label: string;
}

export const TimelineWidget = () => {
    const { notes } = useNotes();
    const { setActiveView, setSelectedNoteId } = useView();

    const upcomingEvents = useMemo(() => {
        const events: TimelineEvent[] = [];
        const now = new Date();

        notes.forEach(note => {
            note.properties.forEach(p => {
                const key = p.key.toLowerCase();
                const val = p.values[0];
                if (!val) return;

                if (['date', 'time', 'deadline', 'start', 'end', 'due'].some(k => key.includes(k))) {
                    const d = new Date(val);
                    if (!isNaN(d.getTime()) && d > now) {
                        events.push({
                            note,
                            date: d,
                            label: p.key
                        });
                    }
                }
            });
        });

        // Sort by date ascending
        return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
    }, [notes]);

    const handleViewNote = (noteId: string) => {
        setSelectedNoteId(noteId);
        setActiveView('notes');
    };

    return (
        <DashboardCard title="Upcoming" icon={ClockIcon}>
             <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 text-sm">
                        No upcoming events found.
                        <br />
                        <span className="text-xs text-gray-600">Try adding <code>[deadline:is:tomorrow]</code></span>
                    </div>
                ) : (
                    upcomingEvents.map((evt, idx) => (
                        <div
                            key={`${evt.note.id}-${idx}`}
                            className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors"
                            onClick={() => handleViewNote(evt.note.id)}
                        >
                            <div className="flex-shrink-0 flex flex-col items-center min-w-[3rem] bg-gray-800 border border-gray-700 rounded p-1">
                                <span className="text-xs text-red-400 font-bold uppercase">{evt.date.toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-lg font-bold text-gray-200">{evt.date.getDate()}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                                <h4 className="text-sm font-medium text-gray-200 truncate">{evt.note.title || 'Untitled Note'}</h4>
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                    <span className="opacity-70">{evt.label}:</span>
                                    {evt.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                 {upcomingEvents.length > 0 && (
                    <div className="pt-2 border-t border-gray-800 flex justify-end">
                        <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setActiveView('time')}
                            rightIcon={ArrowRightIcon}
                        >
                            View Calendar
                        </Button>
                    </div>
                )}
             </div>
        </DashboardCard>
    );
};
