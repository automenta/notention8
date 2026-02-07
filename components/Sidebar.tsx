import React, { useState } from 'react';
import { Search } from './sidebar/Search';
import { useNotes } from '../hooks/useNotes';
import { useView } from '../hooks/useViewContext';
import { NoteListItem } from './sidebar/NoteListItem';
import type { SortOrder } from '../types';
import { useSortedFilteredNotes } from '../hooks/useSortedFilteredNotes';
import { useLocalForage } from '../hooks/useLocalForage';
import { SortSelector } from './sidebar/SortSelector';
import { TemplateList } from './sidebar/TemplateList';

export const Sidebar: React.FC = () => {
  const { notes, deleteNote } = useNotes();
  const { selectedNoteId, setSelectedNoteId } = useView();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useLocalForage<SortOrder>(
    'notention-sort-order',
    'updatedAt_desc'
  );

  const sortedNotes = useSortedFilteredNotes(notes, searchTerm, sortOrder);

  const handleDeleteNote = (noteIdToDelete: string) => {
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
  };

  return (
    <div className="bg-gray-900 flex flex-col h-full">
      <div className="p-4 flex-shrink-0 border-b border-gray-700/50 space-y-4">
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      <SortSelector sortOrder={sortOrder} onSortChange={setSortOrder} />

      <TemplateList />

      <div className="flex-grow p-2 space-y-1 overflow-y-auto">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={() => setSelectedNoteId(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))
        ) : (
          <div className="text-center py-8 px-4 text-sm text-gray-500">
            {searchTerm
              ? 'No notes match your search.'
              : 'No notes yet. Create one!'}
          </div>
        )}
      </div>
    </div>
  );
};
