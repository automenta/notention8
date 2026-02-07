import React from 'react';
import type { Note } from '../../types';
import { Badge } from '../common/Badge';

interface RecentNoteItemProps {
  note: Note;
  onClick: (noteId: string) => void;
}

export const RecentNoteItem: React.FC<RecentNoteItemProps> = ({ note, onClick }) => {
  return (
    <div
      onClick={() => onClick(note.id)}
      className="p-5 bg-gray-800 hover:bg-gray-750 cursor-pointer rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-md h-40 flex flex-col"
    >
      <h3 className="font-medium text-lg text-gray-200 group-hover:text-blue-400 truncate mb-2">
        {note.title || 'Untitled Note'}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-auto">
        {note.content.replace(/<[^>]*>/g, '').slice(0, 150) || 'No content preview available.'}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
        {note.tags.length > 0 && (
          <Badge variant="default" size="sm">
            #{note.tags[0]}
          </Badge>
        )}
      </div>
    </div>
  );
};
