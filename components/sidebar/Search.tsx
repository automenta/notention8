import React from 'react';
import { SearchIcon, XCircleIcon } from '../icons';

interface SearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Search: React.FC<SearchProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id="sidebar-search-input"
        type="text"
        placeholder="Search notes... (Ctrl+/)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const firstNote = document.querySelector('.note-list-item') as HTMLElement;
            if (firstNote) {
              firstNote.focus();
            }
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setSearchTerm('');
            // Optional: blur input
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg py-2.5 pl-10 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
      />
      {searchTerm && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={() => setSearchTerm('')}
            className="text-gray-500 hover:text-white transition-colors"
            title="Clear search"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
