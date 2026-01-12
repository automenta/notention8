import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import type { AIProvider, InferredAttribute } from './types';
import type { Note, OntologyAttribute, OntologyNode } from '../../types';

export class WebLLMProvider implements AIProvider {
  name = 'WebLLM (In-Browser)';
  isAvailable = true;
  private engine: MLCEngine | null = null;
  private modelId = "Llama-3.2-3B-Instruct-q4f16_1-MLC"; // Good balance of speed/quality
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Lazy init on first use
  }

  private async getEngine(): Promise<MLCEngine> {
    if (this.engine) return this.engine;

    if (!this.initPromise) {
      this.initPromise = (async () => {
        console.log('Initializing WebLLM...');
        try {
            this.engine = await CreateMLCEngine(
                this.modelId,
                {
                    initProgressCallback: (report) => {
                        console.log('WebLLM Loading:', report.text);
                    }
                }
            );
        } catch (e) {
            console.error("Failed to load WebLLM", e);
            throw e;
        }
      })();
    }

    await this.initPromise;
    if (!this.engine) throw new Error("WebLLM failed to initialize");
    return this.engine;
  }

  async generateCompletion(prompt: string): Promise<string> {
    const engine = await this.getEngine();
    const response = await engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || "";
  }

  async suggestTags(text: string, ontology?: OntologyNode[]): Promise<string[]> {
    const engine = await this.getEngine();

    let ontologyContext = "";
    if (ontology && ontology.length > 0) {
        // Flatten ontology to a list of keys for context
        const keys: string[] = [];
        const traverse = (nodes: OntologyNode[]) => {
            nodes.forEach(n => {
                if (n.attributes) keys.push(...Object.keys(n.attributes));
                if (n.children) traverse(n.children);
            });
        };
        traverse(ontology);
        if (keys.length > 0) {
            ontologyContext = `\nExisting Ontology Keys (Reuse these if relevant): ${keys.join(', ')}`;
        }
    }

    const prompt = `
      Analyze the following text and suggest semantic tags in the format [key:op:value] or [key < value].
      Return ONLY a JSON array of strings. Do not include markdown formatting or explanations.
      ${ontologyContext}

      Text: "${text}"
    `;

    const response = await engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Deterministic
    });

    const content = response.choices[0]?.message?.content || "[]";
    try {
        // Cleanup potential markdown code blocks
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.warn("Failed to parse AI tags:", content);
        return [];
    }
  }

  async analyzeOntology(notes: Note[]): Promise<InferredAttribute[]> {
    const engine = await this.getEngine();
    const sampleText = notes.slice(0, 5).map(n => n.content).join("\n---\n");

    const prompt = `
      Analyze these notes and infer an ontology schema.
      Identify common properties, their types (string, number, date, enum), and usage patterns.
      Return a JSON array of objects with keys: "key", "type", "description", "sampleValues".

      Notes:
      ${sampleText}
    `;

    const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || "[]";
    try {
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const raw = JSON.parse(jsonStr);
        // Map to expected interface
        return raw.map((r: any) => ({
            key: r.key,
            type: r.type as OntologyAttribute['type'],
            description: r.description,
            usageCount: 0, // AI can't count reliably without full context, defaulting
            sampleValues: r.sampleValues || []
        }));
    } catch (e) {
        console.warn("Failed to parse AI ontology:", content);
        return [];
    }
  }
}
