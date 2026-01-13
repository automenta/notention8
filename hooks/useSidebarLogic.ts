import { useState, useCallback } from 'react';
import type { Note, SortOrder } from '../types';
import { useNotes } from './useNotes';
import { useView } from './useViewContext';
import { useSortedFilteredNotes } from './useSortedFilteredNotes';
import { useLocalForage } from './useLocalForage';

export const useSidebarLogic = () => {
  const { notes, deleteNote } = useNotes();
  const { selectedNoteId, setSelectedNoteId } = useView();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useLocalForage<SortOrder>(
    'notention-sort-order',
    'updatedAt_desc'
  );

  const sortedNotes = useSortedFilteredNotes(notes, searchTerm, sortOrder);

  const handleDeleteNote = useCallback((noteIdToDelete: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    if (selectedNoteId === noteIdToDelete) {
      const currentIndex = sortedNotes.findIndex(
        (n) => n.id === noteIdToDelete
      );
      const nextNote =
        sortedNotes[currentIndex + 1] || sortedNotes[currentIndex - 1] || null;
      setSelectedNoteId(nextNote ? nextNote.id : null);
    }
    deleteNote(noteIdToDelete);
  }, [sortedNotes, selectedNoteId, setSelectedNoteId, deleteNote]);

  return {
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    sortedNotes,
    handleDeleteNote,
    selectedNoteId,
    setSelectedNoteId
  };
};
