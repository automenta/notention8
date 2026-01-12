import React, { useState, useEffect } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { TiptapEditor } from '../TiptapEditor'; // Correct import path. AgentSessionView is in components/simulator. TiptapEditor is in components/
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import type { Note } from '../../types';

interface Props {
  agentName: string;
  currentDraft: string; // Text being typed by the simulator
  onDraftChange: (text: string) => void;
  status: string;
}

export const AgentSessionView: React.FC<Props> = ({ agentName, currentDraft, onDraftChange, status }) => {
  const { notes, addNote } = useNotes();
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // If no note exists, create one
  useEffect(() => {
    if (notes.length === 0) {
      const newNote = addNote();
      setActiveNote(newNote);
    } else if (!activeNote) {
        setActiveNote(notes[0]);
    }
  }, [notes, addNote, activeNote]);

  const displayNote = activeNote
    ? { ...activeNote, content: currentDraft || activeNote.content }
    : null;

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-3 py-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="font-bold text-sm text-gray-200">{agentName}</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">{status}</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-4 relative overflow-y-auto">
        {displayNote ? (
            <TiptapEditor
                note={displayNote}
                onChange={(content) => onDraftChange(content)}
                ontology={DEFAULT_ONTOLOGY} // Using default for now
            />
        ) : (
            <div className="text-gray-500 text-center mt-10">Loading OS...</div>
        )}
      </div>

      {/* Footer / Status Bar */}
      <div className="bg-gray-950 px-3 py-1 text-xs text-gray-500 flex justify-between">
        <span>{notes.length} Notes</span>
        <span>Online</span>
      </div>
    </div>
  );
};
