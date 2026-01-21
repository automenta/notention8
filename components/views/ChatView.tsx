import React, { useEffect, useState } from 'react';
import { useChatView } from '../../hooks/useChatView';
import { useView } from '../../hooks/useViewContext';
import { ChatWindow } from '../chat/ChatWindow';
import { ContactList } from '../chat/ContactList';
import { useSimulatorContext } from '../../hooks/useSimulatorContext';
import { AgentSettingsModal } from '../simulator/AgentSettingsModal';
import type { Contact } from '../../types';
import type { SwarmTemplate } from '../../hooks/simulator/types';

export function ChatView() {
  const { resetChatNotification } = useView();
  const {
      agents,
      agentMessages,
      sendMessageToAgent,
      addAgent,
      deploySwarm,
      removeAgent,
      updateAgent,
      toggleAgent,
      randomizeAgent,
      clearAgentMessages
  } = useSimulatorContext();

  const [settingsAgentId, setSettingsAgentId] = useState<string | null>(null);

  // Clear notifications when entering chat view
  useEffect(() => {
      resetChatNotification();
  }, [resetChatNotification]);
  const {
    privkey,
    pubkey,
    localSelectedContact,
    contacts,
    setContacts,
    messages,
    isLoading,
    addMessage,
    handleSelectContact,
  } = useChatView();

  const handleDeploySwarm = (template: SwarmTemplate) => {
      const newAgents = template.agents.map(a => ({
          ...a,
          id: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          status: 'Idle',
          currentDraft: '',
          isAgent: true,
          enabled: true
      }));
      deploySwarm(newAgents);
  };

  // Merge Agent Contacts
  const agentContacts: Contact[] = agents.map(a => ({
      pubkey: a.id,
      name: a.name,
      about: a.bio,
      picture: a.avatar,
      isAgent: true
  }));

  const allContacts = [...agentContacts, ...contacts];

  // Resolve full contact object (to ensure properties like isAgent are present)
  const fullSelectedContact = localSelectedContact
      ? allContacts.find(c => c.pubkey === localSelectedContact.pubkey) || localSelectedContact
      : null;

  // Determine messages to display
  const displayMessages = fullSelectedContact?.isAgent
      ? (agentMessages[fullSelectedContact.pubkey] || [])
      : (fullSelectedContact ? messages[fullSelectedContact.pubkey] || [] : []);

  const selectedAgent = settingsAgentId ? agents.find(a => a.id === settingsAgentId) : null;

  if (!privkey || !pubkey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-gray-800/50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-400">
          Chat Requires Nostr Account
        </h2>
        <p className="text-gray-500 mt-2">
          Please create or configure your Nostr account in the
          &quot;Network&quot; tab.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-800/50 rounded-lg overflow-hidden">
      <div
        className={`w-full md:w-1/3 md:flex-shrink-0 ${fullSelectedContact ? 'hidden md:block' : 'block'}`}
      >
        <ContactList
          privkey={privkey}
          pubkey={pubkey}
          contacts={allContacts}
          setContacts={setContacts}
          selectedContact={fullSelectedContact}
          onSelectContact={handleSelectContact}
          isLoading={isLoading}
          onAddAgent={addAgent}
          onDeploySwarm={handleDeploySwarm}
        />
      </div>
      <div
        className={`w-full ${!fullSelectedContact ? 'hidden md:block' : 'block'}`}
      >
        <ChatWindow
          privkey={privkey}
          pubkey={pubkey}
          selectedContact={fullSelectedContact}
          onBack={() => handleSelectContact(null)}
          messages={displayMessages}
          onSendMessage={(peerPubkey, event, decryptedContent) => {
            if (fullSelectedContact?.isAgent) {
                sendMessageToAgent(peerPubkey, decryptedContent);
            } else {
                addMessage(peerPubkey, event, decryptedContent);
            }
          }}
          onOpenSettings={fullSelectedContact?.isAgent ? () => setSettingsAgentId(fullSelectedContact.pubkey) : undefined}
          onClearChat={fullSelectedContact?.isAgent ? () => clearAgentMessages(fullSelectedContact.pubkey) : undefined}
        />
      </div>

      {selectedAgent && (
          <AgentSettingsModal
              isOpen={!!selectedAgent}
              onClose={() => setSettingsAgentId(null)}
              agent={selectedAgent}
              onUpdate={(updates) => updateAgent(agents.findIndex(a => a.id === selectedAgent.id), updates)}
              onDelete={() => removeAgent(selectedAgent.id)}
              onToggle={() => toggleAgent(selectedAgent.id)}
              onRandomize={() => randomizeAgent(agents.findIndex(a => a.id === selectedAgent.id))}
          />
      )}
    </div>
  );
}
