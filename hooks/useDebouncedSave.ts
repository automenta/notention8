import { useState, useEffect, useRef } from 'react';
import type { Note } from '../types';
import { areNotesEqual } from '../utils/notes';

const SAVE_DEBOUNCE_MS = 1000;

export const useDebouncedSave = (note: Note, onSave: (note: Note) => void) => {
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

  return { dirtyNote, setDirtyNote };
};
