import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import type { AIProvider, InferredAttribute } from './types';
import type { Note, OntologyAttribute, OntologyNode } from '../../types';
import { WebLLMChatModel } from './LangChainAdapters';
import { HumanMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';

export const AVAILABLE_MODELS = [
    { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", label: "Llama 3.2 3B (Balanced)" },
    { id: "Llama-3.2-1B-Instruct-q4f16_1-MLC", label: "Llama 3.2 1B (Fast, Lower Quality)" },
    { id: "RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC", label: "RedPajama 3B" }
];

export class WebLLMProvider implements AIProvider {
  name = 'WebLLM (In-Browser)';
  isAvailable = true;
  private engine: MLCEngine | null = null;
  private chatModel: WebLLMChatModel | null = null;
  private modelId: string;
  private initPromise: Promise<void> | null = null;

  constructor(modelId: string = "Llama-3.2-3B-Instruct-q4f16_1-MLC") {
    this.modelId = modelId;
  }

  private async getChatModel(): Promise<WebLLMChatModel | null> {
      if (this.chatModel) return this.chatModel;

      if (!this.initPromise) {
          this.initPromise = (async () => {
             try {
                 if (!navigator.gpu) throw new Error("WebGPU not supported");
                 this.engine = await CreateMLCEngine(
                     this.modelId,
                     { initProgressCallback: () => {} }
                 );
                 this.chatModel = new WebLLMChatModel(this.engine, this.modelId);
             } catch (e) {
                 console.warn("Failed to load WebLLM:", e);
                 throw e;
             }
          })();
      }

      try {
          await this.initPromise;
          return this.chatModel;
      } catch {
          return null;
      }
  }

  async generateCompletion(prompt: string): Promise<string> {
    const model = await this.getChatModel();
    if (!model) throw new Error("WebLLM engine not available");

    try {
        const response = await model.invoke([new HumanMessage(prompt)]);
        return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    } catch (e) {
        console.warn("WebLLM Generation Error:", e);
        return "";
    }
  }

  async suggestTags(text: string, ontology?: OntologyNode[]): Promise<string[]> {
    const model = await this.getChatModel();
    if (!model) throw new Error("WebLLM engine not available");

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

    const prompt = `
      Analyze the following text and suggest semantic tags in the format [key:op:value] or [key < value].
      Return ONLY a JSON array of strings. Do not include markdown formatting or explanations.
      ${ontologyContext}

      Text: "${text}"
    `;

    try {
        const parser = new JsonOutputParser();
        const response = await this.generateCompletion(prompt);
        const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return await parser.parse(jsonStr);
    } catch {
        // Fallback or empty
        return [];
    }
  }

  async analyzeOntology(notes: Note[]): Promise<InferredAttribute[]> {
    const model = await this.getChatModel();
    if (!model) throw new Error("WebLLM engine not available");

    const sampleText = notes.slice(0, 5).map(n => n.content).join("\n---\n");

    const prompt = `
      Analyze these notes and infer an ontology schema.
      Identify common properties, their types (string, number, date, enum), and usage patterns.
      Return a JSON array of objects with keys: "key", "type", "description", "sampleValues".

      Notes:
      ${sampleText}
    `;

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
    } catch {
        return [];
    }
  }

  async alignToOntology(text: string, ontology: OntologyNode[]): Promise<string[]> {
    return this.suggestTags(text, ontology);
  }

  async optimizeOntology(ontology: OntologyNode[]): Promise<{ merged: { source: string, target: string }[], pruned: string[] }> {
    const model = await this.getChatModel();
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
    } catch {
        return { merged: [], pruned: [] };
    }
  }
}
