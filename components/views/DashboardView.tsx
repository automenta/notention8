import React from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { useSimulatorContext } from '../contexts/SimulatorContext';
import { parseProperties } from '../../utils/parsing';
import { NoteIcon, HomeIcon } from '../layout/icons';
import { DailyPromptWidget } from '../dashboard/DailyPromptWidget';
import { QuickActionsWidget } from '../dashboard/QuickActionsWidget';
import { RecentNotesWidget } from '../dashboard/RecentNotesWidget';
import { TemplatesWidget } from '../dashboard/TemplatesWidget';
import { NetworkPulseWidget } from '../dashboard/NetworkPulseWidget';

export function DashboardView() {
  const { notes, addNote, updateNote } = useNotes();
  const { setActiveView, setSelectedNoteId } = useView();
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

  const stats = [
    { label: 'Total Notes', value: notes.length, icon: NoteIcon, color: 'text-blue-400', bg: 'bg-blue-600/20' },
    { label: 'Pinned', value: notes.filter(n => n.pinned).length, icon: HomeIcon, color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
  ];

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
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
                 {stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/30 min-w-[140px]">
                        <div className={`p-2 rounded-md ${stat.bg} ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{stat.label}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">
                <DailyPromptWidget onCreateNote={handleCreateNote} />
                <QuickActionsWidget onCreateNote={handleCreateNote} onNavigate={setActiveView} />
                <RecentNotesWidget
                    recentNotes={recentNotes}
                    onSelectNote={(id) => {
                        setSelectedNoteId(id);
                        setActiveView('notes');
                    }}
                    onViewAll={() => setActiveView('notes')}
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
