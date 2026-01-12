import React, { useMemo } from 'react';
import { NotesContext } from '../contexts/NotesContext';
import { useNotesState } from '../../hooks/useNotesState';
import { SettingsContext } from '../contexts/SettingsContext';
import localforage from 'localforage';
import type { ReactNode } from 'react';
import { DEFAULT_ONTOLOGY } from '../../utils/ontology.default';

interface Props {
  agentId: string;
  children: ReactNode;
}

export const AgentSessionWrapper: React.FC<Props> = ({ agentId, children }) => {
  // Create a unique localForage instance for this agent
  const driver = useMemo(() => {
    return localforage.createInstance({
      name: `agent-${agentId}`
    });
  }, [agentId]);

  // Initialize notes state with this driver
  const notesState = useNotesState(driver);

  // For the simulation, we provide a static settings context.
  // In a deeper implementation, we could also use useLocalForage for settings.
  const settingsState = useMemo(() => ({
    settings: {
      aiEnabled: true, // Force AI on for agents
      developerMode: false,
      theme: 'dark' as const,
      nostr: {
        privkey: null, // Agents handle keys separately
      },
      ontology: DEFAULT_ONTOLOGY,
    },
    setSettings: () => {}, // No-op for now
    settingsLoading: false
  }), []);

  return (
    <SettingsContext.Provider value={settingsState}>
      <NotesContext.Provider value={notesState}>
        {children}
      </NotesContext.Provider>
    </SettingsContext.Provider>
  );
};
