import React from 'react';
import type { Note } from '../../types';

import { useNotesView } from '../../hooks/useNotesView';
import { EditorManager } from '../EditorManager';
import { CubeTransparentIcon } from '../icons';

interface PlaceholderViewProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  message: string;
}

function PlaceholderView({ icon, title, message }: PlaceholderViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-800/50 rounded-lg p-8 text-gray-400">
      <div className="text-blue-500 mb-6">
        {React.cloneElement(icon, { className: 'h-24 w-24' })}
      </div>
      <h2 className="text-4xl font-bold text-white mb-3">{title}</h2>
      <p className="max-w-md">{message}</p>
    </div>
  );
}

interface NotesViewProps {
  sortedNotes?: Note[];
}

export function NotesView({ sortedNotes }: NotesViewProps) {
  const { selectedNote, updateNote } = useNotesView();

  if (!selectedNote) {
    return (
      <PlaceholderView
        icon={<CubeTransparentIcon />}
        title="No Note Selected"
        message="Create a new note or select one from the list to get started."
      />
    );
  }

  return (
    <EditorManager
      key={selectedNote.id}
      note={selectedNote}
      onSave={updateNote}
      sortedNotes={sortedNotes}
    />
  );
}
