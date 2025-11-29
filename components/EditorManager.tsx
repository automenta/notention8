import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Note } from '../types';
import { TiptapEditor } from './TiptapEditor';
import { areNotesEqual } from '../utils/notes';

const SAVE_DEBOUNCE_MS = 1000;

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const EditorManager: React.FC<EditorManagerProps> = ({
  note,
  onSave,
}) => {
  const [dirtyNote, setDirtyNote] = useState<Note>(note);
  const noteRef = useRef(note);

  // Keep noteRef synced with prop
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  // Sync state when note prop changes
  useEffect(() => {
    // If ID changed, it's a new note selection. Reset completely.
    if (note.id !== dirtyNote.id) {
      setDirtyNote(note);
      return;
    }

    // If ID is same, check if content is effectively equal.
    if (areNotesEqual(note, dirtyNote)) {
      setDirtyNote(note);
    }
  }, [note, dirtyNote]);

  // Debounced save effect for the entire note
  useEffect(() => {
    // Don't save if the content is unchanged from the source prop (at the time of last change)
    if (dirtyNote === noteRef.current) {
      return;
    }

    const handler = setTimeout(() => {
      onSave(dirtyNote);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [dirtyNote, onSave]);

  const handleContentSave = useCallback((updatedContent: string) => {
    setDirtyNote((prevNote) => ({
      ...prevNote,
      content: updatedContent,
    }));
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDirtyNote((prevNote) => ({
      ...prevNote,
      title: e.target.value,
    }));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-2 border-b border-gray-700/50">
        <input
          type="text"
          value={dirtyNote.title || ''}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="w-full bg-transparent text-white text-lg font-bold focus:outline-none placeholder-gray-500"
        />
      </div>
      <TiptapEditor
        key={note.id} // Force re-mount when note changes
        note={dirtyNote}
        onSave={handleContentSave}
      />
    </div>
  );
};
