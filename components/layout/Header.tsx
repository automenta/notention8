import React, { useState, useEffect } from 'react';

import { useSettings } from '../../hooks/useSettingsContext';
import { useView } from '../../hooks/useViewContext';
import { useNotes } from '../../hooks/useNotes';
import { parseProperties } from '../../utils/parsing';
import { DEFAULT_TEMPLATES } from '../../utils/templates';
import type { View, Template } from '../../types';
import { NavButton } from './NavButton';
import { IconButton } from '../common/IconButton';
import {
  ChatIcon,
  MapIcon,
  NetworkIcon,
  NoteIcon,
  OntologyIcon,
  SettingsIcon,
  SearchIcon,
  SidebarIcon,
  ClockIcon,
  HomeIcon,
  CpuChipIcon
} from './icons';
import { NewNoteButton } from './NewNoteButton';

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
  const { addNote, updateNote } = useNotes();

  const handleNavClick = (view: View) => {
      if (view === 'notes' && activeView === 'notes' && selectedNoteId) {
          setSelectedNoteId(null);
      } else {
          setActiveView(view);
      }
  };

  const handleCreateIntent = (type: 'request' | 'offer') => {
      const isRequest = type === 'request';
      const content = isRequest
        ? `#request\n[intent:is:request]\n[status:is:open]\n\nI am looking for...`
        : `#offer\n[intent:is:offer]\n[status:is:available]\n\nI can provide...`;

      const newNote = addNote({
          title: isRequest ? 'New Request' : 'New Offer'
      });

      const properties = parseProperties(content);
      updateNote({
          ...newNote,
          content,
          properties
      });

      setSelectedNoteId(newNote.id);
      setActiveView('notes');
  };

  const handleCreateFromTemplate = (template: Template) => {
      const newNote = addNote();
      const properties = parseProperties(template.content);

      updateNote({
          ...newNote,
          content: template.content,
          properties
      });

      setSelectedNoteId(newNote.id);
      setActiveView('notes');
  };

  const allTemplates = [...DEFAULT_TEMPLATES, ...settings.customTemplates];

  const navItems: {
    view: View;
    label: string;
    icon: React.ReactElement<{ className?: string }>;
    badgeCount?: number;
  }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
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
      icon: <CpuChipIcon />,
    });
  }

  return (
    <header className="flex-shrink-0 bg-gray-900 h-16 px-4 flex items-center justify-between border-b border-gray-700/50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <IconButton
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          tooltip={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          tooltipPosition="bottom"
          icon={SidebarIcon}
          variant="ghost"
          size="lg"
          className="hidden md:flex"
        />

        <NewNoteButton
            onNewNote={onNewNote}
            onCreateIntent={handleCreateIntent}
            templates={allTemplates}
            onCreateFromTemplate={handleCreateFromTemplate}
        />

        <IconButton
            onClick={onOpenPalette}
            tooltip="Search & Commands (Ctrl+K)"
            tooltipPosition="bottom"
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
            tooltip={item.label}
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
          tooltip="Settings"
          isActive={activeView === 'settings'}
          onClick={() => setActiveView('settings')}
        />
      </div>
    </header>
  );
}
