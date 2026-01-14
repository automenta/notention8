import { useState } from 'react';
import { useSettings } from './useSettingsContext';
import { useNotes } from './useNotes';
import { useGardener } from './useGardener';

export type OntologyTab = 'graph' | 'simulator';

export const useOntologyView = () => {
  const { settings } = useSettings();
  const ontology = settings.ontology;
  const { notes } = useNotes();
  const { evolveOntology } = useGardener();
  const [activeTab, setActiveTab] = useState<OntologyTab>('graph');
  const [isEvolving, setIsEvolving] = useState(false);

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
  };
};
