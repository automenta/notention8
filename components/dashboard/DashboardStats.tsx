import React from 'react';
import { NoteIcon, HomeIcon } from '../layout/icons';

interface DashboardStatsProps {
  totalNotes: number;
  pinnedNotes: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ totalNotes, pinnedNotes }) => {
  const stats = [
    { label: 'Total Notes', value: totalNotes, icon: NoteIcon, color: 'text-blue-400', bg: 'bg-blue-600/20' },
    { label: 'Pinned', value: pinnedNotes, icon: HomeIcon, color: 'text-yellow-400', bg: 'bg-yellow-600/20' },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
         {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/30 min-w-[140px]">
                <div className={`p-2 rounded-md ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                </div>
            </div>
        ))}
    </div>
  );
};
