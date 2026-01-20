import React from 'react';

import { useOntologyView, OntologyTab } from '../../hooks/useOntologyView';
import { OntologyNodeItem } from '../ontology/OntologyNodeItem';
import { OntologyConflicts } from '../ontology/OntologyConflicts';
import { useView } from '../../hooks/useViewContext';
import { Tabs } from '../common/Tabs';

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

  const handleSelectNote = (noteId: string) => {
      setSelectedNoteId(noteId);
      setActiveView('notes');
  };

  const tabs = [
    { id: 'graph', label: 'Graph' },
    { id: 'conflicts', label: 'Conflicts', count: conflicts.length }
  ];

  // If we were on simulator tab (which is removed), switch to graph
  const safeActiveTab = activeTab === 'simulator' ? 'graph' : activeTab;

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg flex flex-col">
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-700 pb-4 gap-4">
          <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">Ontology</h2>
          </div>

          <div className="flex items-center gap-4 ml-auto">
             {settings.developerMode && (
                <>
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
                </>
             )}

              <Tabs
                  tabs={tabs}
                  activeTab={safeActiveTab}
                  onChange={(id) => setActiveTab(id as OntologyTab)}
              />
          </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {safeActiveTab === 'conflicts' ? (
             <OntologyConflicts conflicts={conflicts} onSelectNote={handleSelectNote} />
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
