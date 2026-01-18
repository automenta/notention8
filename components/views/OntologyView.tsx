import React, { useMemo } from 'react';

import { useOntologyView } from '../../hooks/useOntologyView';
import { OntologyNodeItem } from '../ontology/OntologyNodeItem';
import { SimulatorView } from '../simulator/SimulatorView';
import { useView } from '../../hooks/useViewContext';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';

export function OntologyView() {
  const {
    settings,
    ontology,
    activeTab,
    setActiveTab,
    isEvolving,
    handleEvolve,
    handleOptimize,
    usageStats,
    conflicts
  } = useOntologyView();

  const { setSelectedNoteId, setActiveView } = useView();

  // Group conflicts by Note ID
  const groupedConflicts = useMemo(() => {
      const groups: Record<string, typeof conflicts> = {};
      conflicts.forEach(c => {
          if (!groups[c.noteId]) {
              groups[c.noteId] = [];
          }
          groups[c.noteId].push(c);
      });
      return groups;
  }, [conflicts]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <div className="flex items-center gap-4">
               {/* Use the segmented control from SettingsView logic if we want consistency, but here we have specific tabs */}
               {/* We can reuse the style */}
          </div>

          {settings.developerMode && (
            <div className="flex items-center gap-4 ml-auto">
              <button
                onClick={handleOptimize}
                disabled={isEvolving}
                className="text-xs font-bold uppercase tracking-wider bg-blue-700/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
              >
                {isEvolving ? '...' : 'Optimize'}
              </button>

              <button
                onClick={handleEvolve}
                disabled={isEvolving}
                className="text-xs font-bold uppercase tracking-wider bg-green-700/80 hover:bg-green-600 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50"
              >
                {isEvolving ? 'Gardening...' : 'Run Gardener'}
              </button>

              <div className="flex bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'graph' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                  Graph
                </button>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'simulator' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                  Simulator
                </button>
                <button
                  onClick={() => setActiveTab('conflicts')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'conflicts' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                  Conflicts
                  {conflicts.length > 0 && (
                      <span className="bg-red-900 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {conflicts.length}
                      </span>
                  )}
                </button>
              </div>
            </div>
          )}
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab === 'simulator' && settings.developerMode ? (
          <SimulatorView />
        ) : activeTab === 'conflicts' ? (
             <div className="flex flex-col items-center justify-start h-full text-center text-gray-400 pt-4">
                {conflicts.length > 0 ? (
                    <div className="w-full max-w-4xl space-y-6 pb-8">
                        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-4 text-left">
                            <div className="text-3xl">⚠️</div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Conflicts Detected</h3>
                                <p className="text-sm text-gray-400">
                                    Found {conflicts.length} issues across {Object.keys(groupedConflicts).length} notes.
                                    These properties do not match the expected types defined in your Ontology.
                                </p>
                            </div>
                        </div>

                        {Object.entries(groupedConflicts).map(([noteId, noteConflicts]) => (
                            <div key={noteId} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden text-left shadow-lg">
                                <div className="bg-gray-900/50 p-3 border-b border-gray-700 flex justify-between items-center">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <span className="text-gray-500">Note:</span>
                                        {noteConflicts[0].noteTitle || 'Untitled Note'}
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setSelectedNoteId(noteId);
                                            setActiveView('notes');
                                        }}
                                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                                    >
                                        Edit Note <ArrowRightIcon className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-700/50">
                                    {noteConflicts.map((conflict, idx) => (
                                        <div key={idx} className="p-4 flex items-start justify-between hover:bg-gray-700/20 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded">
                                                        [{conflict.propertyKey}]
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        expects <span className="text-blue-300 font-mono">{conflict.expectedType}</span>
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    Current value: <span className="text-yellow-300 font-mono bg-yellow-900/20 px-1.5 rounded">"{conflict.actualValue}"</span>
                                                </div>
                                            </div>
                                            <div className="text-xs font-semibold text-red-500 bg-red-900/10 px-2 py-1 rounded border border-red-900/30">
                                                {conflict.reason}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                         <div className="text-green-500 mb-4 text-5xl">✓</div>
                         <h3 className="text-xl font-bold text-white mb-2">No Conflicts</h3>
                         <p className="max-w-md">
                            All notes align perfectly with your Ontology.
                        </p>
                    </div>
                )}
            </div>
        ) : (
          <>
            <div className="mb-6 flex items-start gap-4 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                <div className="text-2xl">🌱</div>
                <div>
                     <h3 className="font-bold text-white mb-1">The Ontology</h3>
                     <p className="text-sm text-gray-400">
                      This graph represents the shared vocabulary of your network.
                      As you write notes with properties (e.g., <code>[price:is:100]</code>), the Gardener automatically updates this structure.
                    </p>
                </div>
            </div>

            <div className="bg-gray-900/70 p-6 rounded-lg border border-gray-700/50">
              {ontology.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                      <p>Ontology is empty.</p>
                      <p className="text-sm mt-2">Start writing notes with properties to seed the graph.</p>
                  </div>
              ) : (
                  ontology.map((rootNode) => (
                    <OntologyNodeItem key={rootNode.id} node={rootNode} level={0} usageStats={usageStats} />
                  ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
