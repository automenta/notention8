import { useState, useRef, useEffect, useCallback } from 'react';
import type { OntologyNode, NostrEvent } from '../../types';
import type { AIProvider } from '../../services/ai/types';
import { Gardener } from '../../services/gardener';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import { WebLLMProvider } from '../../services/ai/WebLLMProvider';
import { MockLLMProvider } from '../../services/ai/MockLLMProvider';
import { useSimulationAgents } from './useSimulationAgents';
import { useSimulationNetwork } from './useSimulationNetwork';
import { useSimulationLoop } from './useSimulationLoop';

const RANDOM_PERSONAS = [
    {
        name: "Carol (Designer)",
        persona: "You are Carol, a UI/UX designer obsessed with minimalist interfaces.",
        bio: "UI/UX Designer. Minimalist. 🎨",
        goal: "Find design inspiration or offer design reviews."
    },
    {
        name: "Dave (Manager)",
        persona: "You are Dave, a project manager who loves efficient workflows and timelines.",
        bio: "Project Manager. Efficiency expert. 📅",
        goal: "Organize tasks and timelines."
    },
    {
        name: "Eve (Hacker)",
        persona: "You are Eve, a security researcher looking for vulnerabilities.",
        bio: "Security Researcher. White hat. 🔒",
        goal: "Audit code and report bugs."
    },
    {
        name: "Frank (Writer)",
        persona: "You are Frank, a technical writer who values clear documentation.",
        bio: "Technical Writer. Docs are life. 📝",
        goal: "Write documentation for new features."
    },
    {
        name: "Grace (Data)",
        persona: "You are Grace, a data scientist interested in patterns and metrics.",
        bio: "Data Scientist. Patterns everywhere. 📊",
        goal: "Analyze community trends."
    }
];

export const useSimulator = () => {
  const { agents, agentsRef, updateAgent } = useSimulationAgents();
  const [active, setActive] = useState(false);

  const [ontology, setOntology] = useState<OntologyNode[]>(DEFAULT_ONTOLOGY);
  const ontologyRef = useRef(ontology);

  const [aiProviderName, setAiProviderName] = useState<string>("Initializing...");

  // AI & Gardener Refs
  const aiRef = useRef<AIProvider | null>(null);
  const gardenerRef = useRef<Gardener | null>(null);

  // Chat State
  const [agentMessages, setAgentMessages] = useState<Record<string, (NostrEvent & { content: string })[]>>({});

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

            if (('gpu' in navigator)) {
                 // Simple check, robust check involves requesting adapter
            } else {
                 throw new Error("WebGPU not supported");
            }

            // Note: We might want to properly initialize/check WebLLM here
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
  useSimulationLoop({
    active,
    agentsRef,
    updateAgent,
    ontologyRef,
    aiRef,
    gardenerRef,
    addLog,
    setAiProviderName
  });

  const randomizeAgent = useCallback((agentIndex: number) => {
      const random = RANDOM_PERSONAS[Math.floor(Math.random() * RANDOM_PERSONAS.length)];
      updateAgent(agentIndex, {
          name: random.name,
          persona: random.persona,
          bio: random.bio,
          goal: random.goal,
          currentDraft: '',
          status: 'Idle'
      });
      addLog(`Randomized agent to: ${random.name}`, 'info');
  }, [updateAgent, addLog]);

  const sendMessageToAgent = useCallback((agentId: string, content: string) => {
    // 1. Add user message
    const userMsg: NostrEvent & { content: string } = {
        id: Math.random().toString(36),
        pubkey: 'user', // Local user
        created_at: Math.floor(Date.now() / 1000),
        kind: 4,
        tags: [],
        content: content,
        sig: ''
    };

    setAgentMessages(prev => {
        const existing = prev[agentId] || [];
        return { ...prev, [agentId]: [...existing, userMsg] };
    });

    // 2. Simulate response (async)
    setTimeout(async () => {
        const agent = agentsRef.current.find(a => a.id === agentId);
        if (!agent) return;

        let responseText = `I received your message.`;

        // Try to use AI if available
        if (aiRef.current) {
            try {
                // 1. Intent Classification: Is the user setting a new goal?
                const intentPrompt = `
                    Analyze the following user message to an agent.
                    User Message: "${content}"
                    Agent Name: ${agent.name}
                    Current Goal: ${agent.goal}

                    Does the user explicitly instruct the agent to change their goal or work on something specific?
                    If yes, reply with "GOAL: <new_goal_summary>".
                    If no, reply with "CHAT".
                `;
                const intent = await aiRef.current.generateCompletion(intentPrompt);

                if (intent.includes("GOAL:")) {
                    const newGoal = intent.split("GOAL:")[1].trim();
                    updateAgent(agentsRef.current.findIndex(a => a.id === agentId), { goal: newGoal });
                    addLog(`🎯 Agent ${agent.name} new goal: ${newGoal}`, 'match');

                    responseText = await aiRef.current.generateCompletion(
                        `You are ${agent.name}. ${agent.persona}\nUser instructed you to: "${newGoal}".\nReply confirming you will do this.`
                    );
                } else {
                    responseText = await aiRef.current.generateCompletion(
                        `You are ${agent.name}. ${agent.persona}\nUser said: "${content}".\nReply naturally and briefly as if in a chat.`
                    );
                }
            } catch (e) {
                console.error("AI generation failed", e);
                // Fallback to Mock Logic if primary AI fails
                try {
                    const mock = new MockLLMProvider();
                    // Simple intent check for fallback
                    if (content.toLowerCase().includes("goal") && (content.toLowerCase().includes("change") || content.toLowerCase().includes("set"))) {
                        const parts = content.split(":");
                        const newGoal = parts.length > 1 ? parts[1].trim() : content;

                        updateAgent(agentsRef.current.findIndex(a => a.id === agentId), { goal: newGoal });
                        addLog(`🎯 Agent ${agent.name} new goal (Fallback): ${newGoal}`, 'match');
                        responseText = "Understood. I've updated my goal.";
                    } else {
                        responseText = await mock.generateCompletion(
                            `You are ${agent.name}. ${agent.persona}\nUser said: "${content}".\nReply naturally.`
                        );
                    }
                } catch (fallbackErr) {
                    responseText = "I'm having trouble thinking right now.";
                }
            }
        }

        const agentMsg: NostrEvent & { content: string } = {
            id: Math.random().toString(36),
            pubkey: agentId,
            created_at: Math.floor(Date.now() / 1000),
            kind: 4,
            tags: [],
            content: responseText,
            sig: ''
        };

        setAgentMessages(prev => {
            const existing = prev[agentId] || [];
            return { ...prev, [agentId]: [...existing, agentMsg] };
        });

        addLog({ type: 'match', msg: `Agent ${agent.name} replied to user.` });

    }, 1000); // 1 second delay
  }, [addLog]); // agentsRef is stable, aiRef is stable

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
    handlePublish,
    agentMessages,
    sendMessageToAgent,
    randomizeAgent
  };
};
