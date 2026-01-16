import React, { useState } from 'react';
import type { Note } from '../../types';
import { useView } from '../../hooks/useViewContext';
import { useNotes } from '../../hooks/useNotes';
import { useToast } from '../contexts/ToastContext';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { NoteListItem } from './NoteListItem';
import { Search } from './Search';
import { SortSelector } from './SortSelector';
import { TemplateList } from './TemplateList';
import { PlusIcon } from '../icons';

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
    setActiveView,
  } = useView();

  const { deleteNote, addNote } = useNotes();
  const { addToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);

  const handleDeleteRequest = (id: string) => {
    setNoteToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (noteToDeleteId) {
      if (selectedNoteId === noteToDeleteId) {
        const currentIndex = sortedNotes.findIndex((n) => n.id === noteToDeleteId);
        const nextNote = sortedNotes[currentIndex + 1] || sortedNotes[currentIndex - 1] || null;
        setSelectedNoteId(nextNote ? nextNote.id : null);
      }
      deleteNote(noteToDeleteId);
      addToast('Note deleted', 'success');
      setNoteToDeleteId(null);
    }
  };

  const handleCreateNote = (title?: string) => {
      // Use the provided title or undefined (which defaults to empty/untitled in addNote)
      // If title is passed (e.g. from search), use it.
      const newNote = addNote(title && typeof title === 'string' ? { title } : undefined);
      setSelectedNoteId(newNote.id);
      setActiveView('notes');
      if (title) setSearchTerm('');
  };

  return (
    <div className="bg-gray-900 flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-gray-700/50 p-3 space-y-3">
        <div className="flex items-center gap-2">
            <div className="flex-grow">
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
             <button
                onClick={handleCreateNote}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex-shrink-0"
                title="New Note"
            >
                <PlusIcon className="h-5 w-5" />
            </button>
        </div>

        <SortSelector sortOrder={sortOrder} onSortChange={setSortOrder} />

        <TemplateList />
      </div>

      <div className="flex-grow p-2 space-y-1 overflow-y-auto">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={() => setSelectedNoteId(note.id)}
              onDelete={() => handleDeleteRequest(note.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No notes match your search.' : 'No notes yet.'}
            </p>
            {searchTerm ? (
                 <button
                    onClick={() => handleCreateNote(searchTerm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                    <PlusIcon className="h-4 w-4" />
                    Create note "{searchTerm}"
                </button>
            ) : (
                <button
                    onClick={() => handleCreateNote()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                    <PlusIcon className="h-4 w-4" />
                    Create First Note
                </button>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
      />
    </div>
  );
}
