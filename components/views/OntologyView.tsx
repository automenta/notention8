import React, { useState } from 'react';
import type { OntologyNode } from '../../types';
import { ChevronDownIcon } from '../icons';
import { useSettings } from '../../hooks/useSettingsContext';
import { SimulatorView } from '../simulator/SimulatorView';
import { useGardener } from '../../hooks/useGardener';
import { useNotes } from '../../hooks/useNotes';

interface OntologyNodeProps {
  node: OntologyNode;
  level: number;
}

const OntologyNodeItem: React.FC<OntologyNodeProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first few levels
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ paddingLeft: `${level * 1.5}rem` }}>
      <div
        className="flex items-center py-2 cursor-pointer group"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          <ChevronDownIcon
            className={`h-5 w-5 mr-2 text-gray-500 transition-transform transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          />
        ) : (
          <div className="w-5 h-5 mr-2" /> // Placeholder for alignment
        )}
        <span className="font-semibold text-blue-400">#{node.label}</span>
        {node.description && (
          <span className="ml-4 text-sm text-gray-400 hidden md:inline group-hover:inline">
            - {node.description}
          </span>
        )}
      </div>
      {isOpen && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <OntologyNodeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const OntologyView: React.FC = () => {
  const { settings } = useSettings();
  const ontology = settings.ontology;
  const { notes } = useNotes();
  const { evolveOntology } = useGardener();
  const [activeTab, setActiveTab] = useState<'graph' | 'simulator'>('graph');
  const [isEvolving, setIsEvolving] = useState(false);

  const handleEvolve = async () => {
    setIsEvolving(true);
    await evolveOntology(notes);
    setIsEvolving(false);
    alert('Ontology updated based on local notes!');
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Ontology</h1>
            {settings.developerMode && (
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleEvolve}
                        disabled={isEvolving}
                        className="text-sm bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                        {isEvolving ? 'Gardening...' : 'Run Gardener'}
                    </button>
                    <div className="flex bg-gray-900 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('graph')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'graph' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Graph
                    </button>
                    <button
                        onClick={() => setActiveTab('simulator')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'simulator' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Simulator
                    </button>
                </div>
                </div>
            )}
        </div>

        {activeTab === 'simulator' && settings.developerMode ? (
            <SimulatorView />
        ) : (
            <>
                <p className="text-gray-400 mb-8">
                  This is the semantic structure that powers your notes. Use these
                  concepts as `#tags` to create machine-readable, interconnected
                  knowledge.
                </p>
                <div className="bg-gray-900/70 p-6 rounded-lg">
                  {ontology.map((rootNode) => (
                    <OntologyNodeItem key={rootNode.id} node={rootNode} level={0} />
                  ))}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
