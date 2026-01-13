import { useEffect } from 'react';
import type { Note } from '../types';

interface UseAutoSelectNoteProps {
  activeView: string;
  notesLoading: boolean;
  selectedNoteId: string | null;
  sortedNotes: Note[];
  setSelectedNoteId: (id: string) => void;
}

export const useAutoSelectNote = ({
  activeView,
  notesLoading,
  selectedNoteId,
  sortedNotes,
  setSelectedNoteId,
}: UseAutoSelectNoteProps) => {
  useEffect(() => {
    if (
      activeView === 'notes' &&
      !notesLoading &&
      selectedNoteId === null &&
      sortedNotes.length > 0
    ) {
      setSelectedNoteId(sortedNotes[0].id);
    }
  }, [
    activeView,
    notesLoading,
    selectedNoteId,
    sortedNotes,
    setSelectedNoteId,
  ]);
};
