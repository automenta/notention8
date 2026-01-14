import React from 'react';

import { useOntologyView } from '../../hooks/useOntologyView';
import { OntologyNodeItem } from '../ontology/OntologyNodeItem';
import { SimulatorView } from '../simulator/SimulatorView';

export function OntologyView() {
  const {
    settings,
    ontology,
    activeTab,
    setActiveTab,
    isEvolving,
    handleEvolve,
  } = useOntologyView();

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
          {/* Removed Header */}
          {settings.developerMode && (
            <div className="flex items-center gap-4 ml-auto">
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
}
