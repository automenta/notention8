import React, { useRef } from 'react';
import type { Note } from '../../types';
import { TrashIcon, WorldIcon } from '../icons';
import { getTextFromHtml } from '../../utils/nostr';

export const NoteListItem: React.FC<{
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ note, isSelected, onSelect, onDelete }) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const contentPreview = React.useMemo(() => {
    return getTextFromHtml(note.content) || 'No content';
  }, [note.content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = itemRef.current?.nextElementSibling as HTMLElement;
          if (next && next.classList.contains('note-list-item')) {
              next.focus();
          }
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = itemRef.current?.previousElementSibling as HTMLElement;
          if (prev && prev.classList.contains('note-list-item')) {
              prev.focus();
          } else {
              // Focus search input
              const searchInput = document.getElementById('sidebar-search-input');
              if (searchInput) {
                  searchInput.focus();
              }
          }
      } else if (e.key === 'Enter') {
          e.preventDefault();
          onSelect();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          onDelete();
      }
  };

  return (
    <div
      ref={itemRef}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`note-list-item group flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isSelected ? 'bg-blue-600/30' : 'hover:bg-gray-800'
      }`}
    >
      <div className="flex-1 overflow-hidden flex items-center gap-3 pointer-events-none">
        {note.nostrEventId && note.publishedAt && (
          <span
            title={`Published on Nostr at ${new Date(note.publishedAt).toLocaleString()}`}
          >
            <WorldIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
          </span>
        )}
        <div className="flex-1 overflow-hidden">
          <h3
            className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}
          >
            {note.title || 'Untitled Note'}
          </h3>
          <p className="text-sm text-gray-400 truncate">{contentPreview}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        tabIndex={-1} // Prevent tabbing into delete button for simpler nav
        className="ml-2 p-1 text-gray-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-900/50 hover:text-red-400 transition-opacity focus:opacity-100"
        title="Delete Note"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
