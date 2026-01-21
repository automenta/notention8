import React from 'react';
import { CubeIcon, CpuChipIcon, PlusIcon, UserGroupIcon, DownloadIcon } from "../layout/icons";
import { Badge } from '../common/Badge';
import { IconButton } from '../common/IconButton';
import type { SimulationAgent } from '../../hooks/simulator/types';

interface SimulatorSidebarProps {
  aiProviderName: string;
  active: boolean;
  setActive: (active: boolean) => void;
  importUserNotes: () => void;
  selectedView: string;
  setSelectedView: (view: string) => void;
  addAgent: () => void;
  onOpenSwarmModal: () => void;
  agents: SimulationAgent[];
  notifications: Record<string, unknown[]>;
}

export const SimulatorSidebar: React.FC<SimulatorSidebarProps> = ({
  aiProviderName,
  active,
  setActive,
  importUserNotes,
  selectedView,
  setSelectedView,
  addAgent,
  onOpenSwarmModal,
  agents,
  notifications
}) => {
  const isMock = aiProviderName.includes("Mock");

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-800 flex flex-col gap-3">
        <h1 className="text-lg font-bold flex items-center gap-2 text-white">
            <span className="text-xl">🧪</span> Simulator
        </h1>
        <div className="flex justify-between items-center bg-gray-950 p-2 rounded-lg border border-gray-800">
            <Badge variant={isMock ? 'warning' : 'success'} size="sm">
                AI: {aiProviderName}
            </Badge>
            <button
                onClick={() => setActive(!active)}
                className={`px-3 py-0.5 rounded text-xs font-bold transition-all shadow-lg ${
                    active
                    ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20'
                }`}
            >
                {active ? 'STOP' : 'START'}
            </button>
        </div>

        <button
            onClick={importUserNotes}
            className="w-full text-[10px] bg-gray-800 hover:bg-gray-750 text-gray-300 py-2 rounded-lg border border-gray-700 transition-all hover:border-gray-500 flex justify-center items-center gap-2"
        >
            <DownloadIcon className="w-3 h-3" />
            <span>Import My Notes</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <button
            onClick={() => setSelectedView('overview')}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-all ${
                selectedView === 'overview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
              <CubeIcon className="w-5 h-5" />
              Overview
          </button>

          <div className="mt-6 mb-2 px-3 flex justify-between items-center group">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors">Agents</span>
              <div className="flex gap-1 opacity-100 transition-opacity">
                   <IconButton
                       onClick={addAgent}
                       title="Add Single Agent"
                       icon={PlusIcon}
                       variant="secondary"
                       size="sm"
                   />
                  <button
                      onClick={onOpenSwarmModal}
                      className="px-2 py-1 rounded bg-blue-900/20 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 border border-blue-900/50 text-[10px] font-bold transition-all flex items-center gap-1"
                      title="Deploy Agent Swarm"
                    >
                      <UserGroupIcon className="w-3 h-3" />
                      SWARM
                  </button>
              </div>
          </div>

          <div className="space-y-1">
            {agents.map(agent => {
                const isSelected = selectedView === agent.id;
                const hasNotification = notifications[agent.id]?.length > 0;

                return (
                    <button
                        key={agent.id}
                        onClick={() => setSelectedView(agent.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-all border border-transparent ${
                            isSelected
                            ? 'bg-gray-800 text-white border-gray-700 shadow-sm'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                        }`}
                    >
                        <div className="relative">
                            <CpuChipIcon className={`w-5 h-5 ${agent.status === 'Typing...' ? 'text-green-400 animate-pulse' : 'text-gray-500'}`} />
                            {hasNotification && (
                                 <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-900"></span>
                            )}
                        </div>
                        <span className="truncate flex-1">{agent.name}</span>
                    </button>
                );
            })}
          </div>
      </div>
    </div>
  );
};
