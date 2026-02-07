import React from 'react';

import { useNotes } from '../hooks/useNotes';
import { useSettings } from '../hooks/useSettingsContext';
import { useView } from '../hooks/useViewContext';
import { LoadingSpinner } from './icons';
import { SimulatorView } from './simulator/SimulatorView';
import { ChatView } from './views/ChatView';
import { MapView } from './views/MapView';
import { NetworkView } from './views/NetworkView';
import { NotesView } from './views/NotesView';
import { OntologyView } from './views/OntologyView';
import { SettingsView } from './views/SettingsView';

export function MainView() {
  const { activeView, matchingNoteId } = useView();
  const { settingsLoading } = useSettings();
  const { notes, notesLoading } = useNotes();

  if (notesLoading || settingsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  switch (activeView) {
    case 'notes':
      return <NotesView />;
    case 'ontology':
      return <OntologyView />;
    case 'map':
      return <MapView />;
    case 'network':
      const matchNote = matchingNoteId
        ? notes.find((n) => n.id === matchingNoteId)
        : null;
      return <NetworkView matchAgainst={matchNote} />;
    case 'chat':
      return <ChatView />;
    case 'settings':
      return <SettingsView />;
    case 'simulator':
      return <SimulatorView />;
    default:
      return null;
  }
}
