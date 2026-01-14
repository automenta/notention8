import React, { useMemo, useState } from 'react';

import { Header } from './components/Header';
import { MainView } from './components/MainView';
import { Sidebar } from './components/sidebar';
import { useAutoSelectNote } from './hooks/useAutoSelectNote';
import { useNotes } from './hooks/useNotes';
import { useView } from './hooks/useViewContext';
import { useSettings } from './hooks/useSettingsContext';
import { sortNotesByDate } from './utils/notes';
import { CommandPalette } from './components/common/CommandPalette';
import { HelpModal } from './components/common/HelpModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import {
    PlusIcon,
    SettingsIcon,
    MapIcon,
    NetworkIcon,
    OntologyIcon,
    CubeIcon,
    ChatIcon,
    CodeBracketsIcon,
    HelpIcon
} from './components/icons';

function App() {
  const { notes, addNote, notesLoading } = useNotes();
  const { activeView, setActiveView, selectedNoteId, setSelectedNoteId } =
    useView();
  const { settings, setSettings } = useSettings();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const sortedNotes = useMemo(() => sortNotesByDate(notes), [notes]);

  useAutoSelectNote({
    activeView,
    notesLoading,
    selectedNoteId,
    sortedNotes,
    setSelectedNoteId,
  });

  const handleNewNote = () => {
    const newNote = addNote();
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
  };

  const commands = [
      {
          label: 'New Note',
          icon: <PlusIcon className="h-5 w-5" />,
          action: handleNewNote
      },
      {
          label: 'Go to Notes',
          icon: <span className="h-5 w-5 text-center">📝</span>,
          action: () => setActiveView('notes')
      },
      {
          label: 'Go to Map',
          icon: <MapIcon className="h-5 w-5" />,
          action: () => setActiveView('map')
      },
      {
          label: 'Go to Network',
          icon: <NetworkIcon className="h-5 w-5" />,
          action: () => setActiveView('network')
      },
      {
          label: 'Go to Ontology',
          icon: <OntologyIcon className="h-5 w-5" />,
          action: () => setActiveView('ontology')
      },
      {
          label: 'Go to Chat',
          icon: <ChatIcon className="h-5 w-5" />,
          action: () => setActiveView('chat')
      },
      {
          label: 'Go to Settings',
          icon: <SettingsIcon className="h-5 w-5" />,
          action: () => setActiveView('settings')
      },
      {
          label: 'Open Help & Shortcuts',
          icon: <HelpIcon className="h-5 w-5" />,
          action: () => setIsHelpOpen(true)
      },
      {
          label: settings.developerMode ? 'Disable Developer Mode' : 'Enable Developer Mode',
          icon: <CodeBracketsIcon className="h-5 w-5" />,
          action: () => setSettings((s) => ({ ...s, developerMode: !s.developerMode }))
      },
  ];

  if (settings.developerMode) {
      commands.push({
          label: 'Go to Simulator',
          icon: <CubeIcon className="h-5 w-5" />,
          action: () => setActiveView('simulator')
      });
  }

  useGlobalShortcuts({
      onNewNote: handleNewNote,
      onSearch: () => {
          const searchInput = document.getElementById('sidebar-search-input');
          if (searchInput) {
              searchInput.focus();
              if (activeView !== 'notes') {
                  setActiveView('notes');
              }
          }
      },
      onCommandPalette: () => setIsPaletteOpen(true)
  });

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
      <Header onNewNote={handleNewNote} onOpenPalette={() => setIsPaletteOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {activeView === 'notes' && (
          <div
            className={`
                w-full md:w-[320px] flex-shrink-0 bg-gray-900 border-r border-gray-700/50
                ${selectedNoteId ? 'hidden md:block' : 'block'}
            `}
          >
            <Sidebar />
          </div>
        )}

        <main
          className={`
                flex-1 p-3 overflow-hidden
                ${activeView === 'notes' && !selectedNoteId ? 'hidden md:block' : 'block'}
            `}
        >
          <MainView />
        </main>
      </div>
      <CommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          notes={sortedNotes}
          onSelectNote={(id) => {
              setSelectedNoteId(id);
              setActiveView('notes');
          }}
          commands={commands}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;
