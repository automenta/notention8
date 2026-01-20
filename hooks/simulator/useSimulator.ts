import { useState, useRef, useEffect, useCallback } from 'react';
import type { OntologyNode, NostrEvent, Note } from '../../types';
import type { AIProvider } from '../../services/ai/types';
import { Gardener } from '../../services/gardener';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import { mergeAttributes, deleteAttribute, findNode, renameAttribute } from '../../utils/ontologyHelpers';
import { useSimulationAgents } from './useSimulationAgents';
import { useSimulationNetwork } from './useSimulationNetwork';
import { useSimulationLoop } from './useSimulationLoop';
import { useNotes } from '../useNotes';
import { useSettings } from '../useSettingsContext';
import { useView } from '../useViewContext';
import { createAIProvider } from '../../services/ai/factory';
import type { SimulationAgent } from './types';

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
  const { agents, agentsRef, updateAgent, deploySwarm: deploySwarmAgents, addAgent: addNewAgent } = useSimulationAgents();
  const [active, setActive] = useState(false);
  const { notes: userNotes, addNote } = useNotes();
  const { settings } = useSettings();
  const { chatContextNoteId } = useView();

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
      addLog,
      setNetworkNotes
  } = useSimulationNetwork(ontologyRef, setOntology, gardenerRef);

  // Initialize AI Provider from Global Settings
  useEffect(() => {
    const initAI = async () => {
        try {
            const provider = createAIProvider(settings, (msg) => addLog(msg, 'info'));
            aiRef.current = provider;
            setAiProviderName(provider.name);
            gardenerRef.current = new Gardener(provider);
        } catch (e) {
            console.error("AI Init Failed:", e);
            setAiProviderName("Offline");
        }
    };

    initAI();
  }, [settings, addLog]);

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

  const deploySwarm = useCallback((newAgents: SimulationAgent[]) => {
      deploySwarmAgents(newAgents);
      addLog(`Swarm deployed with ${newAgents.length} agents.`, 'info');
  }, [deploySwarmAgents, addLog]);

  const addAgent = useCallback(() => {
      addNewAgent();
      addLog("New agent added manually.", 'info');
  }, [addNewAgent, addLog]);

  const importUserNotes = useCallback(() => {
      setNetworkNotes(prev => {
          const imported = userNotes.filter(un => !prev.some(pn => pn.id === un.id));
          addLog(`Imported ${imported.length} user notes into simulator.`, 'info');
          return [...prev, ...imported];
      });
  }, [userNotes, addLog, setNetworkNotes]);

  const saveNetworkNote = useCallback((note: Note) => {
      addNote(note);
      addLog(`Saved note ${note.id.slice(0,6)} to local notes.`, 'info');
  }, [addNote, addLog]);

  const optimizeOntology = useCallback(async () => {
      if (!gardenerRef.current) return;

      addLog("Starting ontology optimization...", 'info');
      const result = await gardenerRef.current.optimizeOntology(ontologyRef.current);

      if (result.merged.length === 0 && result.pruned.length === 0) {
          addLog("Ontology is already optimized.", 'info');
          return;
      }

      let newOntology = [...ontologyRef.current];

      // Helper to find all nodes containing a key
      const findNodeIdsForKey = (nodes: OntologyNode[], key: string): string[] => {
          let ids: string[] = [];
          for (const node of nodes) {
              if (node.attributes && node.attributes[key]) {
                  ids.push(node.id);
              }
              if (node.children) {
                  ids = ids.concat(findNodeIdsForKey(node.children, key));
              }
          }
          return ids;
      };

      result.merged.forEach(merge => {
          addLog(`[Optimization] Merging '${merge.source}' -> '${merge.target}'`, 'ontology');
          const nodeIds = findNodeIdsForKey(newOntology, merge.source);

          nodeIds.forEach(nodeId => {
             const node = findNode(newOntology, nodeId);
             if (node) {
                 if (node.attributes && node.attributes[merge.target]) {
                     // Target exists: Merge (delete source, keep target)
                     newOntology = mergeAttributes(newOntology, nodeId, merge.source, merge.target);
                 } else {
                     // Target missing: Rename source to target
                     newOntology = renameAttribute(newOntology, nodeId, merge.source, merge.target);
                 }
             }
          });
      });

      result.pruned.forEach(key => {
          addLog(`[Optimization] Pruning '${key}'`, 'ontology');
          const nodeIds = findNodeIdsForKey(newOntology, key);
          nodeIds.forEach(nodeId => {
              newOntology = deleteAttribute(newOntology, nodeId, key);
          });
      });

      setOntology(newOntology);
      addLog("Optimization applied to Simulator Ontology.", 'info');

  }, [addLog]);

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
        // Special Case: System AI
        if (agentId === 'system-ai') {
             let responseText = "I am ready to help.";
             if (aiRef.current) {
                 try {
                     // RAG-lite: Fetch relevant notes for context
                     let contextNotes = userNotes.slice(0, 5);
                     let contextLabel = "recent notes";

                     // If context note is selected, prioritize it
                     if (chatContextNoteId) {
                         const note = userNotes.find(n => n.id === chatContextNoteId);
                         if (note) {
                             contextNotes = [note];
                             contextLabel = "the active note";
                         }
                     }

                     const notesText = contextNotes
                        .map(n => `[Note ${n.id.slice(0,4)}]: ${n.title} - ${n.content.replace(/<[^>]*>/g, '')}`)
                        .join('\n');

                     responseText = await aiRef.current.generateCompletion(
                         `You are a helpful AI Assistant in a note-taking application.
                          You have access to ${contextLabel}:
                          ${notesText}

                          User said: "${content}".
                          Reply helpfully and concisely. If the user asks about their notes, use the context above.`
                     );
                 } catch (e) {
                     console.error("AI generation failed for System AI", e);
                     responseText = "I'm having trouble connecting to the AI provider.";
                 }
             } else {
                 responseText = "AI Provider is not initialized.";
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
            return;
        }

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
    randomizeAgent,
    deploySwarm,
    optimizeOntology,
    importUserNotes,
    addAgent,
    saveNetworkNote
  };
};
