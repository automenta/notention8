import React, { useState } from 'react';
import { AgentSessionWrapper } from './AgentSessionWrapper';
import { AgentSessionView } from './AgentSessionView';
import { CommunityWindow } from './CommunityWindow';
import { useSimulatorContext } from '../contexts/SimulatorContext';
import { CubeIcon, CpuChipIcon } from "../layout/icons";
import { SWARM_TEMPLATES } from '../../hooks/simulator/types';
import type { SwarmTemplate, SimulationAgent } from '../../hooks/simulator/types';

export const SimulatorView: React.FC = () => {
  const {
      agents,
      updateAgent,
      active,
      setActive,
      logs,
      networkNotes,
      ontology,
      notifications,
      newAttributes,
      aiProviderName,
      handlePublish,
      randomizeAgent,
      deploySwarm,
      addAgent,
      optimizeOntology,
      importUserNotes,
      saveNetworkNote
  } = useSimulatorContext();

  const [selectedView, setSelectedView] = useState<'overview' | string>('overview');
  const [showSwarmModal, setShowSwarmModal] = useState(false);

  const selectedAgentIndex = agents.findIndex(a => a.id === selectedView);
  const selectedAgent = selectedAgentIndex !== -1 ? agents[selectedAgentIndex] : null;

  const handleDeploySwarm = (template: SwarmTemplate) => {
      const newAgents: SimulationAgent[] = template.agents.map(a => ({
          ...a,
          id: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''), // Valid-ish hex ID
          currentDraft: '',
          status: 'Idle',
          isAgent: true
      }));
      deploySwarm(newAgents);
      setShowSwarmModal(false);
  };

  return (
    <div className="flex h-full bg-black text-gray-200 overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-800 flex flex-col gap-3">
            <h1 className="text-lg font-bold flex items-center gap-2">
                <span className="text-xl">🧪</span> Simulator
            </h1>
            <div className="flex justify-between items-center">
                 <span className={`text-[10px] px-2 py-0.5 rounded border ${
                    aiProviderName.includes("Mock")
                    ? "bg-yellow-900/50 border-yellow-700 text-yellow-500"
                    : "bg-green-900/50 border-green-700 text-green-400"
                }`}>
                    AI: {aiProviderName}
                </span>
                <button
                    onClick={() => setActive(!active)}
                    className={`px-3 py-0.5 rounded text-xs font-bold ${active ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'} transition-colors`}
                >
                    {active ? 'STOP' : 'START'}
                </button>
            </div>
            {/* Import Button */}
            <button
                onClick={importUserNotes}
                className="w-full text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 rounded border border-gray-700 transition-colors"
            >
                📥 Import My Notes
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button
                onClick={() => setSelectedView('overview')}
                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors ${selectedView === 'overview' ? 'bg-blue-900/30 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
              >
                  <CubeIcon className="w-4 h-4" />
                  Overview
              </button>

              <div className="mt-4 mb-2 px-3 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Agents</span>
                  <div className="flex gap-1">
                      <button onClick={addAgent} className="text-[10px] text-gray-400 hover:text-white font-bold border border-gray-700 px-1.5 rounded bg-gray-800" title="Add Agent">
                          +
                      </button>
                      <button onClick={() => setShowSwarmModal(true)} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold border border-blue-900/50 px-1.5 rounded bg-blue-900/20" title="Deploy Swarm">
                          + SWARM
                      </button>
                  </div>
              </div>
              {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedView(agent.id)}
                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors ${selectedView === agent.id ? 'bg-blue-900/30 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                  >
                      <CpuChipIcon className={`w-4 h-4 ${agent.status === 'Typing...' ? 'text-green-400 animate-pulse' : 'text-gray-500'}`} />
                      <span className="truncate">{agent.name}</span>
                      {notifications[agent.id]?.length > 0 && (
                          <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500"></span>
                      )}
                  </button>
              ))}
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-950 p-2">
          {selectedView === 'overview' && (
              <div className="h-full grid grid-cols-2 gap-2">
                   {/* Community Stream */}
                   <div className="col-span-1 h-full overflow-hidden flex flex-col">
                         <div className="mb-2 font-bold text-gray-400 text-xs px-1">COMMUNITY STREAM</div>
                         <CommunityWindow networkNotes={networkNotes} onSaveNote={saveNetworkNote} />
                   </div>

                   {/* System Dashboard */}
                   <div className="col-span-1 h-full overflow-hidden flex flex-col bg-gray-900 border border-gray-700 rounded-lg">
                         <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 font-bold text-xs text-gray-400">
                             SYSTEM EVENTS
                         </div>
                         <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-[10px]">
                             {logs.map((log, i) => (
                                 <div key={i} className={`p-1 border-l-2 pl-2 ${
                                     log.type === 'match' ? 'border-yellow-500 text-yellow-200' :
                                     log.type === 'ontology' ? 'border-green-500 text-green-300' :
                                     log.type === 'reuse' ? 'border-blue-400 text-blue-300' :
                                     'border-gray-500 text-gray-400'
                                 }`}>
                                     {log.msg}
                                 </div>
                             ))}
                         </div>

                         <div className="bg-gray-800 px-3 py-2 border-t border-gray-700 font-bold text-xs text-gray-400 flex justify-between items-center">
                             <span>ONTOLOGY GROWTH</span>
                             <button
                                onClick={optimizeOntology}
                                className="text-[10px] bg-blue-900/50 hover:bg-blue-800 text-blue-300 px-2 py-0.5 rounded border border-blue-800 transition-colors"
                             >
                                Optimize
                             </button>
                         </div>
                         <div className="h-1/3 overflow-y-auto p-2 font-mono text-[10px] space-y-1">
                             {newAttributes.length === 0 && <span className="text-gray-600">No new attributes yet.</span>}
                             {newAttributes.map((attr, i) => (
                                 <div key={i} className="text-green-400 flex items-center gap-1">
                                     <span>🌱</span> {attr.key} <span className='text-gray-500'>({attr.type})</span>
                                 </div>
                             ))}
                         </div>
                    </div>
              </div>
          )}

          {selectedView !== 'overview' && selectedAgent && (
               <div className="h-full flex flex-col gap-2">
                   {!active && (
                       <div className="bg-gray-900 p-4 rounded border border-gray-800 flex flex-col gap-2 shrink-0">
                           <div className="flex gap-4">
                               <div className="flex-1">
                                   <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Name</label>
                                   <input
                                       className="w-full bg-black text-sm text-gray-200 border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                       value={selectedAgent.name}
                                       onChange={e => updateAgent(selectedAgentIndex, { name: e.target.value })}
                                   />
                               </div>
                               <div className="flex-[3]">
                                    <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Bio</label>
                                    <textarea
                                        className="w-full bg-black text-sm text-gray-300 border border-gray-700 rounded p-1 resize-none h-[38px] focus:outline-none focus:border-blue-500"
                                        value={selectedAgent.bio}
                                        onChange={e => updateAgent(selectedAgentIndex, { bio: e.target.value })}
                                        placeholder="Agent Bio"
                                    />
                               </div>
                           </div>
                           <div className="flex justify-end">
                               <button
                                   onClick={() => randomizeAgent(selectedAgentIndex)}
                                   className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-700 transition-colors"
                               >
                                   🎲 Randomize Identity
                               </button>
                           </div>
                       </div>
                   )}

                   <div className="flex-1 overflow-hidden">
                        <AgentSessionWrapper agentId={selectedAgent.id} ontology={ontology}>
                            <AgentSessionView
                                agentName={selectedAgent.name}
                                currentDraft={selectedAgent.currentDraft}
                                onDraftChange={(val) => updateAgent(selectedAgentIndex, { currentDraft: val })}
                                status={selectedAgent.status}
                                onPublish={handlePublish}
                                notifications={notifications[selectedAgent.id] || []}
                            />
                        </AgentSessionWrapper>
                   </div>
               </div>
          )}
      </div>

      {showSwarmModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-[480px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                 <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                     <h2 className="font-bold text-white">Deploy Swarm</h2>
                     <button onClick={() => setShowSwarmModal(false)} className="text-gray-500 hover:text-white">✕</button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                     {SWARM_TEMPLATES.map(template => (
                         <div key={template.id} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded p-3 cursor-pointer transition-colors group"
                              onClick={() => handleDeploySwarm(template)}>
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
      )}
    </div>
  );
};
