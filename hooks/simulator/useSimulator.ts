import { useState, useRef, useEffect } from 'react';
import type { OntologyNode } from '../../types';
import type { AIProvider } from '../../services/ai/types';
import { Gardener } from '../../services/gardener';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';
import { WebLLMProvider } from '../../services/ai/WebLLMProvider';
import { MockLLMProvider } from '../../services/ai/MockLLMProvider';
import { useSimulationAgents } from './useSimulationAgents';
import { useSimulationNetwork } from './useSimulationNetwork';
import { useSimulationLoop } from './useSimulationLoop';

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
