import React, { useState, useEffect } from 'react';

import { useSettings } from '../../hooks/useSettingsContext';
import { useView } from '../../hooks/useViewContext';
import { useNotes } from '../../hooks/useNotes';
import { parseProperties } from '../../utils/parsing';
import type { View } from '../../types';
import { NavButton } from './NavButton';
import { IconButton } from '../common/IconButton';
import {
  ChatIcon,
  MapIcon,
  NetworkIcon,
  NoteIcon,
  OntologyIcon,
  PlusIcon,
  SettingsIcon,
  SearchIcon,
  SidebarIcon,
  ClockIcon,
  ChevronDownIcon,
  SparklesIcon,
  CubeTransparentIcon,
  HomeIcon,
  CpuChipIcon
} from './icons';

interface HeaderProps {
  onNewNote: () => void;
  onOpenPalette?: () => void;
}

const NewNoteButton = ({ onNewNote, onCreateIntent }: { onNewNote: () => void, onCreateIntent: (type: 'request' | 'offer') => void }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleIntentClick = (type: 'request' | 'offer') => {
        onCreateIntent(type);
        setIsDropdownOpen(false);
    }

    return (
        <div className="relative ml-4" ref={dropdownRef}>
            <div className="flex bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                <button
                    onClick={onNewNote}
                    className="flex items-center gap-2 px-3 py-2 text-white font-medium border-r border-blue-500 rounded-l-lg hover:bg-blue-800/20"
                    title="New Note"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">New Note</span>
                </button>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-2 py-2 text-white hover:bg-blue-800/20 rounded-r-lg"
                    title="More options"
                >
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
            </div>

            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
                    <button
                        onClick={() => handleIntentClick('request')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center gap-3 group"
                    >
                        <div className="p-1.5 bg-purple-900/50 rounded-md group-hover:bg-purple-900 transition-colors">
                            <SparklesIcon className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-200">New Request</div>
                            <div className="text-xs text-gray-500">Find something</div>
                        </div>
                    </button>
                    <button
                        onClick={() => handleIntentClick('offer')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center gap-3 group"
                    >
                        <div className="p-1.5 bg-green-900/50 rounded-md group-hover:bg-green-900 transition-colors">
                            <CubeTransparentIcon className="w-4 h-4 text-green-400" />
                        </div>
                         <div>
                            <div className="text-sm font-medium text-gray-200">New Offer</div>
                            <div className="text-xs text-gray-500">Provide services</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

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

        <NewNoteButton onNewNote={onNewNote} onCreateIntent={handleCreateIntent} />

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
