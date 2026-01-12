import React, { useState, useEffect, useRef } from 'react';
import { AgentSessionWrapper } from './AgentSessionWrapper';
import { AgentSessionView } from './AgentSessionView';
import { CommunityWindow } from './CommunityWindow';
import { WebLLMProvider } from '../../services/ai/WebLLMProvider';
import { Gardener } from '../../services/gardener';
import { parseProperties } from '../../utils/parsing';
import { matchNotes } from '../../utils/matching';
import { addAttribute } from '../../utils/ontologyHelpers';
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
  const [logs, setLogs] = useState<{msg: string; type: 'info' | 'match' | 'ontology' | 'reuse'}[]>([]);
  const [networkNotes, setNetworkNotes] = useState<Note[]>([]); // Shared Network State
  const [ontology, setOntology] = useState<OntologyNode[]>(DEFAULT_ONTOLOGY);
  const [notifications, setNotifications] = useState<Record<string, string[]>>({});
  const [newAttributes, setNewAttributes] = useState<{key: string; type: string}[]>([]);

  const aiRef = useRef<WebLLMProvider>(new WebLLMProvider());
  const gardenerRef = useRef<Gardener | null>(null);
  const agentsRef = useRef(agents);
  const ontologyRef = useRef(ontology); // Ref for loop access

  // Initialize Gardener
  useEffect(() => {
      gardenerRef.current = new Gardener(aiRef.current);
  }, []);

  // Keep refs in sync
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  useEffect(() => {
    ontologyRef.current = ontology;
  }, [ontology]);

  // Use a ref for simulateTyping to be stable or just define it outside the effect
  // But it uses updateAgent, so it needs to be careful.
  // Actually, we can just define it inside, but we need to handle the warning.
  // Or move logic to a reducer. For now, suppress warning or include it.

  // Simulation Loop
  useEffect(() => {
    if (!active) return;

    let timeoutId: NodeJS.Timeout;

    const simulateTyping = async (index: number, fullText: string) => {
        for (let i = 0; i <= fullText.length; i++) {
            updateAgent(index, { currentDraft: fullText.slice(0, i) });
            await new Promise(r => setTimeout(r, 50));
        }
    };

    const loop = async () => {
        // Use ref to get latest state inside async loop
        const currentAgents = agentsRef.current;
        const currentOntology = ontologyRef.current;
        const agentIndex = currentAgents.findIndex(a => a.status === 'Idle');

        if (agentIndex === -1) {
            timeoutId = setTimeout(loop, 1000);
            return;
        }

        const agent = currentAgents[agentIndex];

        // 1. Update Status: Thinking
        updateAgent(agentIndex, { status: 'Thinking...' });
        // addLog(`${agent.name} is thinking about goal: "${agent.goal}"`, 'info');

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
            // Pass the CURRENT ontology to the AI so it knows what terms to reuse!
            updateAgent(agentIndex, { status: 'Gardening...' });
            const tags = await aiRef.current.suggestTags(content, currentOntology);

            // Visualize Tag Reuse
            const existingKeys = new Set<string>();
            const traverse = (nodes: OntologyNode[]) => {
                nodes.forEach(n => {
                    if (n.attributes) Object.keys(n.attributes).forEach(k => existingKeys.add(k));
                    if (n.children) traverse(n.children);
                });
            };
            traverse(currentOntology);

            tags.forEach(t => {
                // Parse tag: [key:op:val]
                const match = t.match(/^\[([a-zA-Z0-9_]+)/);
                if (match) {
                    const key = match[1];
                    if (existingKeys.has(key)) {
                        addLog(`♻️ Reused schema: ${key}`, 'reuse');
                    }
                }
            });

            const taggedContent = content + '\n\n' + tags.map((t: string) => JSON.stringify(t)).join(' ');
            updateAgent(agentIndex, { currentDraft: taggedContent });

            // 5. Done - Publish Trigger
            updateAgent(agentIndex, { status: 'Published', goal: 'Wait for matches' });
            addLog(`${agent.name} published a note`, 'info');

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

  const handlePublish = async (note: Note) => {
      // 1. Enrich Note
      const properties = parseProperties(note.content);
      const enrichedNote = { ...note, properties };

      setNetworkNotes(prev => {
          // Prevent duplicates
          const filtered = prev.filter(n => n.id !== enrichedNote.id);
          const newNotes = [enrichedNote, ...filtered];

          // 2. Run Matching Logic
          // Only match against OTHER notes
          filtered.forEach(otherNote => {
             const score1 = matchNotes(enrichedNote, otherNote);
             const score2 = matchNotes(otherNote, enrichedNote);

             if (score1 > 0.5 || score2 > 0.5) {
                 addLog(`MATCH: ${enrichedNote.id.slice(0,4)} <-> ${otherNote.id.slice(0,4)}`, 'match');

                 setNotifications(n => ({
                     ...n,
                     '1': [...(n['1'] || []), `Match found!`],
                     '2': [...(n['2'] || []), `Match found!`]
                 }));
             }
          });

          return newNotes;
      });

      // 3. Evolve Ontology
      if (gardenerRef.current) {
          try {
              const newAttrs = await gardenerRef.current.evolveOntology([enrichedNote]);

              // Only add if not exists
              const currentOntology = ontologyRef.current;
              const existingKeys = new Set<string>();
              const traverse = (nodes: OntologyNode[]) => {
                  nodes.forEach(n => {
                      if (n.attributes) Object.keys(n.attributes).forEach(k => existingKeys.add(k));
                      if (n.children) traverse(n.children);
                  });
              };
              traverse(currentOntology);

              const novelAttrs = newAttrs.filter(a => !existingKeys.has(a.key));

              if (novelAttrs.length > 0) {
                  setOntology(prevOntology => {
                      let newOntology = [...prevOntology];
                      const targetNodeId = newOntology[0]?.id || 'root';

                      novelAttrs.forEach(attr => {
                          addLog(`Ontology + ${attr.key}`, 'ontology');
                          setNewAttributes(prev => [{key: attr.key, type: attr.type}, ...prev].slice(0, 10));

                          const ontAttr: OntologyAttribute = {
                              type: attr.type,
                              description: attr.description,
                              operators: { real: ['is'], imaginary: [] }
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

  const addLog = (msg: string, type: 'info' | 'match' | 'ontology' | 'reuse') => setLogs(prev => [{msg, type}, ...prev].slice(0, 20));

  return (
    <div className="flex flex-col h-full bg-black text-gray-200 p-2 overflow-hidden">
      <div className="flex justify-between items-center mb-2 px-2">
        <h1 className="text-lg font-bold">🧪 Community Simulator</h1>
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
        {/* Agent 1 */}
        <div className="col-span-1 h-full overflow-hidden">
             <AgentSessionWrapper agentId={agents[0].id} ontology={ontology}>
                <AgentSessionView
                    agentName={agents[0].name}
                    currentDraft={agents[0].currentDraft}
                    onDraftChange={(val) => updateAgent(0, { currentDraft: val })}
                    status={agents[0].status}
                    onPublish={handlePublish}
                    notifications={notifications[agents[0].id] || []}
                    minimal={true}
                />
            </AgentSessionWrapper>
        </div>

        {/* Agent 2 */}
        <div className="col-span-1 h-full overflow-hidden">
            <AgentSessionWrapper agentId={agents[1].id} ontology={ontology}>
                <AgentSessionView
                    agentName={agents[1].name}
                    currentDraft={agents[1].currentDraft}
                    onDraftChange={(val) => updateAgent(1, { currentDraft: val })}
                    status={agents[1].status}
                    onPublish={handlePublish}
                    notifications={notifications[agents[1].id] || []}
                    minimal={true}
                />
            </AgentSessionWrapper>
        </div>

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
