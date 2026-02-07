import React, { useState } from 'react';

import { Header } from './components/Header';
import { MainView } from './components/MainView';
import { MobileNavigation } from './components/MobileNavigation';
import { Sidebar } from './components/sidebar';
import { useNotes } from './hooks/useNotes';
import { useSortedFilteredNotes } from './hooks/useSortedFilteredNotes';
import { useView } from './hooks/useViewContext';
import { useSettings } from './hooks/useSettingsContext';
import { useUrlRouting } from './hooks/useUrlRouting';
import { useToast } from './components/contexts/ToastContext';
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
    HelpIcon,
    SidebarIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    DownloadIcon,
    HomeIcon
} from './components/icons';

function App() {
  const { notes, addNote, notesLoading } = useNotes();
  const {
    activeView,
    setActiveView,
    selectedNoteId,
    setSelectedNoteId,
    searchTerm,
    sortOrder,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useView();
  const { settings, setSettings } = useSettings();
  const { addToast } = useToast();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const sortedNotes = useSortedFilteredNotes(notes, searchTerm, sortOrder, activeView === 'trash');

  useUrlRouting({
      activeView,
      setActiveView,
      selectedNoteId,
      setSelectedNoteId
  });

  const handleNewNote = () => {
    const newNote = addNote();
    setSelectedNoteId(newNote.id);
    setActiveView('notes');
  };

  const handleCreateNote = (title: string) => {
      const newNote = addNote({ title });
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
          label: isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar',
          icon: <SidebarIcon className="h-5 w-5" />,
          action: () => setIsSidebarOpen(!isSidebarOpen)
      },
      {
          label: 'Go to Dashboard',
          icon: <HomeIcon className="h-5 w-5" />,
          action: () => setActiveView('dashboard')
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
          label: 'Go to Trash',
          icon: <TrashIcon className="h-5 w-5" />,
          action: () => setActiveView('trash')
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

  if (activeView === 'notes' && selectedNoteId) {
      commands.push({
          label: 'Copy Note ID',
          icon: <DocumentDuplicateIcon className="h-5 w-5" />,
          action: () => {
              navigator.clipboard.writeText(selectedNoteId);
              addToast('Note ID copied to clipboard', 'success');
          }
      });
      commands.push({
          label: 'Download Note JSON',
          icon: <DownloadIcon className="h-5 w-5" />,
          action: () => {
              const note = notes.find(n => n.id === selectedNoteId);
              if (note) {
                  const blob = new Blob([JSON.stringify(note, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `note-${note.title || 'untitled'}-${note.id.slice(0, 8)}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  addToast('Note downloaded', 'success');
              }
          }
      });
  }

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
        <div
          className={`
              flex-shrink-0 bg-gray-900 border-r border-gray-700/50 transition-all duration-300 ease-in-out
              ${activeView === 'notes' && !selectedNoteId ? 'w-full block' : 'hidden md:block'}
              ${isSidebarOpen ? 'md:w-[320px]' : 'md:w-0 md:border-r-0 overflow-hidden'}
          `}
        >
          <Sidebar sortedNotes={sortedNotes} />
        </div>

        <main
          className={`
                flex-1 p-3 overflow-hidden pb-20 md:pb-3
                ${activeView === 'notes' && !selectedNoteId ? 'hidden md:block' : 'block'}
            `}
        >
          <MainView sortedNotes={sortedNotes} />
        </main>
      </div>
      <MobileNavigation onOpenPalette={() => setIsPaletteOpen(true)} />
      <CommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          notes={sortedNotes}
          onSelectNote={(id) => {
              setSelectedNoteId(id);
              setActiveView('notes');
          }}
          onCreateNote={handleCreateNote}
          commands={commands}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;
