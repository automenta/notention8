import React, { useRef } from 'react';
import type { Note } from '../../types';
import { TrashIcon, WorldIcon, DownloadIcon, MapPinIcon, ClockIcon, PinIcon, DocumentDuplicateIcon } from '../icons';
import { getTextFromHtml } from '../../utils/nostr';

export const NoteListItem = React.memo(({
  note,
  isSelected,
  onSelect,
  onDelete,
  onPin,
  isTrash = false,
  onRestore
}: {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onPin?: () => void;
  isTrash?: boolean;
  onRestore?: () => void;
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const contentPreview = React.useMemo(() => {
    return getTextFromHtml(note.content) || 'No content';
  }, [note.content]);

  const hasLocation = React.useMemo(() => {
      return note.properties.some(p => ['location', 'geo', 'place', 'lat', 'lng'].includes(p.key.toLowerCase()));
  }, [note.properties]);

  const hasTime = React.useMemo(() => {
      return note.properties.some(p => {
          const k = p.key.toLowerCase();
          return k.includes('date') || k.includes('time') || k === 'start' || k === 'end' || k === 'deadline';
      });
  }, [note.properties]);

  const handleExport = (e: React.MouseEvent) => {
      e.stopPropagation();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(note, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${note.title || 'untitled'}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

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
      } else if (e.key.toLowerCase() === 'p' && onPin) {
          e.preventDefault();
          onPin();
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
        <div className="flex flex-col gap-1">
            {note.pinned && (
                <span title="Pinned Note">
                    <PinIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                </span>
            )}
            {note.nostrEventId && note.publishedAt && (
            <span
                title={`Published on Nostr at ${new Date(note.publishedAt).toLocaleString()}`}
            >
                <WorldIcon className="h-4 w-4 text-green-400 flex-shrink-0" />
            </span>
            )}
            {hasLocation && (
                <span title="Has location data">
                    <MapPinIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                </span>
            )}
            {hasTime && (
                <span title="Has time data">
                    <ClockIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                </span>
            )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3
            className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}
          >
            {note.title || 'Untitled Note'}
          </h3>
          <p className="text-sm text-gray-400 truncate">{contentPreview}</p>
        </div>
      </div>
      <div className="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        {isTrash && onRestore && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRestore();
                }}
                tabIndex={-1}
                className="p-1 text-gray-500 rounded-full hover:bg-green-900/50 hover:text-green-400"
                title="Restore Note"
            >
                <DocumentDuplicateIcon className="h-4 w-4 transform rotate-180" />
            </button>
        )}
        {onPin && !isTrash && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                }}
                tabIndex={-1}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-700 hover:text-white"
                title={note.pinned ? "Unpin Note" : "Pin Note"}
            >
                <PinIcon className={`h-4 w-4 ${note.pinned ? 'text-blue-400' : ''}`} />
            </button>
        )}
        {!isTrash && (
            <button
                onClick={handleExport}
                tabIndex={-1}
                className="p-1 text-gray-500 rounded-full hover:bg-gray-700 hover:text-white"
                title="Export Note"
            >
                <DownloadIcon className="h-4 w-4" />
            </button>
        )}
        <button
            onClick={(e) => {
            e.stopPropagation();
            onDelete();
            }}
            tabIndex={-1} // Prevent tabbing into delete button for simpler nav
            className="ml-1 p-1 text-gray-500 rounded-full hover:bg-red-900/50 hover:text-red-400"
            title={isTrash ? "Delete Permanently" : "Move to Trash"}
        >
            <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});
