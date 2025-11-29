import { useCallback } from 'react';
import { useLocalForage } from './useLocalForage';
import { createNote } from '../utils/notes';
import type { Note } from '../types';

export const useNotesState = () => {
  const [notes, setNotes, notesLoading] = useLocalForage<Note[]>(
    'notention-notes',
    []
  );

  const addNote = useCallback(() => {
    const newNote = createNote();
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, [setNotes]);

  const updateNote = useCallback(
    (updatedNote: Note) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === updatedNote.id
            ? { ...updatedNote, updatedAt: new Date().toISOString() }
            : n
        )
      );
    },
    [setNotes]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    },
    [setNotes]
  );

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    notesLoading,
  };
};
