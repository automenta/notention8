import React from 'react';

import { useSettings } from '../../hooks/useSettingsContext';
import { useView } from '../../hooks/useViewContext';
import type { View } from '../../types';
import { NavButton } from './NavButton';
import { IconButton } from '../common/IconButton';
import {
  ChatIcon,
  CubeTransparentIcon,
  MapIcon,
  NetworkIcon,
  NoteIcon,
  OntologyIcon,
  PlusIcon,
  SettingsIcon,
  SearchIcon,
  SidebarIcon,
  ClockIcon,
} from './icons';

interface HeaderProps {
  onNewNote: () => void;
  onOpenPalette?: () => void;
}

export function Header({ onNewNote, onOpenPalette }: HeaderProps) {
  const {
      activeView,
      setActiveView,
      notificationCount,
      isSidebarOpen,
      setIsSidebarOpen,
      chatNotificationCount,
      selectedNoteId,
      setSelectedNoteId
  } = useView();
  const { settings } = useSettings();

  const handleNavClick = (view: View) => {
      if (view === 'notes' && activeView === 'notes' && selectedNoteId) {
          setSelectedNoteId(null);
      } else {
          setActiveView(view);
      }
  };

  const navItems: {
    view: View;
    label: string;
    icon: React.ReactElement<{ className?: string }>;
    badgeCount?: number;
  }[] = [
    { view: 'notes', label: 'Notes', icon: <NoteIcon /> },
    { view: 'map', label: 'Map', icon: <MapIcon /> },
    { view: 'time', label: 'Time', icon: <ClockIcon /> },
    {
      view: 'network',
      label: 'Network',
      icon: <NetworkIcon />,
      badgeCount: notificationCount,
    },
    { view: 'chat', label: 'Chat', icon: <ChatIcon />, badgeCount: chatNotificationCount },
    { view: 'ontology', label: 'Ontology', icon: <OntologyIcon /> },
  ];

  if (settings.developerMode) {
    navItems.push({
      view: 'simulator',
      label: 'Simulator',
      icon: <CubeTransparentIcon />,
    });
  }

  return (
    <header className="flex-shrink-0 bg-gray-900 h-16 px-4 flex items-center justify-between border-b border-gray-700/50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <IconButton
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          icon={SidebarIcon}
          variant="ghost"
          size="lg"
          className="hidden md:flex"
        />

        <button
          onClick={onNewNote}
          title="New Note"
          className="flex items-center gap-2 px-3 py-1.5 transition-colors rounded-lg bg-blue-600 text-white hover:bg-blue-700 ml-4"
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        <IconButton
            onClick={onOpenPalette}
            title="Search & Commands (Ctrl+K)"
            icon={SearchIcon}
            variant="ghost"
            size="lg"
        />
      </div>

      {/* Center Section - Navigation */}
      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <NavButton
            key={item.view}
            icon={item.icon}
            label={item.label}
            isActive={activeView === item.view}
            onClick={() => handleNavClick(item.view)}
            badgeCount={item.badgeCount}
          />
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        <NavButton
          icon={<SettingsIcon />}
          label="Settings"
          isActive={activeView === 'settings'}
          onClick={() => setActiveView('settings')}
        />
      </div>
    </header>
  );
}
