import React from 'react';
import { NoteIcon, PlusIcon } from '../layout/icons';
import { Button } from '../common/Button';

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
                <Button
                    onClick={() => onCreateNote(searchTerm)}
                    icon={PlusIcon}
                >
                    Create note &apos;{searchTerm}&apos;
                </Button>
            ) : (
                <Button
                    onClick={() => onCreateNote()}
                    icon={PlusIcon}
                >
                    Create First Note
                </Button>
            )}
        </div>
    );
};
