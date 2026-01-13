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
        next[index] = { ...next[index], ...updates };
        return next;
    });
  }, []);

  return {
    agents,
    agentsRef,
    updateAgent
  };
};
