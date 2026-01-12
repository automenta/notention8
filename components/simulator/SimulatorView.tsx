import React, { useState, useEffect, useRef } from 'react';
import { AgentSessionWrapper } from './AgentSessionWrapper';
import { AgentSessionView } from './AgentSessionView';
import { CommunityWindow } from './CommunityWindow';
import { WebLLMProvider } from '../../services/ai/WebLLMProvider';
import { Gardener } from '../../services/gardener';
import { parseProperties } from '../../utils/parsing';
import { matchNotes } from '../../utils/matching';
import { addAttribute, findNode } from '../../utils/ontologyHelpers';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import type { Note, OntologyNode, OntologyAttribute } from '../../types';

// Agent State
interface SimulationAgent {
    id: string;
    name: string;
    persona: string;
    currentDraft: string;
    status: string; // "Thinking", "Typing", "Idle"
    goal: string;
}

const INITIAL_AGENTS: SimulationAgent[] = [
    {
        id: '1',
        name: 'Alice (Client)',
        persona: 'You are Alice, a startup founder looking for a React developer to build a landing page. Budget is around $500.',
        goal: 'Create a Request Note for a React Developer.',
        currentDraft: '',
        status: 'Idle'
    },
    {
        id: '2',
        name: 'Bob (Freelancer)',
        persona: 'You are Bob, an experienced React and Node.js developer looking for gigs. Your rate is $50/hr.',
        goal: 'Create an Offer Note listing your services.',
        currentDraft: '',
        status: 'Idle'
    }
];

