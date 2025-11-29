import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Note } from '../types';
import { TiptapEditor } from './TiptapEditor';
import { areNotesEqual } from '../utils/notes';

const SAVE_DEBOUNCE_MS = 1000;

interface EditorManagerProps {
  note: Note;
  onSave: (note: Note) => void;
}

export const EditorManager: React.FC<EditorManagerProps> = ({ note, onSave }) => {
  const [dirtyNote, setDirtyNote] = useState<Note>(note);

  // Refs for unmount safety
  const dirtyNoteRef = useRef(dirtyNote);
  const noteRef = useRef(note);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    dirtyNoteRef.current = dirtyNote;
  }, [dirtyNote]);

  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Sync state when note prop changes
  useEffect(() => {
    setDirtyNote((prev) => {
      // If ID changed, switch to new note
      if (note.id !== prev.id) return note;
      // If content matches upstream, sync reference to avoid unnecessary diffs
      return areNotesEqual(note, prev) ? note : prev;
    });
  }, [note]);

  // Debounced save effect
  useEffect(() => {
    // Only save if dirtyNote differs from the current upstream note
    if (areNotesEqual(dirtyNote, note)) return;

    const handler = setTimeout(() => onSave(dirtyNote), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [dirtyNote, onSave, note]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (!areNotesEqual(dirtyNoteRef.current, noteRef.current)) {
        onSaveRef.current(dirtyNoteRef.current);
      }
    };
  }, []);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDirtyNote((prev) => ({ ...prev, title: e.target.value })),
    []
  );

  const handleContentSave = useCallback(
    (content: string) => setDirtyNote((prev) => ({ ...prev, content })),
    []
  );

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
        key={note.id}
        note={dirtyNote}
        onSave={handleContentSave}
      />
    </div>
  );
};
