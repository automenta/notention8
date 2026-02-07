import React from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { useSettings } from '../../hooks/useSettingsContext';
import { useSimulatorContext } from '../contexts/SimulatorContext';
import { parseProperties } from '../../utils/parsing';

import { DailyPromptWidget } from '../dashboard/DailyPromptWidget';
import { QuickActionsWidget } from '../dashboard/QuickActionsWidget';
import { RecentNotesWidget } from '../dashboard/RecentNotesWidget';
import { TemplatesWidget } from '../dashboard/TemplatesWidget';
import { NetworkPulseWidget } from '../dashboard/NetworkPulseWidget';
import { DashboardStats } from '../dashboard/DashboardStats';

export function DashboardView() {
  const { notes, addNote, updateNote } = useNotes();
  const { setActiveView, setSelectedNoteId } = useView();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { settings } = useSettings();
  const { logs, active: simulatorActive } = useSimulatorContext();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const handleCreateNote = () => {
     const newNote = addNote();
     setSelectedNoteId(newNote.id);
     setActiveView('notes');
  };

  const handleUseTemplate = (content: string) => {
    const newNote = addNote();
    const properties = parseProperties(content);
    const updated = {
        ...newNote,
        content,
        properties
    };
    updateNote(updated);
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-gray-900 text-white custom-scrollbar pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100 tracking-tight">{getGreeting()}</h1>
                <p className="text-gray-400 mt-2 text-lg">Here&apos;s what&apos;s happening in your network.</p>
            </div>
            <DashboardStats
                totalNotes={notes.length}
                pinnedNotes={notes.filter(n => n.pinned).length}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">
                <DailyPromptWidget onCreateNote={handleCreateNote} />

                <QuickActionsWidget
                    onCreateNote={handleCreateNote}
                    onNavigate={setActiveView}
                />

                <RecentNotesWidget
                    notes={recentNotes}
                    onSelectNote={(id) => {
                        setSelectedNoteId(id);
                        setActiveView('notes');
                    }}
                    onViewAll={() => setActiveView('notes')}
                    onCreateNote={handleCreateNote}
                />
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-8">
                 <TemplatesWidget
                    onUseTemplate={handleUseTemplate}
                    onViewAll={() => setActiveView('notes')}
                 />

                 <NetworkPulseWidget
                    logs={logs}
                    simulatorActive={simulatorActive}
                    onStartSimulator={() => setActiveView('simulator')}
                 />
            </div>
        </div>
      </div>
    </div>
  );
}
