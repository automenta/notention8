import React, { useEffect, useState } from 'react';
import { useChatView } from '../../hooks/useChatView';
import { useView } from '../../hooks/useViewContext';
import { ChatWindow } from '../chat/ChatWindow';
import { ContactList } from '../chat/ContactList';
import { useSimulatorContext } from '../../hooks/useSimulatorContext';
import { AgentSettingsModal } from '../simulator/AgentSettingsModal';
import { useNotes } from '../../hooks/useNotes';
import { useGardener } from '../../hooks/useGardener';
import { SELF_AGENT_ID } from '../../hooks/simulator/types';
import type { Contact, NostrEvent } from '../../types';
import type { SwarmTemplate } from '../../hooks/simulator/types';

// Helper to create a local message object
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
  const [systemMessages, setSystemMessages] = useState<NostrEvent[]>([]);

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

  const handleAssistantCommand = async (content: string) => {
        const lower = content.toLowerCase();

        // If it's a specific Gardener command, intercept it
        if (lower.includes('analyze') || lower.includes('evolve')) {
             // Inject user message first? No, ChatWindow does that visually, but we need to store it?
             // Actually, sendMessageToAgent stores user message. But here we are bypassing it.
             // We need to inject user message into our local "systemMessages" state or rely on the fact
             // that if we use "sendMessageToAgent" it goes into simulator state.

             // BUT: We want to intercept.
             // Let's manually add the user message to the agentMessages via a trick?
             // No, let's just use "sendMessageToAgent" for the user message part?
             // sendMessageToAgent(SELF_AGENT_ID, content) triggers the LLM response loop.
             // We want to PREVENT the LLM loop if we are handling it.

             // Solution: We manage the "Assistant" messages entirely here if we intercept?
             // OR, we use a separate state for "Assistant" messages like we did for Gardener?
             // But "Assistant" is in `agents`, so its messages are in `agentMessages`.
             // Ideally we write to `agentMessages`.
             // But `useSimulatorContext` doesn't expose `setAgentMessages`.
             // It exposes `sendMessageToAgent`.

             // If we can't write to `agentMessages` directly, we might have a problem unifying them
             // if we want to mix LLM chat and Command results.

             // HACK: We can use `sendMessageToAgent` but maybe we modify `useAgentInteraction` to support
             // "system" injection? No, that requires changing hooks.

             // ALTERNATIVE: Just use `sendMessageToAgent` for everything, and if the LLM sees "analyze",
             // it replies "I will analyze...". But the LLM can't call `evolveOntology`.

             // OK, for now, let's keep "Assistant" messages in `agentMessages` (via `sendMessageToAgent`)
             // AND inject the "Command Result" as a fake response from the agent?
             // But `sendMessageToAgent` forces an LLM response.

             // Let's use the `systemMessages` state I added above as an OVERLAY or replacement?
             // No, that splits history.

             // Let's look at `sendMessageToAgent` in `useAgentInteraction`.
             // It adds the user message immediately.
             // Then it waits 1s and adds the agent response.

             // If I call `sendMessageToAgent` with a special prefix or something? No.

             // Maybe I should just modify `useAgentInteraction` to allow passing a custom response handler?
             // That seems too complex for this step.

             // Simpler approach:
             // When sending to Assistant:
             // 1. If it's a command, handle it locally and add messages to a local state `assistantOverrides`.
             // 2. Render `agentMessages[SELF_AGENT_ID]` merged with `assistantOverrides`.
             // 3. But `sendMessageToAgent` is the only way to add the USER message to `agentMessages`.

             // Let's just use a local state for the Assistant's conversation view entirely?
             // No, then we lose the persistence/context if the user switches away.

             // Wait, `sendMessageToAgent` is just:
             // setAgentMessages(prev => { ... add user msg ... })
             // setTimeout( ... add agent msg ... )

             // If I use `sendMessageToAgent`, I get an LLM response.
             // Maybe I can let the LLM respond "Sure, analyzing..." and THEN I inject the actual result?
             // But I can't inject into `agentMessages` from here.

             // I MUST allow injecting messages into `agentMessages` from outside.
             // But `useSimulatorContext` doesn't expose `setAgentMessages` or `injectMessage`.

             // Let's look at `hooks/simulator/useSimulator.ts` again.
             // It returns `...useAgentInteraction(...)`.
             // `useAgentInteraction` returns `agentMessages` and `sendMessageToAgent`.
             // It does NOT return `setAgentMessages`.

             // I should expose `injectAgentMessage` from `useAgentInteraction`.

             return; // I need to modify useAgentInteraction first if I want to do this properly.
        }
  }

  // Merge Agent Contacts
  const agentContacts: Contact[] = agents.map(a => ({
      pubkey: a.id,
      name: a.name,
      about: a.bio,
      picture: a.avatar,
      isAgent: true
  }));

  const allContacts = [...agentContacts, ...contacts];

  // Resolve full contact object
  const fullSelectedContact = localSelectedContact
      ? allContacts.find(c => c.pubkey === localSelectedContact.pubkey) || localSelectedContact
      : null;

  // Determine messages to display
  // We need to merge local system messages if we are chatting with Assistant
  let displayMessages: NostrEvent[] = [];

  if (fullSelectedContact?.isAgent) {
      displayMessages = [...(agentMessages[fullSelectedContact.pubkey] || [])];
      if (fullSelectedContact.pubkey === SELF_AGENT_ID) {
          // Merge in any local system overrides if we implement that
          // For now, let's assume we can't easily mixed them without modifying hooks.
          // So let's modify the hooks in the next step?
          // Or just do a workaround:
          // If it's a command, we DON'T call sendMessageToAgent. We manage the WHOLE conversation locally for the Assistant?
          // But then we lose the "Notention AI" simulation background stuff.

          // Let's look at `systemMessages`. If I use that for the Assistant,
          // I can just append it to `displayMessages`?
          // But `displayMessages` comes from `agentMessages`.
          // If I don't call `sendMessageToAgent`, the user message isn't in `agentMessages`.
          // So I have to put the user message in `systemMessages` too.
          displayMessages = [...displayMessages, ...systemMessages].sort((a,b) => a.created_at - b.created_at);
      }
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
          onSendMessage={async (peerPubkey, event, decryptedContent) => {
            if (peerPubkey === SELF_AGENT_ID) {
                const lower = decryptedContent.toLowerCase();
                // Check for commands
                if (lower.includes('analyze') || lower.includes('evolve') || lower.includes('optimize') || lower.includes('help')) {
                    // 1. Add User Message Locally
                    if (pubkey) {
                        setSystemMessages(prev => [...prev, createLocalMessage(decryptedContent, pubkey)]);
                    }

                    // 2. Process Command
                    if (lower.includes('help')) {
                         setTimeout(() => {
                             setSystemMessages(prev => [...prev, createLocalMessage("I can help you organize your notes. Try 'analyze my notes' or 'optimize ontology'.", SELF_AGENT_ID)]);
                         }, 500);
                    } else if (lower.includes('analyze') || lower.includes('evolve')) {
                         setSystemMessages(prev => [...prev, createLocalMessage("Analyzing your notes...", SELF_AGENT_ID)]);
                         const newAttrs = await evolveOntology(notes);
                         const response = newAttrs.length > 0
                            ? `I found ${newAttrs.length} new properties: ${newAttrs.map(a => a.key).join(', ')}.`
                            : "Your notes look consistent. I didn't find any new patterns.";
                         setSystemMessages(prev => [...prev, createLocalMessage(response, SELF_AGENT_ID)]);
                    } else if (lower.includes('optimize')) {
                         setSystemMessages(prev => [...prev, createLocalMessage("Optimizing ontology...", SELF_AGENT_ID)]);
                         const res = await optimizeOntology();
                         const response = `Optimization complete. ${res.merged.length} merges proposed.`;
                         setSystemMessages(prev => [...prev, createLocalMessage(response, SELF_AGENT_ID)]);
                    }
                } else {
                    // Normal Chat -> Send to Simulator
                    sendMessageToAgent(peerPubkey, decryptedContent);
                }
            } else if (fullSelectedContact?.isAgent) {
                sendMessageToAgent(peerPubkey, decryptedContent);
            } else {
                addMessage(peerPubkey, event, decryptedContent);
            }
          }}
          onOpenSettings={fullSelectedContact?.isAgent ? () => setSettingsAgentId(fullSelectedContact.pubkey) : undefined}
          onClearChat={
              fullSelectedContact?.isAgent
                ? () => {
                    clearAgentMessages(fullSelectedContact.pubkey);
                    if (fullSelectedContact.pubkey === SELF_AGENT_ID) {
                        setSystemMessages([]);
                    }
                }
                : undefined
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
