import { useState, useRef, useEffect } from 'react';
import type { Note, OntologyNode, OntologyAttribute } from '../../types';
import type { AIProvider } from '../../services/ai/types';
import { Gardener } from '../../services/gardener';
import { parseProperties } from '../../utils/parsing';
import { matchNotes } from '../../utils/matching';
import { addAttribute } from '../../utils/ontologyHelpers';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import { WebLLMProvider } from '../../services/ai/WebLLMProvider';
import { MockLLMProvider } from '../../services/ai/MockLLMProvider';

export interface SimulationAgent {
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

export const useSimulator = () => {
  const [agents, setAgents] = useState<SimulationAgent[]>(INITIAL_AGENTS);
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState<{msg: string; type: 'info' | 'match' | 'ontology' | 'reuse'}[]>([]);
  const [networkNotes, setNetworkNotes] = useState<Note[]>([]); // Shared Network State
  const [ontology, setOntology] = useState<OntologyNode[]>(DEFAULT_ONTOLOGY);
  const [notifications, setNotifications] = useState<Record<string, string[]>>({});
  const [newAttributes, setNewAttributes] = useState<{key: string; type: string}[]>([]);
  const [aiProviderName, setAiProviderName] = useState<string>("Initializing...");

  // AI & Gardener Refs
  const aiRef = useRef<AIProvider | null>(null);
  const gardenerRef = useRef<Gardener | null>(null);

  // State Refs for loop access
  const agentsRef = useRef(agents);
  const ontologyRef = useRef(ontology);

  const addLog = (msg: string, type: 'info' | 'match' | 'ontology' | 'reuse') => setLogs(prev => [{msg, type}, ...prev].slice(0, 20));

  // Initialize AI Provider
  useEffect(() => {
    const initAI = async () => {
        try {
            // Attempt to load WebLLM
            const provider = new WebLLMProvider();
            // Trigger an init check (e.g. by generating something small or just checking GPU)
            // But WebLLMProvider constructor is lazy. We need to force a check or just assume it works until first call.
            // However, our requirement is to fallback if "WebLLMProvider fails".
            // Let's rely on checking `navigator.gpu` explicitly here as a proxy,
            // since WebLLMProvider throws if it's missing.

            if (!navigator.gpu) {
                throw new Error("WebGPU not supported");
            }

            // We could also try to await provider.getEngine() if exposed, but it's private.
            // Let's assume if GPU exists, we try. If it fails later, we might need robust error handling in the loop.
            // For now, let's stick to the plan: explicit fallback on initialization.

            aiRef.current = provider;
            setAiProviderName(provider.name);
        } catch (e) {
            console.warn("WebLLM failed to initialize, falling back to Mock:", e);
            aiRef.current = new MockLLMProvider();
            setAiProviderName(aiRef.current.name);
        }

        if (aiRef.current) {
            gardenerRef.current = new Gardener(aiRef.current);
        }
    };

    initAI();
  }, []);

  // Keep refs in sync
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  useEffect(() => {
    ontologyRef.current = ontology;
  }, [ontology]);

  const updateAgent = (index: number, updates: Partial<SimulationAgent>) => {
    setAgents(prev => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
    });
  };

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
        if (!aiRef.current) return; // Wait for AI init

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

        // 2. AI Generation
        try {
            const prompt = `
                ${agent.persona}
                Your current goal is: ${agent.goal}
                Write a short note content that achieves this goal.
                Keep it under 20 words.
                Do not include tags yet.
            `;

            // Fallback handling inside the loop in case runtime error occurs
            let content = "";
            try {
                content = await aiRef.current.generateCompletion(prompt);
            } catch (e) {
                console.error("AI Generation failed:", e);
                // Last ditch fallback if main provider crashes mid-loop
                if (aiRef.current instanceof WebLLMProvider) {
                   addLog("WebLLM crashed, switching to Mock", 'info');
                   aiRef.current = new MockLLMProvider();
                   setAiProviderName(aiRef.current.name);
                   gardenerRef.current = new Gardener(aiRef.current);
                   content = await aiRef.current.generateCompletion(prompt);
                } else {
                   throw e;
                }
            }

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

  return {
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
  };
};
