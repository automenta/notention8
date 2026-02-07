import React from 'react';
import { ClockIcon, PlusIcon } from '../layout/icons';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import type { Note } from '../../types';

interface RecentNotesWidgetProps {
  notes: Note[];
  onSelectNote: (noteId: string) => void;
  onViewAll: () => void;
  onCreateNote: () => void;
}

export const RecentNotesWidget: React.FC<RecentNotesWidgetProps> = ({
  notes,
  onSelectNote,
  onViewAll,
  onCreateNote
}) => {
  return (
    <Card
      title="Recent Notes"
      icon={ClockIcon}
      className="border-none bg-transparent p-0"
      headerAction={
        <Button
          onClick={onViewAll}
          variant="ghost"
          size="sm"
          className="text-blue-400 hover:text-blue-300"
        >
          View all
        </Button>
      }
    >
        {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map(note => (
                    <div
                        key={note.id}
                        onClick={() => onSelectNote(note.id)}
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
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed text-center">
                <p className="text-gray-500 mb-4">No notes yet. Start writing!</p>
                <Button
                    onClick={onCreateNote}
                    variant="primary"
                    icon={PlusIcon}
                >
                    Create First Note
                </Button>
            </div>
        )}
    </Card>
  );
};
