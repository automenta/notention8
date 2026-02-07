import { useState, useCallback, MutableRefObject } from 'react';
import type { NostrEvent } from '../../types';
import type { AIProvider } from '../../services/ai/types';
import { MockLLMProvider } from '../../services/ai/MockLLMProvider';
import type { SimulationAgent } from './types';

interface UseAgentInteractionProps {
    agentsRef: MutableRefObject<SimulationAgent[]>;
    aiRef: MutableRefObject<AIProvider | null>;
    updateAgent: (index: number, updates: Partial<SimulationAgent>) => void;
    addLog: (msg: string, type: 'info' | 'match' | 'ontology' | 'reuse') => void;
}

export function useAgentInteraction({
    agentsRef,
    aiRef,
    updateAgent,
    addLog
}: UseAgentInteractionProps) {
    const [agentMessages, setAgentMessages] = useState<Record<string, (NostrEvent & { content: string })[]>>({});

    const clearAgentMessages = useCallback((agentId: string) => {
        setAgentMessages(prev => {
            const next = { ...prev };
            delete next[agentId];
            return next;
        });
    }, []);

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

            // Check if agent is enabled
            if (agent.enabled === false) {
                 const agentMsg: NostrEvent & { content: string } = {
                    id: Math.random().toString(36),
                    pubkey: agentId,
                    created_at: Math.floor(Date.now() / 1000),
                    kind: 4,
                    tags: [],
                    content: "[Agent is paused]",
                    sig: ''
                };
                setAgentMessages(prev => {
                    const existing = prev[agentId] || [];
                    return { ...prev, [agentId]: [...existing, agentMsg] };
                });
                return;
            }

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
                    } catch {
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

            addLog(`Agent ${agent.name} replied to user.`, 'match');

        }, 1000); // 1 second delay
      }, [addLog, agentsRef, aiRef, updateAgent]);

    return {
        agentMessages,
        setAgentMessages,
        sendMessageToAgent,
        clearAgentMessages
    };
}
