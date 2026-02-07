import React from 'react';
import { PlusIcon, MapIcon, ChatIcon, CubeIcon } from '../layout/icons';

interface QuickActionsWidgetProps {
  onCreateNote: () => void;
  onNavigate: (view: string) => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ onCreateNote, onNavigate }) => {
  return (
    <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={onCreateNote} className="group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10">
                <div className="p-4 bg-blue-600/20 text-blue-400 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110">
                    <PlusIcon className="h-8 w-8" />
                </div>
                <span className="font-medium text-gray-200 group-hover:text-white">New Note</span>
            </button>
            <button onClick={() => onNavigate('map')} className="group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-900/10">
                <div className="p-4 bg-green-600/20 text-green-400 rounded-full group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:scale-110">
                    <MapIcon className="h-8 w-8" />
                </div>
                <span className="font-medium text-gray-200 group-hover:text-white">Map View</span>
            </button>
            <button onClick={() => onNavigate('chat')} className="group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/10">
                <div className="p-4 bg-purple-600/20 text-purple-400 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:scale-110">
                    <ChatIcon className="h-8 w-8" />
                </div>
                <span className="font-medium text-gray-200 group-hover:text-white">Chat</span>
            </button>
            <button onClick={() => onNavigate('simulator')} className="group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-900/10">
                <div className="p-4 bg-orange-600/20 text-orange-400 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:scale-110">
                    <CubeIcon className="h-8 w-8" />
                </div>
                <span className="font-medium text-gray-200 group-hover:text-white">Simulator</span>
            </button>
        </div>
    </div>
  );
};
