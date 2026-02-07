import React, { useMemo, useState } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { ClockIcon, ArrowRightIcon, PlusIcon } from '../layout/icons';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Tabs } from '../common/Tabs';
import type { Note } from '../../types';

interface TimelineEvent {
    note: Note;
    date: Date;
    label: string;
}

export const TimelineWidget = () => {
    const { notes, addNote, updateNote } = useNotes();
    const { setActiveView, setSelectedNoteId } = useView();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    const { upcomingEvents, pastEvents } = useMemo(() => {
        const upcoming: TimelineEvent[] = [];
        const past: TimelineEvent[] = [];
        const now = new Date();

        notes.forEach(note => {
            note.properties.forEach(p => {
                const key = p.key.toLowerCase();
                const val = p.values[0];
                if (!val) return;

                if (['date', 'time', 'deadline', 'start', 'end', 'due'].some(k => key.includes(k))) {
                    const d = new Date(val);
                    if (!isNaN(d.getTime())) {
                        const evt = {
                            note,
                            date: d,
                            label: p.key
                        };
                        if (d > now) {
                            upcoming.push(evt);
                        } else {
                            past.push(evt);
                        }
                    }
                }
            });
        });

        // Sort upcoming by date ascending (nearest first)
        upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());

        // Sort past by date descending (most recent first)
        past.sort((a, b) => b.date.getTime() - a.date.getTime());

        return {
            upcomingEvents: upcoming,
            pastEvents: past
        };
    }, [notes]);

    const displayedEvents = useMemo(() => {
        const list = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
        return list.slice(0, 5);
    }, [activeTab, upcomingEvents, pastEvents]);

    const handleViewNote = (noteId: string) => {
        setSelectedNoteId(noteId);
        setActiveView('notes');
    };

    const handleCreateEvent = () => {
        // Add a default deadline for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9 AM

        const dateStr = tomorrow.toISOString().slice(0, 16).replace('T', ' ');
        const displayDate = tomorrow.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        const title = `Event - ${displayDate}`;
        const content = `${title}\n[date:is:${dateStr}]`;

        const newNote = addNote({ title, content });

        setSelectedNoteId(newNote.id);
        setActiveView('notes');
    };

    const tabs = [
        { id: 'upcoming', label: 'Upcoming', count: upcomingEvents.length },
        { id: 'history', label: 'History', count: pastEvents.length }
    ];

    return (
        <Card title="Timeline" icon={ClockIcon}>
             <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={(id) => setActiveTab(id as 'upcoming' | 'history')}
                        className="bg-gray-800"
                    />
                </div>

                {displayedEvents.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 text-sm border border-gray-800 border-dashed rounded-lg bg-gray-800/30">
                        {activeTab === 'upcoming' ? (
                            <>
                                <p className="mb-2">No upcoming events.</p>
                                <Button size="xs" variant="secondary" onClick={handleCreateEvent} icon={PlusIcon}>
                                    Add Event
                                </Button>
                            </>
                        ) : (
                            <p>No past events found.</p>
                        )}
                    </div>
                ) : (
                    displayedEvents.map((evt, idx) => (
                        <div
                            key={`${evt.note.id}-${idx}`}
                            className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors group"
                            onClick={() => handleViewNote(evt.note.id)}
                        >
                            <div className={`flex-shrink-0 flex flex-col items-center min-w-[3rem] border rounded p-1 ${activeTab === 'upcoming' ? 'bg-gray-800 border-gray-700' : 'bg-gray-800/50 border-gray-800 opacity-60'}`}>
                                <span className={`text-xs font-bold uppercase ${activeTab === 'upcoming' ? 'text-red-400' : 'text-gray-500'}`}>{evt.date.toLocaleString('default', { month: 'short' })}</span>
                                <span className={`text-lg font-bold ${activeTab === 'upcoming' ? 'text-gray-200' : 'text-gray-500'}`}>{evt.date.getDate()}</span>
                            </div>
                            <div className="flex-grow min-w-0">
                                <h4 className={`text-sm font-medium truncate ${activeTab === 'upcoming' ? 'text-gray-200' : 'text-gray-500'}`}>{evt.note.title || 'Untitled Note'}</h4>
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                    <span className="opacity-70">{evt.label}:</span>
                                    {evt.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                    <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleCreateEvent}
                        icon={PlusIcon}
                        iconPosition="left"
                        className="text-gray-500 hover:text-white"
                    >
                        New Event
                    </Button>

                    <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setActiveView('time')}
                        icon={ArrowRightIcon}
                        iconPosition="right"
                        className="text-blue-400 hover:text-blue-300"
                    >
                        Full Calendar
                    </Button>
                </div>
             </div>
        </Card>
    );
};
