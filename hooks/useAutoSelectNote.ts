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
    // on mobile, we don't want to auto-select the first note
    // because that would force the user into the detail view
    // skipping the list view.
    if (window.innerWidth < 768) return;

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
