import React, { useEffect, useState } from 'react';
import { useChatView } from '../../hooks/useChatView';
import { useView } from '../../hooks/useViewContext';
import { ChatWindow } from '../chat/ChatWindow';
import { ContactList } from '../chat/ContactList';
import { useSimulatorContext } from '../../hooks/useSimulatorContext';
import { AgentSettingsModal } from '../simulator/AgentSettingsModal';
import { useNotes } from '../../hooks/useNotes';
import { useGardener } from '../../hooks/useGardener';
import type { Contact, NostrEvent } from '../../types';
import type { SwarmTemplate } from '../../hooks/simulator/types';

const GARDENER_ID = 'gardener-system';
const GARDENER_CONTACT: Contact = {
    pubkey: GARDENER_ID,
    name: 'The Gardener',
    about: 'I help grow your ontology and curate your notes.',
    picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=gardener',
    isAgent: true
};

const createLocalMessage = (content: string, pubkey: string): NostrEvent => ({
    id: Math.random().toString(36),
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    kind: 4,
    tags: [],
    content,
    sig: 'local'
});

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
  const { notes } = useNotes();
  const { evolveOntology, optimizeOntology } = useGardener();
  const [gardenerMessages, setGardenerMessages] = useState<NostrEvent[]>([]);

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

  const handleGardenerMessage = async (content: string) => {
        // Add user message
        if (!pubkey) return;
        const userMsg = createLocalMessage(content, pubkey);
        setGardenerMessages(prev => [...prev, userMsg]);

        // Logic
        let response = "I am listening. I can 'analyze' your notes or 'optimize' your ontology.";
        const lower = content.toLowerCase();

        if (lower.includes('help')) {
            response = "I can help you organize your notes. Try 'analyze my notes' or 'optimize ontology'.";
        } else if (lower.includes('analyze') || lower.includes('evolve')) {
             setGardenerMessages(prev => [...prev, createLocalMessage("Analyzing your notes...", GARDENER_ID)]);
             const newAttrs = await evolveOntology(notes);
             if (newAttrs.length > 0) {
                 response = `I found ${newAttrs.length} new properties: ${newAttrs.map(a => a.key).join(', ')}.`;
             } else {
                 response = "Your notes look consistent. I didn't find any new patterns.";
             }
        } else if (lower.includes('optimize')) {
             setGardenerMessages(prev => [...prev, createLocalMessage("Optimizing ontology...", GARDENER_ID)]);
             const res = await optimizeOntology();
             response = `Optimization complete. ${res.merged.length} merges proposed.`;
        }

        // Add system response
        setTimeout(() => {
             setGardenerMessages(prev => [...prev, createLocalMessage(response, GARDENER_ID)]);
        }, 1000);
    };


  // Merge Agent Contacts
  const agentContacts: Contact[] = agents.map(a => ({
      pubkey: a.id,
      name: a.name,
      about: a.bio,
      picture: a.avatar,
      isAgent: true
  }));

  const allContacts = [GARDENER_CONTACT, ...agentContacts, ...contacts];

  // Resolve full contact object (to ensure properties like isAgent are present)
  const fullSelectedContact = localSelectedContact
      ? allContacts.find(c => c.pubkey === localSelectedContact.pubkey) || localSelectedContact
      : null;

  // Determine messages to display
  let displayMessages: NostrEvent[] = [];
  if (fullSelectedContact?.pubkey === GARDENER_ID) {
      displayMessages = gardenerMessages;
  } else if (fullSelectedContact?.isAgent) {
      displayMessages = agentMessages[fullSelectedContact.pubkey] || [];
  } else {
      displayMessages = fullSelectedContact ? messages[fullSelectedContact.pubkey] || [] : [];
  }

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
            if (peerPubkey === GARDENER_ID) {
                handleGardenerMessage(decryptedContent);
            } else if (fullSelectedContact?.isAgent) {
                sendMessageToAgent(peerPubkey, decryptedContent);
            } else {
                addMessage(peerPubkey, event, decryptedContent);
            }
          }}
          onOpenSettings={fullSelectedContact?.isAgent && fullSelectedContact.pubkey !== GARDENER_ID ? () => setSettingsAgentId(fullSelectedContact.pubkey) : undefined}
          onClearChat={
              fullSelectedContact?.pubkey === GARDENER_ID
                ? () => setGardenerMessages([])
                : (fullSelectedContact?.isAgent ? () => clearAgentMessages(fullSelectedContact.pubkey) : undefined)
          }
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
