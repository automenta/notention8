import type { AIProvider, InferredAttribute } from './types';
import type { Note, OntologyNode } from '../../types';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';

export const isGeminiApiKeyAvailable = (userKey?: string): boolean => {
  const key = userKey || process.env.API_KEY;
  return !!(key && key !== 'YOUR_GEMINI_API_KEY');
};

export class RemoteAIProvider implements AIProvider {
  name = 'Google Gemini (LangChain)';
  isAvailable: boolean;
  private model: ChatGoogleGenerativeAI | null = null;
  private modelName = 'gemini-1.5-flash';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.API_KEY;
    this.isAvailable = !!(key && key !== 'YOUR_GEMINI_API_KEY');
    if (this.isAvailable) {
      this.model = new ChatGoogleGenerativeAI({
        apiKey: key || '',
        modelName: this.modelName,
        maxOutputTokens: 2048,
        temperature: 0.1
      });
    }
  }

  async generateCompletion(prompt: string): Promise<string> {
    if (!this.model) throw new Error('AI Provider not configured');

    try {
      const response = await this.model.invoke([
        new HumanMessage(prompt)
      ]);
      return typeof response.content === 'string' ? response.content.trim() : JSON.stringify(response.content);
    } catch (e) {
      console.error('AI Generation Error:', e);
      throw e;
    }
  }

  async suggestTags(text: string): Promise<string[]> {
    if (!this.model) throw new Error('AI Provider not configured');

    const prompt = `Analyze the following note content and suggest up to 5 relevant tags.
Return ONLY a valid JSON array of strings (e.g., ["tag1", "tag2"]).
Tags should be lowercase, single words or short phrases.

Note Content:
${text}`;

    try {
      const parser = new JsonOutputParser();
      const response = await this.generateCompletion(prompt);
      // Clean markdown code blocks if present before parsing
      const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return await parser.parse(jsonStr);
    } catch (e) {
      console.error('Tag Suggestion Error:', e);
      return [];
    }
  }

  async analyzeOntology(notes: Note[]): Promise<InferredAttribute[]> {
    if (!this.model) throw new Error('AI Provider not configured');

    const propertySummary = notes.map(n => {
        return n.properties.map(p => `${p.key}: ${p.values.join(', ')}`).join('; ');
    }).filter(s => s).join('\n');

    const prompt = `Analyze the following list of property usages from a set of notes.
Infer a schema (ontology) for these properties.
For each unique property key, determine its likely data type (string, number, date, enum, geo) and provide a description.

Return ONLY a valid JSON array of objects with this structure:
{
  "key": "property_name",
  "type": "string|number|date|enum|geo",
  "description": "short description",
  "usageCount": number (estimate based on list),
  "sampleValues": ["val1", "val2"]
}

Data:
${propertySummary}`;

    try {
        const parser = new JsonOutputParser();
        const response = await this.generateCompletion(prompt);
        const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return await parser.parse(jsonStr);
    } catch (e) {
        console.error('Ontology Analysis Error:', e);
        return [];
    }
  }

  async alignToOntology(text: string, ontology: OntologyNode[]): Promise<string[]> {
      if (!this.model) throw new Error('AI Provider not configured');

      const knownKeys = new Set<string>();
      const traverse = (nodes: OntologyNode[]) => {
          nodes.forEach(n => {
              if (n.attributes) Object.keys(n.attributes).forEach(k => knownKeys.add(k));
              if (n.children) traverse(n.children);
          });
      };
      traverse(ontology);
      const knownKeysStr = Array.from(knownKeys).join(', ');

      const prompt = `Analyze the text below and extract semantic properties in the format "[key:operator:value]".
Use the following known keys if applicable to encourage schema reuse: ${knownKeysStr}.
If a new key is needed, create one that is concise and descriptive.

Valid operators: "is", "is not", "contains", "greater than", "less than".

IMPORTANT: For "location" or other "geo" type fields, try to output latitude and longitude in the format "lat,lng" if possible to infer from the text.
Example output:
- ["[skill:is:React]", "[location:is:40.7128,-74.0060]", "[experience:greater than:5]"]

Return ONLY a valid JSON array of strings.

Text:
${text}`;

      try {
          const parser = new JsonOutputParser();
          const response = await this.generateCompletion(prompt);
          const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          return await parser.parse(jsonStr);
      } catch (e) {
          console.error('Alignment Error:', e);
          return [];
      }
  }

  async optimizeOntology(ontology: OntologyNode[]): Promise<{ merged: { source: string, target: string }[], pruned: string[] }> {
      if (!this.model) throw new Error('AI Provider not configured');

      const knownKeys = new Set<string>();
      const traverse = (nodes: OntologyNode[]) => {
          nodes.forEach(n => {
              if (n.attributes) Object.keys(n.attributes).forEach(k => knownKeys.add(k));
              if (n.children) traverse(n.children);
          });
      };
      traverse(ontology);
      const keys = Array.from(knownKeys);

      if (keys.length === 0) return { merged: [], pruned: [] };

      const prompt = `Analyze the following list of attribute keys from an ontology schema.
Identify potential optimizations, such as:
1. Merging synonymous keys (e.g., "cost" and "price").
2. Pruning keys that look like typos or are redundant.

Return a JSON object with two arrays:
"merged": Array of objects { "source": "old_key", "target": "new_key" }
"pruned": Array of strings (keys to remove)

Keys:
${keys.join(', ')}`;

      try {
          const parser = new JsonOutputParser();
          const response = await this.generateCompletion(prompt);
          const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          return await parser.parse(jsonStr);
      } catch (e) {
          console.error('Optimization Error:', e);
          return { merged: [], pruned: [] };
      }
  }
}
