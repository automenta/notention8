import React from 'react';

import { useOntologyView } from '../../hooks/useOntologyView';
import { OntologyNodeItem } from '../ontology/OntologyNodeItem';
import { SimulatorView } from '../simulator/SimulatorView';
import { useView } from '../../hooks/useViewContext';
import { ArrowLeftIcon } from '../icons';

export function OntologyView() {
  const {
    settings,
    ontology,
    activeTab,
    setActiveTab,
    isEvolving,
    handleEvolve,
    usageStats,
    conflicts
  } = useOntologyView();

  const { setSelectedNoteId, setActiveView } = useView();

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
                <button
                  onClick={() => setActiveTab('conflicts')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'conflicts' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Conflicts
                  {conflicts.length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {conflicts.length}
                      </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {activeTab === 'simulator' && settings.developerMode ? (
          <SimulatorView />
        ) : activeTab === 'conflicts' ? (
             <div className="flex flex-col items-center justify-start h-full text-center text-gray-400 pt-8">
                <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Conflict Resolution</h3>
                <p className="max-w-md mb-8">
                    Conflicts occur when local notes violate the shared ontology types.
                </p>

                {conflicts.length > 0 ? (
                    <div className="w-full max-w-3xl space-y-4">
                        {conflicts.map((conflict, idx) => (
                            <div key={idx} className="bg-gray-800 border border-red-900/50 p-4 rounded-lg flex items-center justify-between text-left hover:bg-gray-750 transition-colors">
                                <div>
                                    <div className="font-semibold text-white mb-1">
                                        Property <span className="text-red-400 font-mono">[{conflict.propertyKey}]</span>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Expected <code className="text-blue-300">{conflict.expectedType}</code> but found value <code className="text-yellow-300">"{conflict.actualValue}"</code>
                                    </div>
                                    <div className="text-xs text-red-500 mt-1">
                                        {conflict.reason}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-sm text-gray-500 max-w-[200px] truncate">
                                        In: {conflict.noteTitle || 'Untitled Note'}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedNoteId(conflict.noteId);
                                            setActiveView('notes');
                                        }}
                                        className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded flex items-center gap-1"
                                    >
                                        Edit Note <ArrowLeftIcon className="w-3 h-3 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm bg-gray-900 px-4 py-2 rounded text-gray-500 border border-gray-800">
                        No conflicts detected. All notes align with the ontology.
                    </div>
                )}
            </div>
        ) : (
          <>
            <p className="text-gray-400 mb-8">
              This is the semantic structure that powers your notes. Use these
              concepts as `#tags` to create machine-readable, interconnected
              knowledge.
            </p>
            <div className="bg-gray-900/70 p-6 rounded-lg">
              {ontology.map((rootNode) => (
                <OntologyNodeItem key={rootNode.id} node={rootNode} level={0} usageStats={usageStats} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
