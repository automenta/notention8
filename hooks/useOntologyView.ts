import { useState } from 'react';
import { useSettings } from './useSettingsContext';
import { useNotes } from './useNotes';
import { useGardener } from './useGardener';

export type OntologyTab = 'graph' | 'simulator';

import { useMemo } from 'react';

export const useOntologyView = () => {
  const { settings } = useSettings();
  const ontology = settings.ontology;
  const { notes } = useNotes();
  const { evolveOntology } = useGardener();
  const [activeTab, setActiveTab] = useState<OntologyTab>('graph');
  const [isEvolving, setIsEvolving] = useState(false);

  // Calculate usage stats
  const usageStats = useMemo(() => {
    const stats = new Map<string, number>();

    notes.forEach(note => {
      // Count property usage
      note.properties.forEach(prop => {
        const current = stats.get(prop.key) || 0;
        stats.set(prop.key, current + 1);
      });
      // Also count tags matching ontology node IDs?
      // Tags are strings. If tag matches node.id or node.label
      note.tags.forEach(tag => {
          const t = tag.toLowerCase(); // simplified
          const current = stats.get(t) || 0;
          stats.set(t, current + 1);
      });
    });

    return stats;
  }, [notes]);

  const handleEvolve = async () => {
    setIsEvolving(true);
    await evolveOntology(notes);
    setIsEvolving(false);
    alert('Ontology updated based on local notes!');
  };

  return {
    settings,
    ontology,
    activeTab,
    setActiveTab,
    isEvolving,
    handleEvolve,
    usageStats,
  };
};
