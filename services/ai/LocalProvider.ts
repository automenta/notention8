import type { AIProvider, InferredAttribute } from './types';
import type { Note } from '../../types';
import { parseProperties } from '../../utils/parsing';
import { getTextFromHtml } from '../../utils/nostr';

export class LocalAIProvider implements AIProvider {
  name = 'Local (Heuristic)';
  isAvailable = true;

  async generateCompletion(): Promise<string> {
    return 'Local AI provider does not support generic text generation yet.';
  }

  async suggestTags(): Promise<string[]> {
    // Simple heuristic: extract capitalized words that appear frequently?
    // Or simpler: just return nothing for now as "AI" auto-tagging.
    // Real implementation could use TF-IDF if we wanted.
    return [];
  }

  async analyzeOntology(notes: Note[]): Promise<InferredAttribute[]> {
    const propertyMap = new Map<string, { count: number; values: Set<string> }>();

    // 1. Scan all notes for properties
    for (const note of notes) {
      // Use existing properties or parse them if missing?
      // Assuming note.properties is populated. If not, we could parse content.
      const props = note.properties.length > 0
        ? note.properties
        : parseProperties(getTextFromHtml(note.content));

      for (const prop of props) {
        if (!propertyMap.has(prop.key)) {
          propertyMap.set(prop.key, { count: 0, values: new Set() });
        }
        const entry = propertyMap.get(prop.key)!;
        entry.count++;
        prop.values.forEach(v => entry.values.add(v));
      }
    }

    // 2. Infer types
    const attributes: InferredAttribute[] = [];

    for (const [key, stats] of propertyMap.entries()) {
      if (stats.count < 1) continue; // Threshold?

      const values = Array.from(stats.values);
      const type = this.inferType(values);

      attributes.push({
        key,
        type,
        usageCount: stats.count,
        sampleValues: values.slice(0, 5),
        description: `Automatically inferred from ${stats.count} notes.`
      });
    }

    return attributes;
  }

  private inferType(values: string[]): InferredAttribute['type'] {
    if (values.length === 0) return 'string';

    // Check for number
    const allNumbers = values.every(v => !isNaN(parseFloat(v)) && isFinite(Number(v)));
    if (allNumbers) return 'number';

    // Check for date (ISO format roughly)
    const allDates = values.every(v => !isNaN(Date.parse(v)));
    if (allDates) return 'date'; // or datetime

    // Check for enum (few unique values relative to total usage?
    // Here we only have unique values set. If set size is small, maybe enum.
    // But hard to know total usage count vs unique count here without keeping more stats.
    if (values.length < 5) return 'enum';

    return 'string';
  }
}
