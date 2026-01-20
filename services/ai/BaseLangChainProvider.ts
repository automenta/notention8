import type { AIProvider, InferredAttribute } from './types';
import type { Note, OntologyAttribute, OntologyNode } from '../../types';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';

export abstract class BaseLangChainProvider implements AIProvider {
  abstract name: string;
  abstract isAvailable: boolean;

  protected abstract getModel(): Promise<BaseChatModel | null>;

  async generateCompletion(prompt: string): Promise<string> {
    const model = await this.getModel();
    if (!model) throw new Error(`${this.name} model not available`);

    try {
      const response = await model.invoke([new HumanMessage(prompt)]);
      return typeof response.content === 'string' ? response.content.trim() : JSON.stringify(response.content);
    } catch (e) {
      console.error(`${this.name} Generation Error:`, e);
      throw e;
    }
  }

  async validateConnection(): Promise<boolean> {
      try {
          const model = await this.getModel();
          if (!model) return false;
          await model.invoke([new HumanMessage("Hello")]);
          return true;
      } catch (e) {
          console.warn(`${this.name} Connection Validation Failed:`, e);
          return false;
      }
  }

  async suggestTags(text: string, ontology?: OntologyNode[]): Promise<string[]> {
    const model = await this.getModel();
    if (!model) throw new Error(`${this.name} model not available`);

    // Extract ontology keys for context
    const ontologyKeys = new Set<string>();
    if (ontology) {
        const traverse = (nodes: OntologyNode[]) => {
            nodes.forEach(n => {
                if (n.attributes) Object.keys(n.attributes).forEach(k => ontologyKeys.add(k));
                if (n.children) traverse(n.children);
            });
        };
        traverse(ontology);
    }

    let ontologyContext = "";
    if (ontologyKeys.size > 0) {
        ontologyContext = `\nExisting Ontology Keys (Reuse these if relevant): ${Array.from(ontologyKeys).join(', ')}`;
    }

    const prompt = `Analyze the following note content and suggest up to 5 relevant tags.
Return ONLY a valid JSON array of strings (e.g., ["tag1", "tag2"]).
Tags should be lowercase, single words or short phrases.
${ontologyContext}

Note Content:
${text}`;

    try {
      const parser = new JsonOutputParser();
      const response = await this.generateCompletion(prompt);
      const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return await parser.parse(jsonStr);
    } catch (e) {
      console.error(`${this.name} Tag Suggestion Error:`, e);
      return [];
    }
  }

  async analyzeOntology(notes: Note[]): Promise<InferredAttribute[]> {
    const model = await this.getModel();
    if (!model) throw new Error(`${this.name} model not available`);

    const sampleText = notes.slice(0, 5).map(n => {
         return n.properties.map(p => `${p.key}: ${p.values.join(', ')}`).join('; ') || n.content.substring(0, 200);
    }).join("\n---\n");

    const prompt = `Analyze the following list of property usages or content samples from a set of notes.
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
${sampleText}`;

    try {
        const parser = new JsonOutputParser();
        const response = await this.generateCompletion(prompt);
        const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const raw = await parser.parse(jsonStr);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return raw.map((r: any) => ({
            key: r.key,
            type: r.type as OntologyAttribute['type'],
            description: r.description,
            usageCount: 0,
            sampleValues: r.sampleValues || []
        }));
    } catch (e) {
        console.error(`${this.name} Ontology Analysis Error:`, e);
        return [];
    }
  }

  async alignToOntology(text: string, ontology: OntologyNode[]): Promise<string[]> {
      const model = await this.getModel();
      if (!model) throw new Error(`${this.name} model not available`);

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
          console.error(`${this.name} Alignment Error:`, e);
          return [];
      }
  }

  async optimizeOntology(ontology: OntologyNode[]): Promise<{ merged: { source: string, target: string }[], pruned: string[] }> {
      const model = await this.getModel();
      if (!model) return { merged: [], pruned: [] };

      // Extract all attributes with their descriptions
      const attributes: { key: string; description: string }[] = [];
      const traverse = (nodes: OntologyNode[]) => {
          nodes.forEach(n => {
              if (n.attributes) {
                  Object.entries(n.attributes).forEach(([key, attr]) => {
                      attributes.push({ key, description: attr.description || '' });
                  });
              }
              if (n.children) traverse(n.children);
          });
      };
      traverse(ontology);

      if (attributes.length < 2) return { merged: [], pruned: [] };

      const prompt = `
      Analyze the following ontology attributes and identify pairs that are synonymous or highly redundant and should be merged.
      Return a JSON object with a "merged" property containing an array of objects, each with "source" (the less common or less descriptive key) and "target" (the preferred key).
      Also include a "pruned" property for keys that look like spam or are completely irrelevant.
      Return ONLY valid JSON.

      Attributes:
      ${JSON.stringify(attributes, null, 2)}
    `;

      try {
          const parser = new JsonOutputParser();
          const response = await this.generateCompletion(prompt);
          const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          const result = await parser.parse(jsonStr);
          return {
              merged: Array.isArray(result.merged) ? result.merged : [],
              pruned: Array.isArray(result.pruned) ? result.pruned : []
          };
      } catch (e) {
          console.error(`${this.name} Optimization Error:`, e);
          return { merged: [], pruned: [] };
      }
  }
}
