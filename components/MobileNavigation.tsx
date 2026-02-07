import React from 'react';
import { useView } from '../hooks/useViewContext';
import { HomeIcon, NoteIcon, ChatIcon, SearchIcon } from './icons';
import type { View } from '../types';

interface MobileNavigationProps {
    onOpenPalette: () => void;
}

export function MobileNavigation({ onOpenPalette }: MobileNavigationProps) {
  const { activeView, setActiveView } = useView();

  const navItems: { view: View; label: string; icon: React.FC<any> }[] = [
    { view: 'dashboard', label: 'Home', icon: HomeIcon },
    { view: 'notes', label: 'Notes', icon: NoteIcon },
    { view: 'chat', label: 'Chat', icon: ChatIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              activeView === item.view ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onOpenPalette}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-gray-300"
        >
          <SearchIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium">Search</span>
        </button>
      </div>
    </div>
  );
}
