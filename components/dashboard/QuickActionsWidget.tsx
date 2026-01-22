import React from 'react';
import { PencilIcon, NetworkIcon, ChatIcon, CpuChipIcon, ClockIcon } from '../layout/icons';

interface QuickActionsWidgetProps {
  onCreateNote: () => void;
  onNavigate: (view: string) => void;
  showSimulator?: boolean;
}

interface QuickActionBtnProps {
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    colorClass: string;
    hoverBorder: string;
    hoverShadow: string;
}

const QuickActionBtn: React.FC<QuickActionBtnProps> = ({ onClick, icon: Icon, label, colorClass, hoverBorder, hoverShadow }) => (
    <button
        onClick={onClick}
        className={`group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 ${hoverBorder} hover:shadow-lg ${hoverShadow}`}
    >
        <div className={`p-4 rounded-full transition-all transform group-hover:scale-110 ${colorClass} group-hover:text-white`}>
            <Icon className="h-8 w-8" />
        </div>
        <span className="font-medium text-gray-200 group-hover:text-white">{label}</span>
    </button>
);

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ onCreateNote, onNavigate, showSimulator }) => {
  return (
    <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionBtn
                onClick={onCreateNote}
                icon={PencilIcon}
                label="Write"
                colorClass="bg-blue-600/20 text-blue-400 group-hover:bg-blue-600"
                hoverBorder="hover:border-blue-500/50"
                hoverShadow="hover:shadow-blue-900/10"
            />
            <QuickActionBtn
                onClick={() => onNavigate('network')}
                icon={NetworkIcon}
                label="Network"
                colorClass="bg-green-600/20 text-green-400 group-hover:bg-green-600"
                hoverBorder="hover:border-green-500/50"
                hoverShadow="hover:shadow-green-900/10"
            />
            <QuickActionBtn
                onClick={() => onNavigate('chat')}
                icon={ChatIcon}
                label="Chat"
                colorClass="bg-purple-600/20 text-purple-400 group-hover:bg-purple-600"
                hoverBorder="hover:border-purple-500/50"
                hoverShadow="hover:shadow-purple-900/10"
            />
             <QuickActionBtn
                onClick={() => onNavigate('time')}
                icon={ClockIcon}
                label="Calendar"
                colorClass="bg-cyan-600/20 text-cyan-400 group-hover:bg-cyan-600"
                hoverBorder="hover:border-cyan-500/50"
                hoverShadow="hover:shadow-cyan-900/10"
            />
            {showSimulator && (
                <QuickActionBtn
                    onClick={() => onNavigate('simulator')}
                    icon={CpuChipIcon}
                    label="Simulator"
                    colorClass="bg-orange-600/20 text-orange-400 group-hover:bg-orange-600"
                    hoverBorder="hover:border-orange-500/50"
                    hoverShadow="hover:shadow-orange-900/10"
                />
            )}
        </div>
    </div>
  );
};
