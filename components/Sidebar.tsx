import React from 'react';
import { Search } from './sidebar/Search';
import { NoteListItem } from './sidebar/NoteListItem';
import { SortSelector } from './sidebar/SortSelector';
import { TemplateList } from './sidebar/TemplateList';
import { useSidebarLogic } from '../hooks/useSidebarLogic';

export const Sidebar: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    sortedNotes,
    handleDeleteNote,
    selectedNoteId,
    setSelectedNoteId,
  } = useSidebarLogic();

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
