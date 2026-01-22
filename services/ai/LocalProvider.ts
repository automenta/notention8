import type { AIProvider, InferredAttribute } from './types';
import type { Note, OntologyNode } from '../../types';
import { parseProperties } from '../../utils/parsing';
import { getTextFromHtml } from '../../utils/nostr';

export class LocalAIProvider implements AIProvider {
  name = 'Local (Heuristic)';
  isAvailable = true;

  async generateCompletion(): Promise<string> {
    return 'Local AI provider does not support generic text generation yet.';
  }

  async suggestTags(text: string): Promise<string[]> {
    const tags = new Set<string>();

    // 1. Extract existing hashtags
    const matches = text.match(/#[\w-]+/g);
    if (matches) {
        matches.forEach(t => tags.add(t.slice(1)));
    }

    // 2. Keyword heuristics
    const lower = text.toLowerCase();

    if (lower.includes('todo') || lower.includes('task') || lower.includes('do:')) {
        tags.add('task');
    }
    if (lower.includes('meeting') || lower.includes('call with') || lower.includes('sync')) {
        tags.add('meeting');
    }
    if (lower.includes('idea') || lower.includes('concept') || lower.includes('maybe')) {
        tags.add('idea');
    }
    if (lower.includes('bug') || lower.includes('fix') || lower.includes('error')) {
        tags.add('bug');
    }
    if (lower.includes('http') || lower.includes('www')) {
        tags.add('link');
    }

    return Array.from(tags);
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

  async alignToOntology(text: string, ontology: OntologyNode[]): Promise<string[]> {
      // Heuristic: Check for known ontology keys in the text
      const properties = new Set<string>();
      const lowerText = text.toLowerCase();

      // 1. Common Semantic Patterns (Built-in Heuristics)

      // Price / Cost
      const priceMatch = text.match(/(\$|€|£)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/);
      if (priceMatch) {
          properties.add(`[price:is:${priceMatch[2]}]`); // normalized to just number
      } else {
          const currencyMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(USD|EUR|GBP|sats)/i);
          if (currencyMatch) {
              properties.add(`[price:is:${currencyMatch[1]}]`);
          }
      }

      // Intent (Request/Offer)
      if (lowerText.includes('looking for') || lowerText.includes('want to buy') || lowerText.includes('need')) {
          properties.add(`[intent:is:request]`);
      } else if (lowerText.includes('selling') || lowerText.includes('offering') || lowerText.includes('available for')) {
          properties.add(`[intent:is:offer]`);
      }

      // Email
      const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
          properties.add(`[email:is:${emailMatch[0]}]`);
      }

      // 2. Ontology-based Extraction
      const traverse = (nodes: OntologyNode[]) => {
          nodes.forEach(n => {
              if (n.attributes) {
                  Object.keys(n.attributes).forEach(key => {
                      // Skip if we already found this key via built-ins (simple check)
                      // Actually, we might want multiple values.

                      // Look for patterns like "Key: Value" or "Key is Value"
                      const regex = new RegExp(`${key}\\s*(?:is|:|contains)\\s*([\\w\\s@.:/\\-]+)`, 'i');
                      const match = text.match(regex);
                      if (match) {
                          let val = match[1].trim();
                          val = val.replace(/[.,!?;:]$/, ''); // Clean trailing punctuation

                          if (val && val.length < 50) { // Sanity check on length
                              properties.add(`[${key}:is:${val}]`);
                          }
                      }
                  });
              }
              if (n.children) traverse(n.children);
          });
      };
      traverse(ontology);

      return Array.from(properties);
  }

  async optimizeOntology(_ontology: OntologyNode[]): Promise<{ merged: { source: string, target: string }[], pruned: string[] }> {
      // Local heuristic:
      // Could potentially look for Levenshtein distance between keys?
      // For now, return empty.
      return { merged: [], pruned: [] };
  }
}
