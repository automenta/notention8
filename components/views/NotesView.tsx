import React from 'react';
import type { Note } from '../../types';

import { useNotesView } from '../../hooks/useNotesView';
import { EditorManager } from '../EditorManager';
import { DashboardView } from './DashboardView';
import { useNotes } from '../../hooks/useNotes';
import { useView } from '../../hooks/useViewContext';

interface NotesViewProps {
  sortedNotes?: Note[];
}

export function NotesView({ sortedNotes }: NotesViewProps) {
  const { selectedNote, updateNote } = useNotesView();
  const { addNote } = useNotes();
  const { setSelectedNoteId, setActiveView } = useView();

  if (!selectedNote) {
    return (
      <DashboardView
          notes={sortedNotes || []}
          onCreateNote={() => {
              const newNote = addNote();
              setSelectedNoteId(newNote.id);
          }}
          onSelectNote={setSelectedNoteId}
          onSearch={() => {
              const searchInput = document.getElementById('sidebar-search-input');
              if (searchInput) searchInput.focus();
          }}
          onOpenMap={() => setActiveView('map')}
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
