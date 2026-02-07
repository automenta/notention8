import React from 'react';
import { AgentSessionWrapper } from './AgentSessionWrapper';
import { AgentSessionView } from './AgentSessionView';
import { CommunityWindow } from './CommunityWindow';
import { useSimulator } from '../../hooks/simulator/useSimulator';

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
      handlePublish
  } = useSimulator();

  return (
    <div className="flex flex-col h-full bg-black text-gray-200 p-2 overflow-hidden">
      <div className="flex justify-between items-center mb-2 px-2">
        <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">🧪 Community Simulator</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${
                aiProviderName.includes("Mock")
                ? "bg-yellow-900/50 border-yellow-700 text-yellow-500"
                : "bg-green-900/50 border-green-700 text-green-400"
            }`}>
                AI: {aiProviderName}
            </span>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => setActive(!active)}
                className={`px-3 py-1 rounded text-xs font-bold ${active ? 'bg-red-600' : 'bg-green-600'}`}
            >
                {active ? 'STOP' : 'START'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-grow overflow-hidden h-full">
        {/* Agents */}
        {agents.map((agent, index) => (
             <div key={agent.id} className="col-span-1 h-full overflow-hidden">
                 <AgentSessionWrapper agentId={agent.id} ontology={ontology}>
                    <AgentSessionView
                        agentName={agent.name}
                        currentDraft={agent.currentDraft}
                        onDraftChange={(val) => updateAgent(index, { currentDraft: val })}
                        status={agent.status}
                        onPublish={handlePublish}
                        notifications={notifications[agent.id] || []}
                        minimal={true}
                    />
                </AgentSessionWrapper>
            </div>
        ))}

        {/* Community Stream */}
        <div className="col-span-1 h-full overflow-hidden">
             <CommunityWindow networkNotes={networkNotes} />
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

             <div className="bg-gray-800 px-3 py-2 border-t border-gray-700 font-bold text-xs text-gray-400">
                 ONTOLOGY GROWTH
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
    </div>
  );
};
