import React from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';
import { useSettings } from '../../hooks/useSettingsContext';
import {
  NoteIcon,
  PlusIcon,
  CubeIcon,
  MapIcon,
  ChatIcon,
  ClockIcon,
  HomeIcon
} from '../icons';

export function DashboardView() {
  const { notes, addNote } = useNotes();
  const { setActiveView, setSelectedNoteId } = useView();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { settings } = useSettings();

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

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-gray-900 text-white custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100 tracking-tight">{getGreeting()}</h1>
                <p className="text-gray-400 mt-2 text-lg">Here's what's happening in your network.</p>
            </div>
            <div className="hidden md:flex gap-4">
                 {stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/30">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}