export const SimulatorView: React.FC = () => {
  const [agents, setAgents] = useState<SimulationAgent[]>(INITIAL_AGENTS);
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [networkNotes, setNetworkNotes] = useState<Note[]>([]); // Shared Network State
  const [ontology, setOntology] = useState<OntologyNode[]>(DEFAULT_ONTOLOGY);
  const [notifications, setNotifications] = useState<Record<string, string[]>>({});

  const aiRef = useRef<WebLLMProvider>(new WebLLMProvider());
  const gardenerRef = useRef<Gardener | null>(null);
  const agentsRef = useRef(agents);

  // Initialize Gardener
  useEffect(() => {
      gardenerRef.current = new Gardener(aiRef.current);
  }, []);

  // Keep ref in sync
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  // Simulation Loop
  useEffect(() => {
    if (!active) return;

    let timeoutId: NodeJS.Timeout;

    const loop = async () => {
        // Use ref to get latest state inside async loop
        const currentAgents = agentsRef.current;
        const agentIndex = currentAgents.findIndex(a => a.status === 'Idle');

        if (agentIndex === -1) {
            timeoutId = setTimeout(loop, 1000);
            return;
        }

        const agent = currentAgents[agentIndex];

        // 1. Update Status: Thinking
        updateAgent(agentIndex, { status: 'Thinking...' });
        addLog(`${agent.name} is thinking about goal: "${agent.goal}"`);

        // 2. AI Generation
        try {
            const prompt = `
                ${agent.persona}
                Your current goal is: ${agent.goal}
                Write a short note content that achieves this goal.
                Keep it under 20 words.
                Do not include tags yet.
            `;
            const content = await aiRef.current.generateCompletion(prompt);

            // 3. Typing Animation
            updateAgent(agentIndex, { status: 'Typing...' });
            await simulateTyping(agentIndex, content);

            // 4. AI Tagging (Gardener) & Ontology Evolution
            // We simulate that the agent consults the AI to add tags,
            // which in turn might suggest new ontology attributes.
            updateAgent(agentIndex, { status: 'Gardening...' });
            const tags = await aiRef.current.suggestTags(content);
            const taggedContent = content + '\n\n' + tags.map((t: string) => JSON.stringify(t)).join(' ');
            updateAgent(agentIndex, { currentDraft: taggedContent });

            // 5. Done - Publish Trigger
            updateAgent(agentIndex, { status: 'Published', goal: 'Wait for matches' });
            addLog(`${agent.name} is publishing...`);

            // Wait a bit before next loop
            await new Promise(r => setTimeout(r, 2000));
            updateAgent(agentIndex, { status: 'Idle' });

        } catch (e) {
            console.error(e);
            updateAgent(agentIndex, { status: 'Error' });
            // Add slight delay on error to avoid rapid looping
            await new Promise(r => setTimeout(r, 2000));
        }

        timeoutId = setTimeout(loop, 1000);
    };

    loop();

    return () => clearTimeout(timeoutId);
  }, [active]);

  const updateAgent = (index: number, updates: Partial<SimulationAgent>) => {
    setAgents(prev => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
    });
  };

  const simulateTyping = async (index: number, fullText: string) => {
    for (let i = 0; i <= fullText.length; i++) {
        updateAgent(index, { currentDraft: fullText.slice(0, i) });
        await new Promise(r => setTimeout(r, 50));
    }
  };

  const handlePublish = async (note: Note) => {
      // 1. Enrich Note
      const properties = parseProperties(note.content);
      const enrichedNote = { ...note, properties };

      setNetworkNotes(prev => {
          const newNotes = [enrichedNote, ...prev];

          // 2. Run Matching Logic
          // Check if this new note matches any existing note (offer matches request, or request matches offer)
          // We assume simplistic matching: New Note vs All Previous Notes
          // And notify BOTH owners.

          prev.forEach(otherNote => {
             const score1 = matchNotes(enrichedNote, otherNote);
             const score2 = matchNotes(otherNote, enrichedNote);

             if (score1 > 0.5 || score2 > 0.5) {
                 addLog(`MATCH FOUND! Score: ${Math.max(score1, score2).toFixed(2)} between ${enrichedNote.id.slice(0,4)} and ${otherNote.id.slice(0,4)}`);

                 // Notify Current Agent (Publisher)
                 // Find agent who owns this note (we don't track owner in Note type here strictly, but let's assume active agents)
                 // This is a simulation, so we just broadcast to active agents if they published it.
                 // Ideally Note should have `pubkey` or `authorId`.
                 // We will map Agent ID to Author somehow?
                 // For now, simply notify ALL agents involved in the simulation since they are "Alice" and "Bob".

                 setNotifications(n => ({
                     ...n,
                     '1': [...(n['1'] || []), `Match found for your note!`],
                     '2': [...(n['2'] || []), `Match found for your note!`]
                 }));
             }
          });

          return newNotes;
      });

      addLog(`Event Published: ${note.id.slice(0,6)}`);

      // 3. Evolve Ontology
      if (gardenerRef.current) {
          try {
              const newAttributes = await gardenerRef.current.evolveOntology([enrichedNote]);
              if (newAttributes.length > 0) {
                  setOntology(prevOntology => {
                      let newOntology = [...prevOntology];
                      // Simply add to the first node ("Service" usually) or a "General" node if possible
                      // In a real scenario, Gardener would suggest the Path.
                      // Here we just attach to root node if available.
                      const targetNodeId = newOntology[0]?.id || 'root';

                      newAttributes.forEach(attr => {
                          addLog(`Ontology Evolved: Added ${attr.key}`);
                          // Check if exists first to avoid error? addAttribute doesn't throw, just overwrites or adds?
                          // addAttribute creates a new tree.

                          // Map AttributeDefinition to OntologyAttribute
                          const ontAttr: OntologyAttribute = {
                              type: attr.type,
                              description: attr.description,
                              operators: { real: ['is'], imaginary: [] } // Defaults
                          };

                          newOntology = addAttribute(newOntology, targetNodeId, attr.key, ontAttr);
                      });
                      return newOntology;
                  });
              }
          } catch (e) {
              console.error("Gardener Error:", e);
          }
      }
  };

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));

  return (
    <div className="flex flex-col h-full bg-black text-gray-200 p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">🧪 Community Simulator</h1>
        <div className="flex gap-2">
            <button
                onClick={() => setActive(!active)}
                className={`px-4 py-2 rounded font-bold ${active ? 'bg-red-600' : 'bg-green-600'}`}
            >
                {active ? 'Stop Simulation' : 'Start Simulation'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-grow overflow-hidden">
        {/* Agent 1 */}
        <AgentSessionWrapper agentId={agents[0].id} ontology={ontology}>
            <AgentSessionView
                agentName={agents[0].name}
                currentDraft={agents[0].currentDraft}
                onDraftChange={(val) => updateAgent(0, { currentDraft: val })}
                status={agents[0].status}
                onPublish={handlePublish}
                notifications={notifications[agents[0].id] || []}
            />
        </AgentSessionWrapper>

        {/* Agent 2 */}
        <AgentSessionWrapper agentId={agents[1].id} ontology={ontology}>
            <AgentSessionView
                agentName={agents[1].name}
                currentDraft={agents[1].currentDraft}
                onDraftChange={(val) => updateAgent(1, { currentDraft: val })}
                status={agents[1].status}
                onPublish={handlePublish}
                notifications={notifications[agents[1].id] || []}
            />
        </AgentSessionWrapper>

        {/* Community Window */}
        <CommunityWindow networkNotes={networkNotes} />
      </div>

      {/* Logs (Condensed) */}
      <div className="h-32 mt-4 bg-gray-900 border border-gray-700 rounded p-4 overflow-y-auto font-mono text-xs">
        <h3 className="font-bold text-gray-500 mb-2 sticky top-0 bg-gray-900">System Logs</h3>
        {logs.map((log, i) => (
            <div key={i} className="mb-1 border-l-2 border-blue-500 pl-2">
                <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
        ))}
      </div>
    </div>
  );
};
