import React, { useMemo, useState } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { ClockIcon, ArrowRightIcon, PlusIcon } from '../layout/icons';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Tabs } from '../common/Tabs';
import { useTimelineEvents } from '../../hooks/useTimelineEvents';
import { TimelineEventItem } from './TimelineEventItem';

export const TimelineWidget = () => {
    const { notes, addNote } = useNotes();
    const { setActiveView, setSelectedNoteId } = useView();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    const { upcomingEvents, pastEvents } = useTimelineEvents(notes);

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
                        <TimelineEventItem
                            key={`${evt.note.id}-${idx}`}
                            event={evt}
                            activeTab={activeTab}
                            onClick={handleViewNote}
                        />
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
