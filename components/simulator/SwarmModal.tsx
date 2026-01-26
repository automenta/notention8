import React from 'react';
import { SWARM_TEMPLATES } from '../../hooks/simulator/types';
import type { SwarmTemplate } from '../../hooks/simulator/types';

interface SwarmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeploy: (template: SwarmTemplate) => void;
}

export const SwarmModal: React.FC<SwarmModalProps> = ({ isOpen, onClose, onDeploy }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-[480px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold text-white">Deploy Swarm</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {SWARM_TEMPLATES.map(template => (
                        <div key={template.id} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded p-3 cursor-pointer transition-colors group"
                             onClick={() => onDeploy(template)}>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-blue-400 group-hover:text-blue-300">{template.name}</h3>
                                <span className="text-xs bg-gray-900 px-2 py-0.5 rounded text-gray-500">{template.agents.length} Agents</span>
                            </div>
                            <p className="text-xs text-gray-400">{template.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
