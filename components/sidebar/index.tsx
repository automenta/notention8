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
import { PlusIcon, NoteIcon } from '../icons';

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
    activeView,
  } = useView();

  const { deleteNote, addNote, updateNote, restoreNote, permanentlyDeleteNote } = useNotes();
  const { addToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);

  const isTrashView = activeView === 'trash';

  const handleDeleteRequest = (id: string) => {
    if (isTrashView) {
        setNoteToDeleteId(id);
        setIsDeleteModalOpen(true);
    } else {
        // Soft delete immediately
        if (selectedNoteId === id) {
            const currentIndex = sortedNotes.findIndex((n) => n.id === id);
            const nextNote = sortedNotes[currentIndex + 1] || sortedNotes[currentIndex - 1] || null;
            setSelectedNoteId(nextNote ? nextNote.id : null);
        }
        deleteNote(id);
        addToast('Note moved to trash', 'success');
    }
  };

  const handleDeleteConfirmed = () => {
    if (noteToDeleteId) {
      if (selectedNoteId === noteToDeleteId) {
        setSelectedNoteId(null);
      }
      permanentlyDeleteNote(noteToDeleteId);
      addToast('Note permanently deleted', 'success');
      setNoteToDeleteId(null);
    }
  };

  const handleRestore = (id: string) => {
      restoreNote(id);
      addToast('Note restored', 'success');
  };

  const handleCreateNote = (title?: string) => {
      const overrides: Partial<Note> = {};
      if (title && typeof title === 'string') {
          overrides.title = title;
      }

      // If this is the very first note (empty list and not a search query), add welcome content
      if (sortedNotes.length === 0 && !title && !searchTerm) {
          overrides.title = "Welcome to Notention";
          overrides.content = `
<h2>Getting Started</h2>
<p>Notention is a tool for thought that evolves into a peer-to-peer network.</p>
<ul>
    <li><strong>Semantic:</strong> Type <code>[status:is:Active]</code> to add properties.</li>
    <li><strong>Heuristic:</strong> Click the "Magic" wand to auto-tag your notes.</li>
    <li><strong>Network:</strong> Publish to Nostr to find matches.</li>
</ul>
<p>Try it out! Type "I have a meeting tomorrow" and click the Magic wand.</p>
          `.trim();
      }

      const newNote = addNote(overrides);
      setSelectedNoteId(newNote.id);
      setActiveView('notes');
      if (title) setSearchTerm('');
  };

  const handleTogglePin = (note: Note) => {
      updateNote({ ...note, pinned: !note.pinned });
      addToast(note.pinned ? 'Note unpinned' : 'Note pinned', 'info');
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
                title="New Note (Ctrl+N)"
            >
                <PlusIcon className="h-5 w-5" />
            </button>
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
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-800 p-4 rounded-full mb-4">
                <NoteIcon className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-gray-400 mb-2 font-medium">
              {searchTerm ? 'No matching notes found' : (isTrashView ? 'Trash is empty' : 'Your notebook is empty')}
            </p>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              {searchTerm ? `Try adjusting your search for '${searchTerm}'` : 'Capture your ideas, daily tasks, and knowledge.'}
            </p>
            {searchTerm ? (
                 <button
                    onClick={() => handleCreateNote(searchTerm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                    <PlusIcon className="h-4 w-4" />
                    Create note &apos;{searchTerm}&apos;
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
        title="Permanently Delete Note"
        message="Are you sure you want to permanently delete this note? This action cannot be undone."
        confirmLabel="Delete Forever"
        isDestructive
      />
    </div>
  );
}
