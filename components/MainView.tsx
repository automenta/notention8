import React from 'react';
import type { Note } from '../types';

import { useNotes } from '../hooks/useNotes';
import { useSettings } from '../hooks/useSettingsContext';
import { useView } from '../hooks/useViewContext';
import { useBackgroundMatcher } from '../hooks/useBackgroundMatcher';
import { LoadingSpinner } from './icons';
import { SimulatorView } from './simulator/SimulatorView';
import { ChatView } from './views/ChatView';
import { MapView } from './views/MapView';
import { NetworkView } from './views/NetworkView';
import { NotesView } from './views/NotesView';
import { OntologyView } from './views/OntologyView';
import { SettingsView } from './views/SettingsView';

interface MainViewProps {
  sortedNotes?: Note[];
}

export function MainView({ sortedNotes }: MainViewProps) {
  const { activeView, matchingNoteId, toast } = useView();
  const { settingsLoading } = useSettings();
  const { notes, notesLoading } = useNotes();

  // Run background matching
  useBackgroundMatcher();

  if (notesLoading || settingsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'notes':
        return <NotesView sortedNotes={sortedNotes} />;
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
  };

  return (
    <div className="relative h-full">
      {renderView()}
      {toast && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-500/50 z-50 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
