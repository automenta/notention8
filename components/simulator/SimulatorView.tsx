import React, { useState } from 'react';
import { AgentSessionWrapper } from './AgentSessionWrapper';
import { AgentSessionView } from './AgentSessionView';
import { CommunityWindow } from './CommunityWindow';
import { SwarmModal } from './SwarmModal';
import { SimulatorSidebar } from './SimulatorSidebar';
import { SimulatorAgentEditor } from './SimulatorAgentEditor';
import { SystemDashboard } from './SystemDashboard';
import { useSimulatorContext } from '../contexts/SimulatorContext';
import { useSwarmActions } from '../../hooks/simulator/useSwarmActions';

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
      addAgent,
      optimizeOntology,
      importUserNotes,
      saveNetworkNote
  } = useSimulatorContext();
  const { handleDeploySwarm } = useSwarmActions();

  const [selectedView, setSelectedView] = useState<'overview' | string>('overview');
  const [showSwarmModal, setShowSwarmModal] = useState(false);

  const selectedAgentIndex = agents.findIndex(a => a.id === selectedView);
  const selectedAgent = selectedAgentIndex !== -1 ? agents[selectedAgentIndex] : null;

  return (
    <div className="flex h-full bg-black text-gray-200 overflow-hidden relative">
      <SimulatorSidebar
          aiProviderName={aiProviderName}
          active={active}
          setActive={setActive}
          importUserNotes={importUserNotes}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          addAgent={addAgent}
          onOpenSwarmModal={() => setShowSwarmModal(true)}
          agents={agents}
          notifications={notifications}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-950 p-2">
          {selectedView === 'overview' && (
              <div className="h-full grid grid-cols-2 gap-2">
                   {/* Community Stream */}
                   <div className="col-span-1 h-full overflow-hidden flex flex-col">
                         <div className="mb-2 font-bold text-gray-400 text-xs px-1">COMMUNITY STREAM</div>
                         <CommunityWindow networkNotes={networkNotes} onSaveNote={saveNetworkNote} />
                   </div>

                   <SystemDashboard
                       logs={logs}
                       optimizeOntology={optimizeOntology}
                       newAttributes={newAttributes}
                   />
              </div>
          )}

          {selectedView !== 'overview' && selectedAgent && (
               <div className="h-full flex flex-col gap-2">
                   {!active && (
                       <SimulatorAgentEditor
                           agent={selectedAgent}
                           onUpdate={(updates) => updateAgent(selectedAgentIndex, updates)}
                           onRandomize={() => randomizeAgent(selectedAgentIndex)}
                       />
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

      <SwarmModal
        isOpen={showSwarmModal}
        onClose={() => setShowSwarmModal(false)}
        onDeploy={(template) => handleDeploySwarm(template, () => setShowSwarmModal(false))}
      />
    </div>
  );
};
