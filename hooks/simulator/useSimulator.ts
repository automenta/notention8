import { useState, useRef, useEffect } from 'react';
import type { OntologyNode } from '../../types';
import type { AIProvider } from '../../services/ai/types';
import { Gardener } from '../../services/gardener';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import { WebLLMProvider } from '../../services/ai/WebLLMProvider';
import { MockLLMProvider } from '../../services/ai/MockLLMProvider';
import { useSimulationAgents } from './useSimulationAgents';
import { useSimulationNetwork } from './useSimulationNetwork';

export const useSimulator = () => {
  const { agents, agentsRef, updateAgent } = useSimulationAgents();
  const [active, setActive] = useState(false);

  const [ontology, setOntology] = useState<OntologyNode[]>(DEFAULT_ONTOLOGY);
  const ontologyRef = useRef(ontology);

  const [aiProviderName, setAiProviderName] = useState<string>("Initializing...");

  // AI & Gardener Refs
  const aiRef = useRef<AIProvider | null>(null);
  const gardenerRef = useRef<Gardener | null>(null);

  const {
      networkNotes,
      logs,
      notifications,
      newAttributes,
      handlePublish,
      addLog
  } = useSimulationNetwork(ontologyRef, setOntology, gardenerRef);

  // Initialize AI Provider
  useEffect(() => {
    const initAI = async () => {
        try {
            // Attempt to load WebLLM
            const provider = new WebLLMProvider();

            if (!navigator.gpu) {
                throw new Error("WebGPU not supported");
            }

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
    ontologyRef.current = ontology;
  }, [ontology]);

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
  }, [active, agentsRef, updateAgent, addLog]); // dependencies

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
