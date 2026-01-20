import React from 'react';
import type { SimulationAgent } from '../../hooks/simulator/types';

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
    <div className="bg-gray-900 p-4 rounded border border-gray-800 flex flex-col gap-2 shrink-0">
        <div className="flex gap-4">
            <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Name</label>
                <input
                    className="w-full bg-black text-sm text-gray-200 border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    value={agent.name}
                    onChange={e => onUpdate({ name: e.target.value })}
                />
            </div>
            <div className="flex-[3]">
                 <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Bio</label>
                 <textarea
                     className="w-full bg-black text-sm text-gray-300 border border-gray-700 rounded p-1 resize-none h-[38px] focus:outline-none focus:border-blue-500"
                     value={agent.bio}
                     onChange={e => onUpdate({ bio: e.target.value })}
                     placeholder="Agent Bio"
                 />
            </div>
        </div>
        <div className="flex justify-end">
            <button
                onClick={onRandomize}
                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-700 transition-colors"
            >
                🎲 Randomize Identity
            </button>
        </div>
    </div>
  );
};
