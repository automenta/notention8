import React from 'react';
import { ClockIcon } from '../layout/icons';
import type { Note } from '../../types';

interface RecentNotesWidgetProps {
  recentNotes: Note[];
  onSelectNote: (id: string) => void;
  onViewAll: () => void;
}

export function RecentNotesWidget({ recentNotes, onSelectNote, onViewAll }: RecentNotesWidgetProps) {
  return (
    <div>
        <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                Recent Notes
            </h2>
            <button
                onClick={onViewAll}
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
                        onClick={() => onSelectNote(note.id)}
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
  );
}
