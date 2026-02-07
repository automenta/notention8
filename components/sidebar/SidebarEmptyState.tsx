import React from 'react';
import { NoteIcon, PlusIcon } from '../layout/icons';

interface SidebarEmptyStateProps {
    searchTerm: string;
    isTrashView: boolean;
    onCreateNote: (term?: string) => void;
}

export const SidebarEmptyState: React.FC<SidebarEmptyStateProps> = ({ searchTerm, isTrashView, onCreateNote }) => {
    return (
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
                    onClick={() => onCreateNote(searchTerm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                    <PlusIcon className="h-4 w-4" />
                    Create note &apos;{searchTerm}&apos;
                </button>
            ) : (
                <button
                    onClick={() => onCreateNote()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                    <PlusIcon className="h-4 w-4" />
                    Create First Note
                </button>
            )}
        </div>
    );
};
