import React from 'react';
import type { SidebarViewMode } from '../../types';
import { ListUlIcon, CubeIcon, TagIcon } from '../layout/icons';

interface ViewSelectorProps {
  viewMode: SidebarViewMode;
  onViewChange: (mode: SidebarViewMode) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ viewMode, onViewChange }) => {
  const options: { mode: SidebarViewMode; icon: React.FC<any>; label: string }[] = [
    { mode: 'list', icon: ListUlIcon, label: 'List' },
    { mode: 'grid', icon: CubeIcon, label: 'Grid' },
    { mode: 'cloud', icon: TagIcon, label: 'Tag Cloud' },
  ];

  return (
    <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
      {options.map((option) => (
        <button
          key={option.mode}
          onClick={() => onViewChange(option.mode)}
          className={`p-1.5 rounded-md flex-1 flex justify-center items-center transition-colors ${
            viewMode === option.mode
              ? 'bg-gray-700 text-blue-400'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
          }`}
          title={`View as ${option.label}`}
        >
          <option.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
};
