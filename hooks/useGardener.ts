import { useMemo, useCallback } from 'react';
import { useSettings } from './useSettingsContext';
import { useToast } from '../components/contexts/ToastContext';
import { Gardener } from '../services/gardener';
import { createAIProvider } from '../services/ai/factory';
import type { Note, Property, OntologyNode } from '../types';

// Helper to merge attributes into the "Emergent" node
const mergeAttributesToEmergent = (ontology: OntologyNode[], newAttributes: Record<string, any>): OntologyNode[] => {
    const updatedOntology = [...ontology];
    let emergentNode = updatedOntology.find(n => n.id === 'emergent');

    if (!emergentNode) {
        emergentNode = {
            id: 'emergent',
            label: 'Emergent',
            description: 'Automatically inferred properties',
            attributes: {},
            children: []
        };
        updatedOntology.push(emergentNode);
    }

    emergentNode.attributes = {
        ...(emergentNode.attributes || {}),
        ...newAttributes
    };

    return updatedOntology;
};

export const useGardener = () => {
  const { settings, setSettings } = useSettings();
  const { addToast } = useToast();

  const gardener = useMemo(() => {
    const provider = createAIProvider(settings, (msg) => addToast(msg, 'info'));
    return new Gardener(provider);
  }, [settings, addToast]); // createAIProvider depends on settings

  const evolveOntology = useCallback(async (notes: Note[]) => {
    const newAttributes = await gardener.evolveOntology(notes);

    if (newAttributes.length === 0) return [];

    setSettings(prev => {
        const currentOntology = [...prev.ontology];
        const newAttrsMap: Record<string, any> = {};

        newAttributes.forEach(attr => {
            newAttrsMap[attr.key] = {
                type: attr.type,
                description: attr.description,
                operators: {
                    real: ['is', 'is not'],
                    imaginary: attr.type === 'number' || attr.type === 'date'
                        ? ['greater than', 'less than']
                        : ['contains']
                }
            };
        });

        return {
            ...prev,
            ontology: mergeAttributesToEmergent(currentOntology, newAttrsMap)
        };
    });

    return newAttributes;
  }, [gardener, setSettings]);

  /**
   * Learns ontology attributes from a set of observed properties (e.g. from network events).
   * This is "Passive Learning".
   */
  const learnFromProperties = useCallback((properties: Property[]) => {
      if (!properties || properties.length === 0) return;

      setSettings(prev => {
          const currentOntology = [...prev.ontology];
          const newAttrsMap: Record<string, any> = {};
          let hasChanges = false;

          properties.forEach(prop => {
              // Check if property key exists anywhere in the ontology
              const keyExists = currentOntology.some(node =>
                  node.attributes && Object.keys(node.attributes).includes(prop.key)
              );

              // Also check if we already added it to newAttrsMap in this batch (though usually duplicates are filtered upstream or just overwritten)
              if (!keyExists && !newAttrsMap[prop.key]) {
                  const val = prop.values[0];
                  let type: 'string' | 'number' | 'date' = 'string';

                  if (!isNaN(parseFloat(val))) type = 'number';
                  else if (!isNaN(Date.parse(val))) type = 'date';

                  newAttrsMap[prop.key] = {
                      type,
                      description: 'Inferred from network',
                      operators: {
                        real: ['is', 'is not'],
                        imaginary: type === 'number' || type === 'date'
                            ? ['greater than', 'less than']
                            : ['contains']
                      }
                  };
                  hasChanges = true;
                  addToast(`New concept discovered: ${prop.key}`, 'info');
              }
          });

          if (!hasChanges) return prev;

          return { ...prev, ontology: mergeAttributesToEmergent(currentOntology, newAttrsMap) };
      });
  }, [setSettings, addToast]);

  const alignToOntology = useCallback(async (text: string, ontology: any[]) => {
      return await gardener.alignToOntology(text, ontology);
  }, [gardener]);

  const optimizeOntology = useCallback(async () => {
      const result = await gardener.optimizeOntology(settings.ontology);

      if (result.merged.length > 0 || result.pruned.length > 0) {
           addToast(`Optimization Report: ${result.merged.length} potential merges`, 'info');
      } else {
           addToast('No obvious optimizations found.', 'info');
      }
      return result;
  }, [gardener, settings.ontology, addToast]);

  const generateCompletion = useCallback(async (prompt: string) => {
      return await gardener.generateCompletion(prompt);
  }, [gardener]);

  return { evolveOntology, learnFromProperties, alignToOntology, optimizeOntology, generateCompletion };
};
