import type { AIProvider } from './ai/types';
import type { Note, OntologyAttribute } from '../types';
import { useSettings } from '../hooks/useSettingsContext'; // Wait, this is a hook. Can't use in class/service directly if it's singleton.
// Gardener should be a class or function we invoke.

export class Gardener {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async evolveOntology(notes: Note[]): Promise<AttributeDefinition[]> {
    if (notes.length === 0) return [];

    console.log(`Gardener: Analyzing ${notes.length} notes using ${this.provider.name}...`);

    try {
      const attributes = await this.provider.analyzeOntology(notes);
      console.log('Gardener: Inferred attributes:', attributes);

      // Convert to AttributeDefinition (if strictly different, but types look compatible)
      // Our AppSettings uses OntologyNode[], but here we return flat list of attributes to be merged?
      // types/index.ts has OntologyAttribute and OntologyNode.
      // We need to map InferredAttribute to OntologyAttribute logic.

      return attributes;
    } catch (e) {
      console.error('Gardener failed to evolve ontology:', e);
      return [];
    }
  }
}

// Re-export type for convenience
export type AttributeDefinition = {
  key: string;
  type: OntologyAttribute['type'];
  description?: string;
  usageCount: number;
  sampleValues: string[];
};
