import React from 'react';
import { ClockIcon, PlusIcon } from '../layout/icons';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { RecentNoteItem } from './RecentNoteItem';
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
                    <RecentNoteItem key={note.id} note={note} onClick={onSelectNote} />
                ))}
            </div>
        ) : (
            <EmptyState
                title="No notes yet. Start writing!"
                className="bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed"
                action={
                    <Button
                        onClick={onCreateNote}
                        variant="primary"
                        icon={PlusIcon}
                    >
                        Create First Note
                    </Button>
                }
            />
        )}
    </Card>
  );
};
