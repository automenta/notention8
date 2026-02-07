import React from 'react';
import type { SimulationAgent } from '../../hooks/simulator/types';
import { SparklesIcon } from '../layout/icons';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

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
                <Input
                    label="Name"
                    value={agent.name}
                    onChange={e => onUpdate({ name: e.target.value })}
                    placeholder="Agent Name"
                />
            </div>
            <div className="flex-[3]">
                 <label className="block text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Bio</label>
                 <textarea
                     className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-500 resize-none h-[46px]"
                     value={agent.bio}
                     onChange={e => onUpdate({ bio: e.target.value })}
                     placeholder="Agent Bio"
                 />
            </div>
        </div>
        <div className="flex justify-end">
            <Button
                onClick={onRandomize}
                variant="secondary"
                size="xs"
                icon={SparklesIcon}
            >
                Randomize Identity
            </Button>
        </div>
    </div>
  );
};
