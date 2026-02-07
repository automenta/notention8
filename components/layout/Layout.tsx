import React from 'react';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { CommandPalette } from '../common/CommandPalette';
import { HelpModal } from '../common/HelpModal';
import type { Note, View } from '../../types';

interface Command {
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

interface LayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;

  activeView: View;
  selectedNoteId: string | null;
  isSidebarOpen: boolean;

  onNewNote: () => void;
  onOpenPalette: () => void;

  isPaletteOpen: boolean;
  setIsPaletteOpen: (isOpen: boolean) => void;

  isHelpOpen: boolean;
  setIsHelpOpen: (isOpen: boolean) => void;

  notes: Note[];
  onSelectNote: (id: string) => void;
  onCreateNote: (title: string) => void;
  commands: Command[];
}

export function Layout({
  children,
  sidebar,
  activeView,
  selectedNoteId,
  isSidebarOpen,
  onNewNote,
  onOpenPalette,
  isPaletteOpen,
  setIsPaletteOpen,
  isHelpOpen,
  setIsHelpOpen,
  notes,
  onSelectNote,
  onCreateNote,
  commands
}: LayoutProps) {

  const sidebarClasses = [
    'flex-shrink-0 bg-gray-900 border-r border-gray-700/50',
    'transition-all duration-300 ease-in-out',
    activeView === 'notes' && !selectedNoteId ? 'w-full block' : 'hidden md:block',
    isSidebarOpen ? 'md:w-[320px]' : 'md:w-0 md:border-r-0 overflow-hidden'
  ].filter(Boolean).join(' ');

  const mainClasses = [
    'flex-1 p-3 overflow-hidden pb-20 md:pb-3',
    activeView === 'notes' && !selectedNoteId ? 'hidden md:block' : 'block'
  ].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-gray-200">
      <Header onNewNote={onNewNote} onOpenPalette={onOpenPalette} />
      <div className="flex flex-1 overflow-hidden">
        <div className={sidebarClasses}>
          {sidebar}
        </div>

        <main className={mainClasses}>
          {children}
        </main>
      </div>
      <MobileNavigation onOpenPalette={onOpenPalette} />
      <CommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          notes={notes}
          onSelectNote={onSelectNote}
          onCreateNote={onCreateNote}
          commands={commands}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
