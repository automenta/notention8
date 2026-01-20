import React from 'react';
import { PlusIcon } from '../layout/icons';
import type { Note } from '../../types';

interface SessionSidebarProps {
    notes: Note[];
    activeNote: Note | null;
    setActiveNote: (note: Note) => void;
    addNote: () => Note;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
    notes,
    activeNote,
    setActiveNote,
    addNote
}) => {
    return (
        <div className="w-48 bg-gray-950 border-r border-gray-800 flex flex-col flex-shrink-0">
            <div className="p-2 border-b border-gray-800">
                <button
                    onClick={() => {
                        const n = addNote();
                        setActiveNote(n);
                    }}
                    className="w-full text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-1.5 rounded transition-colors border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-1.5"
                >
                    <PlusIcon className="w-3 h-3" />
                    New Note
                </button>
            </div>
            <div className="overflow-y-auto flex-1 p-1 space-y-0.5 custom-scrollbar">
                {notes.map(note => (
                    <div
                        key={note.id}
                        onClick={() => setActiveNote(note)}
                        className={`px-2 py-1.5 cursor-pointer rounded truncate text-[10px] transition-all border border-transparent ${
                            activeNote?.id === note.id
                            ? 'bg-blue-900/20 text-blue-200 border-blue-900/30'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
                        }`}
                    >
                        {note.title || "Untitled Note"}
                    </div>
                ))}
            </div>
        </div>
    );
};
