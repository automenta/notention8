import React, { useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainView } from './components/MainView';
import { useNotes } from './hooks/useNotes';
import { useView } from './hooks/useViewContext';
import { sortNotesByDate } from './utils/notes';
import { useAutoSelectNote } from './hooks/useAutoSelectNote';

const App: React.FC = () => {
  const { notes, addNote, notesLoading } = useNotes();
  const { activeView, setActiveView, selectedNoteId, setSelectedNoteId } =
    useView();

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

  const isMobile = window.innerWidth < 768; // Simple check, or use media query hook
  // Better to use CSS classes for responsiveness, but logic might need to know.
  // Actually, we can use CSS `hidden md:block` classes.

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
      <Header onNewNote={handleNewNote} />
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
    </div>
  );
};

export default App;
