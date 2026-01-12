import { useMemo, useCallback } from 'react';
import { useSettings } from './useSettingsContext';
import { Gardener, type AttributeDefinition } from '../services/gardener';
import { LocalAIProvider } from '../services/ai/LocalProvider';
import { RemoteAIProvider } from '../services/ai/RemoteProvider';
import type { Note, OntologyNode, Property } from '../types';

export const useGardener = () => {
  const { settings, setSettings } = useSettings();

  const gardener = useMemo(() => {
    // Instantiate provider based on settings
    const provider = settings.aiEnabled
      ? new RemoteAIProvider() // This will use process.env.API_KEY internally for now, or we should pass it from settings if we stored it there.
      // Actually settings doesn't store API key securely, it's env var.
      : new LocalAIProvider();

    return new Gardener(provider);
  }, [settings.aiEnabled]);

  const evolveOntology = useCallback(async (notes: Note[]) => {
    const newAttributes = await gardener.evolveOntology(notes);

    if (newAttributes.length === 0) return;

    // Merge logic:
    // We need to convert AttributeDefinition[] -> OntologyNode[]
    // For V1, we can just add them to a root node called "Emergent" or "Inferred".
    // Or merge into existing nodes if keys match.

    setSettings(prev => {
        const currentOntology = [...prev.ontology];

        // Find or create "Emergent" category
        let emergentNode = currentOntology.find(n => n.id === 'emergent');
        if (!emergentNode) {
            emergentNode = {
                id: 'emergent',
                label: 'Emergent',
                description: 'Automatically inferred properties',
                attributes: {},
                children: []
            };
            currentOntology.push(emergentNode);
        }

        // Merge attributes
        const updatedAttributes = { ...(emergentNode.attributes || {}) };

        newAttributes.forEach(attr => {
            // Only add if not exists, or update stats?
            // Simple: Overwrite/Add
            updatedAttributes[attr.key] = {
                type: attr.type,
                description: attr.description,
                operators: {
                    // Default operators based on type
                    real: ['is', 'is not'],
                    imaginary: attr.type === 'number' || attr.type === 'date'
                        ? ['greater than', 'less than']
                        : ['contains']
                }
            };
        });

        emergentNode.attributes = updatedAttributes;

        return {
            ...prev,
            ontology: currentOntology
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
          let emergentNode = currentOntology.find(n => n.id === 'emergent');

          if (!emergentNode) {
              emergentNode = {
                  id: 'emergent',
                  label: 'Emergent',
                  description: 'Automatically inferred properties',
                  attributes: {},
                  children: []
              };
              currentOntology.push(emergentNode);
          }

          const updatedAttributes = { ...(emergentNode.attributes || {}) };
          let hasChanges = false;

          properties.forEach(prop => {
              // Check if property key exists anywhere in the ontology
              const keyExists = currentOntology.some(node =>
                  node.attributes && Object.keys(node.attributes).includes(prop.key)
              );

              if (!keyExists && !updatedAttributes[prop.key]) {
                  // Infer type from value
                  // Heuristic: Check first value
                  const val = prop.values[0];
                  let type: 'string' | 'number' | 'date' = 'string';

                  if (!isNaN(parseFloat(val))) type = 'number';
                  else if (!isNaN(Date.parse(val))) type = 'date';

                  updatedAttributes[prop.key] = {
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
              }
          });

          if (!hasChanges) return prev;

          emergentNode.attributes = updatedAttributes;
          return { ...prev, ontology: currentOntology };
      });
  }, [setSettings]);

  return { evolveOntology, learnFromProperties };
};
