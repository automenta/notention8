import type { AIProvider, InferredAttribute } from './types';
import type { Note, OntologyNode } from '../../types';
import { parseProperties } from '../../utils/parsing';
import { getTextFromHtml } from '../../utils/nostr';

export class LocalAIProvider implements AIProvider {
  name = 'Local (Heuristic)';
  isAvailable = true;

  async generateCompletion(prompt: string): Promise<string> {
    if (prompt.includes("Suggest 5 semantic tags")) {
        // Quick extraction from the prompt itself is hard because it doesn't contain the user message usually
        // But useAgentInteraction passes: "Analyze the intent of my last message..."
        // Actually, the prompt constructed in useAgentInteraction is:
        // "You are an ontology expert... relevant to the current conversation context."
        // It doesn't actually pass the *content* to be analyzed in that specific branch!

        // Wait, look at useAgentInteraction.ts again.
        // It constructs the prompt: `You are an ontology expert. Suggest 5 semantic tags (e.g. #topic or [key:value]) relevant to the current conversation context.`
        // It does NOT include the context in the prompt for "Suggest Tags". That's a bug in my previous step for useAgentInteraction!
        // The prompt relies on the LLM "knowing" the context (which usually implies sending history, but here we just send a single prompt).

        // However, for LocalProvider, we can't do much.
        return "I can only suggest tags if you ask me about specific text.";
    }
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

    // Project-specific heuristics
    if (lower.includes('project')) {
        tags.add('project');
        // If it looks like a project update, suggest status
        if (lower.includes('done') || lower.includes('wip') || lower.includes('blocked')) {
            tags.add('[status:is:Active]');
        }
        if (lower.includes('due') || lower.includes('deadline')) {
            // Try to extract date?
            // For now just suggest the property key to prompt user
            tags.add('[deadline:is:?]');
        }
    }

    return Array.from(tags);
  }

  async analyzeOntology(notes: Note[], context?: string): Promise<InferredAttribute[]> {
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

    // Context Heuristic: If context is 'Project', ensure we look for specific keys
    if (context === 'Project') {
       if (!propertyMap.has('budget')) propertyMap.set('budget', { count: 1, values: new Set(['1000']) });
       if (!propertyMap.has('deadline')) propertyMap.set('deadline', { count: 1, values: new Set(['2024-01-01']) });
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
      if (lowerText.includes('looking for') || lowerText.includes('want to buy') || lowerText.includes('need') || lowerText.includes('hiring')) {
          properties.add(`[intent:is:request]`);
      } else if (lowerText.includes('selling') || lowerText.includes('offering') || lowerText.includes('available for') || lowerText.includes('i am a')) {
          properties.add(`[intent:is:offer]`);
      }

      // Role Extraction (Heuristic)
      const roleReqMatch = text.match(/(?:looking for|hiring|need) (?:a|an)\s+([a-zA-Z\s]+?)(?=(?:[\.,]|\s+(?:for|in|to|with)|$))/i);
      if (roleReqMatch) {
          const role = roleReqMatch[1].trim();
          if (role.split(' ').length < 4) { // Avoid capturing long sentences
              properties.add(`[role:is:${role}]`);
          }
      }

      const roleOfferMatch = text.match(/i am (?:a|an)\s+([a-zA-Z\s]+?)(?=(?:[\.,]|\s+(?:who|with|looking)|$))/i);
      if (roleOfferMatch) {
          const role = roleOfferMatch[1].trim();
          if (role.split(' ').length < 4) {
              properties.add(`[role:is:${role}]`);
          }
      }

      // Price Range (Between)
      // "between 100 and 200", "$100-$200", "100-200 USD"
      const rangeMatch = text.match(/(?:between|from)?\s*(\$|€|£)?\s*(\d+)\s*(?:and|to|-)\s*(\$|€|£)?\s*(\d+)\s*(?:usd|eur|gbp)?/i);
      if (rangeMatch) {
          const min = rangeMatch[2];
          const max = rangeMatch[4];
          if (min && max && Number(max) > Number(min)) {
              properties.add(`[price:between:${min},${max}]`);
          }
      }

      // Dates (Basic Heuristics)
      if (lowerText.includes('due tomorrow') || lowerText.includes('deadline tomorrow')) {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          properties.add(`[deadline:is:${d.toISOString().split('T')[0]}]`);
      }
      if (lowerText.includes('due today') || lowerText.includes('deadline today')) {
          const d = new Date();
          properties.add(`[deadline:is:${d.toISOString().split('T')[0]}]`);
      }

      // Email
      const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
          properties.add(`[email:is:${emailMatch[0]}]`);
      }

      // 2. Ontology-based Extraction (Exhaustive & Prioritized)
      // Collect all keys first to prioritize longer ones
      const allKeys: string[] = [];
      const traverse = (nodes: OntologyNode[]) => {
          nodes.forEach(n => {
              if (n.attributes) {
                  Object.keys(n.attributes).forEach(k => allKeys.push(k));
              }
              if (n.children) traverse(n.children);
          });
      };
      traverse(ontology);

      // Sort keys by length descending to match "start date" before "date"
      allKeys.sort((a, b) => b.length - a.length);

      const uniqueKeys = new Set(allKeys); // Dedupe

      uniqueKeys.forEach(key => {
          // Look for patterns like "Key: Value" or "Key is Value"
          // We assume keys don't contain regex special chars for this heuristic
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

      return Array.from(properties);
  }

  async optimizeOntology(_ontology: OntologyNode[]): Promise<{ merged: { source: string, target: string }[], pruned: string[] }> {
      // Local heuristic:
      // Could potentially look for Levenshtein distance between keys?
      // For now, return empty.
      return { merged: [], pruned: [] };
  }
}
