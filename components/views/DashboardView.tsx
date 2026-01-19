import React, { useMemo } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { useSettings } from '../../hooks/useSettingsContext';
import { useSimulatorContext } from '../contexts/SimulatorContext';
import { DEFAULT_TEMPLATES } from '../../utils/templates';
import { parseProperties } from '../../utils/parsing';
import {
  NoteIcon,
  PlusIcon,
  CubeIcon,
  MapIcon,
  ChatIcon,
  ClockIcon,
  HomeIcon,
  SparklesIcon,
  NetworkIcon,
  DocumentDuplicateIcon
} from '../icons';

const DAILY_PROMPTS = [
    "What's one thing you learned today?",
    "Describe a problem you're trying to solve.",
    "Draft a message to a potential collaborator.",
    "List 3 goals for this week.",
    "Capture a quick thought about a project.",
    "Who would be a valuable connection right now?",
    "What knowledge is missing from your network?"
];

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

  const todaysPrompt = useMemo(() => {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  }, []);

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

  // Get recent logs for Network Pulse
  const recentLogs = [...logs].reverse().slice(0, 5);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-gray-900 text-white custom-scrollbar pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100 tracking-tight">{getGreeting()}</h1>
                <p className="text-gray-400 mt-2 text-lg">Here's what's happening in your network.</p>
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
                {/* Daily Prompt */}
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800/30 rounded-2xl p-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <SparklesIcon className="w-24 h-24" />
                     </div>
                     <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                         <SparklesIcon className="w-5 h-5" />
                         Daily Prompt
                     </h3>
                     <p className="text-xl md:text-2xl font-bold text-white mb-6 relative z-10">
                         "{todaysPrompt}"
                     </p>
                     <button
                        onClick={handleCreateNote}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 relative z-10"
                     >
                         Write about this
                     </button>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-300 mb-4 px-1">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onClick={handleCreateNote} className="group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10">
                            <div className="p-4 bg-blue-600/20 text-blue-400 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                <PlusIcon className="h-8 w-8" />
                            </div>
                            <span className="font-medium text-gray-200 group-hover:text-white">New Note</span>
                        </button>
                        <button onClick={() => setActiveView('map')} className="group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-900/10">
                            <div className="p-4 bg-green-600/20 text-green-400 rounded-full group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                <MapIcon className="h-8 w-8" />
                            </div>
                            <span className="font-medium text-gray-200 group-hover:text-white">Map View</span>
                        </button>
                        <button onClick={() => setActiveView('chat')} className="group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/10">
                            <div className="p-4 bg-purple-600/20 text-purple-400 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                <ChatIcon className="h-8 w-8" />
                            </div>
                            <span className="font-medium text-gray-200 group-hover:text-white">Chat</span>
                        </button>
                        <button onClick={() => setActiveView('simulator')} className="group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-900/10">
                            <div className="p-4 bg-orange-600/20 text-orange-400 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                <CubeIcon className="h-8 w-8" />
                            </div>
                            <span className="font-medium text-gray-200 group-hover:text-white">Simulator</span>
                        </button>
                    </div>
                </div>

                {/* Recent Notes */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                            Recent Notes
                        </h2>
                        <button
                            onClick={() => setActiveView('notes')}
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            View all
                        </button>
                    </div>

                    {recentNotes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentNotes.map(note => (
                                <div
                                    key={note.id}
                                    onClick={() => {
                                        setSelectedNoteId(note.id);
                                        setActiveView('notes');
                                    }}
                                    className="p-5 bg-gray-800 hover:bg-gray-750 cursor-pointer rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-md h-40 flex flex-col"
                                >
                                    <h3 className="font-medium text-lg text-gray-200 group-hover:text-blue-400 truncate mb-2">
                                        {note.title || 'Untitled Note'}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-auto">
                                        {note.content.replace(/<[^>]*>/g, '').slice(0, 150) || 'No content preview available.'}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                        {note.tags.length > 0 && (
                                            <span className="px-2 py-1 bg-gray-700/50 rounded-md text-gray-400 border border-gray-700">
                                                #{note.tags[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed">
                            <p className="text-gray-500">No notes yet. Create one above!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-8">
                 {/* Templates Widget */}
                 <div className="bg-gray-800 rounded-2xl border border-gray-700/50 p-6">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                        <DocumentDuplicateIcon className="h-5 w-5" />
                        Start from Template
                    </h3>
                    <div className="space-y-3">
                        {DEFAULT_TEMPLATES.slice(0, 3).map(tmpl => (
                            <button
                                key={tmpl.id}
                                onClick={() => handleUseTemplate(tmpl.content)}
                                className="w-full flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-750 border border-gray-800 rounded-xl transition-colors text-left group"
                            >
                                <span className="text-2xl group-hover:scale-110 transition-transform">{tmpl.icon}</span>
                                <div>
                                    <div className="font-medium text-gray-200 group-hover:text-white">{tmpl.label}</div>
                                    <div className="text-xs text-gray-500">Create new</div>
                                </div>
                            </button>
                        ))}
                         <button
                            onClick={() => setActiveView('notes')}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-300 py-2"
                        >
                            View all templates in Sidebar
                        </button>
                    </div>
                 </div>

                 {/* Network Pulse Widget */}
                 <div className="bg-gray-800 rounded-2xl border border-gray-700/50 p-6 flex flex-col h-96">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <NetworkIcon className="h-5 w-5" />
                            Network Pulse
                        </div>
                        {simulatorActive && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                        {recentLogs.length > 0 ? (
                            recentLogs.map((log, i) => (
                                <div key={i} className="text-xs p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                                    <div className="flex items-center gap-2 mb-1">
                                         <span className={`w-1.5 h-1.5 rounded-full ${
                                             log.type === 'match' ? 'bg-yellow-500' :
                                             log.type === 'ontology' ? 'bg-green-500' :
                                             'bg-blue-500'
                                         }`}></span>
                                         <span className="text-gray-500 font-mono uppercase text-[10px]">{log.type}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{log.msg}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <CubeIcon className="w-12 h-12 text-gray-700 mb-3" />
                                <p className="text-gray-500 text-sm mb-4">No recent activity.</p>
                                {!simulatorActive && (
                                    <button
                                        onClick={() => setActiveView('simulator')}
                                        className="text-xs bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded border border-blue-900 hover:bg-blue-900/50 transition-colors"
                                    >
                                        Start Simulator
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
