import React, { useState } from 'react';

import { MainView } from './components/layout/MainView';
import { Sidebar } from './components/sidebar';
import { useNotes } from './hooks/useNotes';
import { useSortedFilteredNotes } from './hooks/useSortedFilteredNotes';
import { useView } from './hooks/useViewContext';
import { useUrlRouting } from './hooks/useUrlRouting';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { useCommands } from './hooks/useCommands';
import { Layout } from './components/layout/Layout';

function App() {
  const { notes, addNote } = useNotes();
  const {
    activeView,
    setActiveView,
    selectedNoteId,
    setSelectedNoteId,
    searchTerm,
    sortOrder,
    isSidebarOpen,
    userLocation,
  } = useView();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const sortedNotes = useSortedFilteredNotes(notes, searchTerm, sortOrder, activeView === 'trash', userLocation);

  useUrlRouting({
      activeView,
      setActiveView,
      selectedNoteId,
      setSelectedNoteId
  });

  const { commands, handleNewNote } = useCommands({ setIsHelpOpen });

  const handleCreateNote = (title: string) => {
      const newNote = addNote({ title });
      setSelectedNoteId(newNote.id);
      setActiveView('notes');
  };

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
    <Layout
      activeView={activeView}
      selectedNoteId={selectedNoteId}
      isSidebarOpen={isSidebarOpen}
      onNewNote={handleNewNote}
      onOpenPalette={() => setIsPaletteOpen(true)}
      isPaletteOpen={isPaletteOpen}
      setIsPaletteOpen={setIsPaletteOpen}
      isHelpOpen={isHelpOpen}
      setIsHelpOpen={setIsHelpOpen}
      notes={sortedNotes}
      onSelectNote={(id) => {
          setSelectedNoteId(id);
          setActiveView('notes');
      }}
      onCreateNote={handleCreateNote}
      commands={commands}
      sidebar={<Sidebar sortedNotes={sortedNotes} />}
    >
        <MainView sortedNotes={sortedNotes} />
    </Layout>
  );
}

export default App;
