import { useState, useRef, useEffect, useCallback } from 'react';
import { INITIAL_AGENTS, type SimulationAgent } from './types';

export const useSimulationAgents = () => {
  const [agents, setAgents] = useState<SimulationAgent[]>(INITIAL_AGENTS);

  // State Refs for loop access
  const agentsRef = useRef(agents);

  // Keep refs in sync
  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  const updateAgent = useCallback((index: number, updates: Partial<SimulationAgent>) => {
    setAgents(prev => {
        const next = [...prev];
        if (next[index]) {
            next[index] = { ...next[index], ...updates };
        }
        return next;
    });
  }, []);

  const deploySwarm = useCallback((newAgents: SimulationAgent[]) => {
      setAgents(prev => [...prev, ...newAgents]);
  }, []);

  const addAgent = useCallback(() => {
      setAgents(prev => [
          ...prev,
          {
              id: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
              name: `Agent ${prev.length + 1}`,
              persona: "You are a new agent.",
              bio: "New Agent.",
              goal: "Set a goal.",
              currentDraft: "",
              status: "Idle",
              isAgent: true
          }
      ]);
  }, []);

  return {
    agents,
    agentsRef,
    updateAgent,
    deploySwarm,
    addAgent
  };
};
