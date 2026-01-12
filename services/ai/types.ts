import type { Note, OntologyAttribute } from '../../types';

export interface AIProvider {
  name: string;
  isAvailable: boolean;

  /**
   * Generates a text completion for a given prompt.
   */
  generateCompletion(prompt: string): Promise<string>;

  /**
   * Analyzes a set of notes to infer ontology attributes.
   * Returns a list of inferred attributes (key, type, stats).
   */
  analyzeOntology(notes: Note[]): Promise<InferredAttribute[]>;

  /**
   * Suggests tags for a given text.
   */
  suggestTags(text: string): Promise<string[]>;
}

export interface InferredAttribute {
  key: string;
  type: OntologyAttribute['type'];
  description?: string;
  usageCount: number;
  sampleValues: string[];
}
