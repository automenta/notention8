import React, { useState, useEffect } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { TiptapEditor } from '../TiptapEditor';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import type { Note } from '../../types';

interface Props {
  agentName: string;
  currentDraft: string;
  onDraftChange: (text: string) => void;
  status: string;
  onPublish: (note: Note) => void;
  notifications: string[];
}

export const AgentSessionView: React.FC<Props> = ({
    agentName,
    currentDraft,
    onDraftChange,
    status,
    onPublish,
    notifications
}) => {
  const { notes, addNote, updateNote } = useNotes();
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // Initialize or Select Default Note
  useEffect(() => {
    if (notes.length === 0) {
      const newNote = addNote();
      setActiveNote(newNote);
    } else if (!activeNote && notes.length > 0) {
        setActiveNote(notes[0]);
    }
  }, [notes, addNote, activeNote]);

  // Handle "Publish" status trigger from Director
  useEffect(() => {
    if (status === 'Published' && activeNote) {
        const finalNote = { ...activeNote, content: currentDraft || activeNote.content };
        // Save to local DB
        updateNote(finalNote);
        // Notify Network
        onPublish(finalNote);
    }
  }, [status]); // Dependencies intentionally limited

  // The note to display. If typing (currentDraft exists and matches activeNote), use draft.
  const displayNote = activeNote
    ? { ...activeNote, content: (currentDraft && status !== 'Idle' && status !== 'Published') ? currentDraft : activeNote.content }
    : null;

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg relative">
      {/* Notifications Overlay */}
      {notifications.length > 0 && (
          <div className="absolute top-10 right-4 z-50 flex flex-col gap-2">
              {notifications.map((msg, i) => (
                  <div key={i} className="bg-blue-600 text-white text-xs px-3 py-2 rounded shadow-lg animate-bounce">
                      🔔 {msg}
                  </div>
              ))}
          </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 px-3 py-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'Error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="font-bold text-sm text-gray-200">{agentName}</span>
        </div>
        <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
            {status === 'Typing...' && <span className="animate-pulse">⌨️</span>}
            {status}
        </span>
      </div>

      <div className="flex flex-grow overflow-hidden">
          {/* Mini Sidebar */}
          <div className="w-1/4 bg-gray-950 border-r border-gray-800 flex flex-col">
            <div className="p-2 border-b border-gray-800">
                <button
                    onClick={() => {
                        const n = addNote();
                        setActiveNote(n);
                    }}
                    className="w-full text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 rounded"
                >
                    + New Note
                </button>
            </div>
            <div className="overflow-y-auto flex-1">
                {notes.map(note => (
                    <div
                        key={note.id}
                        onClick={() => setActiveNote(note)}
                        className={`p-2 cursor-pointer border-b border-gray-900 truncate text-xs ${activeNote?.id === note.id ? 'bg-blue-900/30 text-blue-200' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {note.title || "Untitled"}
                    </div>
                ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="w-3/4 bg-gray-900 relative overflow-y-auto">
            {displayNote ? (
                <div className="p-4 min-h-full">
                    <TiptapEditor
                        note={displayNote}
                        onChange={(content) => {
                            // When user manually types (if we allowed it) or when simulated typing updates
                            onDraftChange(content);
                        }}
                        ontology={DEFAULT_ONTOLOGY}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-600 text-xs">
                    Initializing...
                </div>
            )}
          </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-950 px-3 py-1 text-[10px] text-gray-600 flex justify-between border-t border-gray-800">
        <span>{notes.length} Notes</span>
        <span>ID: {activeNote?.id.slice(0,4)}</span>
      </div>
    </div>
  );
};
