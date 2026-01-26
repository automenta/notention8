import React from 'react';
import { SWARM_TEMPLATES } from '../../hooks/simulator/types';
import type { SwarmTemplate } from '../../hooks/simulator/types';
import { Modal } from '../common/Modal';

interface SwarmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeploy: (template: SwarmTemplate) => void;
}

export const SwarmModal: React.FC<SwarmModalProps> = ({ isOpen, onClose, onDeploy }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Deploy Swarm"
            className="max-w-lg"
        >
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {SWARM_TEMPLATES.map(template => (
                    <div
                        key={template.id}
                        className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded p-3 cursor-pointer transition-colors group"
                        onClick={() => onDeploy(template)}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-blue-400 group-hover:text-blue-300">{template.name}</h3>
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-500 border border-gray-700">{template.agents.length} Agents</span>
                        </div>
                        <p className="text-xs text-gray-400">{template.description}</p>
                    </div>
                ))}
            </div>
        </Modal>
    );
};
