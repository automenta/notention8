import React from 'react';
import type { SimulationAgent } from '../../hooks/simulator/types';
import { SparklesIcon } from '../layout/icons';

interface SimulatorAgentEditorProps {
    agent: SimulationAgent;
    onUpdate: (updates: Partial<SimulationAgent>) => void;
    onRandomize: () => void;
}

export const SimulatorAgentEditor: React.FC<SimulatorAgentEditorProps> = ({
    agent,
    onUpdate,
    onRandomize
}) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-sm flex flex-col gap-3 shrink-0">
        <div className="flex gap-4">
            <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Name</label>
                <input
                    className="w-full bg-gray-950 text-sm text-gray-200 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-700"
                    value={agent.name}
                    onChange={e => onUpdate({ name: e.target.value })}
                    placeholder="Agent Name"
                />
            </div>
            <div className="flex-[3]">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio</label>
                 <textarea
                     className="w-full bg-gray-950 text-sm text-gray-300 border border-gray-700 rounded-md px-3 py-2 resize-none h-[42px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-700"
                     value={agent.bio}
                     onChange={e => onUpdate({ bio: e.target.value })}
                     placeholder="Agent Bio"
                 />
            </div>
        </div>
        <div className="flex justify-end">
            <button
                onClick={onRandomize}
                className="flex items-center gap-1.5 text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md border border-gray-700 hover:border-gray-600 transition-all shadow-sm"
            >
                <SparklesIcon className="w-3.5 h-3.5" />
                Randomize Identity
            </button>
        </div>
    </div>
  );
};
