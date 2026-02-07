import type { AIProvider } from './ai/types';
import type { Note, OntologyAttribute } from '../types';

export class Gardener {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async evolveOntology(notes: Note[]): Promise<AttributeDefinition[]> {
    if (notes.length === 0) return [];

    try {
      const attributes = await this.provider.analyzeOntology(notes);

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
