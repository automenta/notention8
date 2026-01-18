import React, { useMemo } from 'react';
import type { Note } from '../../types';
import {
  NoteIcon,
  PlusIcon,
  SearchIcon,
  MapIcon,
  PinIcon,
  ClockIcon,
  SparklesIcon,
} from '../icons';
import { formatDistanceToNow } from 'date-fns';

interface DashboardViewProps {
  notes: Note[];
  onCreateNote: () => void;
  onSelectNote: (id: string) => void;
  onSearch: () => void;
  onOpenMap: () => void;
}

export function DashboardView({
  notes,
  onCreateNote,
  onSelectNote,
  onSearch,
  onOpenMap,
}: DashboardViewProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const pinnedNotes = useMemo(() => {
    return notes.filter((n) => n.pinned && !n.deletedAt);
  }, [notes]);

  const recentNotes = useMemo(() => {
    return [...notes]
      .filter((n) => !n.pinned && !n.deletedAt)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6);
  }, [notes]);

  const stats = useMemo(() => {
    const totalNotes = notes.filter((n) => !n.deletedAt).length;
    const totalProperties = notes.reduce(
      (acc, n) => acc + (n.properties?.length || 0),
      0
    );
    const publishedCount = notes.filter((n) => n.nostrEventId).length;
    return { totalNotes, totalProperties, publishedCount };
  }, [notes]);

  return (
    <div className="h-full overflow-y-auto p-8 bg-gray-900 text-gray-200">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{greeting}</h1>
            <p className="text-gray-400">
              You have {stats.totalNotes} notes with {stats.totalProperties} semantic properties.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCreateNote}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-900/20"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
                onClick={onSearch}
                className="p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all group text-left"
            >
                <div className="bg-purple-900/20 p-2 rounded-lg w-fit mb-3 group-hover:bg-purple-900/30 transition-colors">
                    <SearchIcon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Search</h3>
                <p className="text-sm text-gray-500">Find anything</p>
            </button>

             <button
                onClick={onOpenMap}
                className="p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all group text-left"
            >
                <div className="bg-green-900/20 p-2 rounded-lg w-fit mb-3 group-hover:bg-green-900/30 transition-colors">
                    <MapIcon className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white">Map View</h3>
                <p className="text-sm text-gray-500">Explore locations</p>
            </button>

            <button
                 className="p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all group text-left"
                 onClick={() => { /* TODO: Open Time View */ }}
            >
                <div className="bg-orange-900/20 p-2 rounded-lg w-fit mb-3 group-hover:bg-orange-900/30 transition-colors">
                    <ClockIcon className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white">Timeline</h3>
                <p className="text-sm text-gray-500">Upcoming events</p>
            </button>

            <div className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-xl flex flex-col justify-center items-center text-center">
                 <SparklesIcon className="h-8 w-8 text-yellow-500 mb-2 opacity-50" />
                 <span className="text-2xl font-bold text-white">{stats.publishedCount}</span>
                 <span className="text-xs text-gray-500 uppercase tracking-wider">Published</span>
            </div>
        </div>

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <PinIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-bold text-gray-200">Pinned</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className="bg-gray-800 border border-gray-700 hover:border-gray-600 p-4 rounded-xl cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white truncate pr-2 group-hover:text-blue-400 transition-colors">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <PinIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  </div>
                   <div className="text-sm text-gray-500 line-clamp-2 h-10 mb-3" dangerouslySetInnerHTML={{ __html: note.content || '<span class="italic opacity-50">No content</span>' }} />
                   <div className="flex items-center gap-2 text-xs text-gray-600">
                        <ClockIcon className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Notes */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <NoteIcon className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-200">Recent</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className="bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 p-4 rounded-xl cursor-pointer transition-all hover:shadow-lg group"
                >
                  <h3 className="font-semibold text-gray-200 mb-2 truncate group-hover:text-blue-400 transition-colors">
                    {note.title || 'Untitled Note'}
                  </h3>
                   <div className="text-sm text-gray-500 line-clamp-3 h-14 mb-3" dangerouslySetInnerHTML={{ __html: note.content || '<span class="italic opacity-50">No content</span>' }} />
                   <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                       <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                       </div>
                       {note.nostrEventId && (
                           <span className="h-2 w-2 rounded-full bg-green-500" title="Published"></span>
                       )}
                   </div>
                </div>
              ))
            ) : (
                <div className="col-span-full py-12 text-center text-gray-500 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                    <p>No recent notes found. Create one to get started!</p>
                </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
