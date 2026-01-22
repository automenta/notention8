import React from 'react';
import type { Note } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { NoteListItem } from './NoteListItem';
import { Search } from './Search';
import { SortSelector } from './SortSelector';
import { TemplateList } from './TemplateList';
import { SidebarEmptyState } from './SidebarEmptyState';
import { PlusIcon } from '../layout/icons';
import { useSidebarLogic } from './useSidebarLogic';
import { IconButton } from '../common/IconButton';

interface SidebarProps {
  sortedNotes?: Note[];
}

export function Sidebar({ sortedNotes = [] }: SidebarProps) {
  const {
      searchTerm,
      setSearchTerm,
      sortOrder,
      setSortOrder,
      selectedNoteId,
      setSelectedNoteId,
      isTrashView,
      isDeleteModalOpen,
      setIsDeleteModalOpen,
      handleDeleteRequest,
      handleDeleteConfirmed,
      handleRestore,
      handleCreateNote,
      handleTogglePin
  } = useSidebarLogic(sortedNotes);

  return (
    <div className="bg-gray-900 flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-gray-700/50 p-3 space-y-3">
        <div className="flex items-center gap-2">
            <div className="flex-grow">
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
            <IconButton
                onClick={() => handleCreateNote()}
                tooltip="New Note (Ctrl+N)"
                tooltipPosition="bottom"
                icon={PlusIcon}
                variant="primary"
                size="lg"
                containerClassName="flex-shrink-0"
            />
        </div>

        <SortSelector sortOrder={sortOrder} onSortChange={setSortOrder} />

        <TemplateList />
      </div>

      <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={() => setSelectedNoteId(note.id)}
              onDelete={() => handleDeleteRequest(note.id)}
              onPin={!isTrashView ? () => handleTogglePin(note) : undefined}
              isTrash={isTrashView}
              onRestore={() => handleRestore(note.id)}
            />
          ))
        ) : (
          <SidebarEmptyState
              searchTerm={searchTerm}
              isTrashView={isTrashView}
              onCreateNote={handleCreateNote}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Permanently Delete Note"
        message="Are you sure you want to permanently delete this note? This action cannot be undone."
        confirmLabel="Delete Forever"
        isDestructive
      />
    </div>
  );
}
