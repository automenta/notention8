import React from 'react';

import { useSettings } from '../hooks/useSettingsContext';
import { useView } from '../hooks/useViewContext';
import type { View } from '../types';
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

interface NavButtonProps {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}

function NavButton({
  icon,
  label,
  isActive,
  onClick,
  badgeCount,
}: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative p-2 rounded-md transition-colors ${
        isActive
          ? 'bg-blue-600/30 text-white'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
      }`}
    >
      {React.cloneElement(icon, { className: 'h-6 w-6' })}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-gray-900">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  );
}

export function Header({ onNewNote, onOpenPalette }: HeaderProps) {
  const { activeView, setActiveView, notificationCount, isSidebarOpen, setIsSidebarOpen, chatNotificationCount } = useView();
  const { settings } = useSettings();

  const navItems: {
    view: View;
    label: string;
    icon: React.ReactElement;
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
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          className="hidden md:block p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-md"
        >
          <SidebarIcon className="h-6 w-6" />
        </button>

        <button
          onClick={onNewNote}
          title="New Note"
          className="flex items-center gap-2 px-3 py-1.5 transition-colors rounded-lg bg-blue-600 text-white hover:bg-blue-700 ml-4"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onOpenPalette}
          title="Search & Commands (Ctrl+K)"
          className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-md"
        >
          <SearchIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Center Section - Navigation */}
      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <NavButton
            key={item.view}
            icon={item.icon}
            label={item.label}
            isActive={activeView === item.view}
            onClick={() => setActiveView(item.view)}
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
