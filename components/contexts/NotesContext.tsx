import React, { createContext, ReactNode } from 'react';
import { useNotesState } from '../../hooks/useNotesState';
import type { Note } from '../../types';

interface NotesContextType {
  notes: Note[];
  addNote: (overrides?: Partial<Note>) => Note;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  notesLoading: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { notes, addNote, updateNote, deleteNote, notesLoading } =
    useNotesState();

  return (
    <NotesContext.Provider
      value={{ notes, addNote, updateNote, deleteNote, notesLoading }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export { NotesContext };
