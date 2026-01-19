import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import type { AIProvider, InferredAttribute } from './types';
import type { Note, OntologyAttribute, OntologyNode } from '../../types';

export class WebLLMProvider implements AIProvider {
  name = 'WebLLM (In-Browser)';
  isAvailable = true;
  private engine: MLCEngine | null = null;
  private modelId = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
  private initPromise: Promise<void> | null = null;
  private useMock = false;

  constructor() {
    // Lazy init on first use
  }

  private async getEngine(): Promise<MLCEngine | null> {
    if (this.engine) return this.engine;
    if (this.useMock) return null;

    if (!this.initPromise) {
      this.initPromise = (async () => {
        console.log('Initializing WebLLM...');
        try {
            // Check if WebGPU is available (basic check)
            if (!navigator.gpu) {
                throw new Error("WebGPU not supported");
            }

            this.engine = await CreateMLCEngine(
                this.modelId,
                {
                    initProgressCallback: (report) => {
                        console.log('WebLLM Loading:', report.text);
                    }
                }
            );
        } catch (e) {
            console.warn("Failed to load WebLLM (falling back to mock):", e);
            this.useMock = true;
        }
      })();
    }

    await this.initPromise;
    return this.engine; // Might be null if failed and useMock is true
  }

  async generateCompletion(prompt: string): Promise<string> {
    const engine = await this.getEngine();
    if (this.useMock || !engine) {
        // Mock Response based on prompt keywords?
        // Simulating Agent Goals
        if (prompt.includes("Client")) return "I need a React developer for a landing page. Budget $500.";
        if (prompt.includes("Freelancer")) return "Expert React developer available for gigs. $50/hr.";
        return "Simulated content response.";
    }

    const response = await engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content || "";
  }

  async suggestTags(text: string, ontology?: OntologyNode[]): Promise<string[]> {
    const engine = await this.getEngine();
    if (this.useMock || !engine) {
        // Mock Tags
        if (text.toLowerCase().includes("react")) return ["[skill:is:React]", "[role:is:Developer]"];
        return ["[category:is:General]"];
    }

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
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.warn("Failed to parse AI tags:", content);
        return [];
    }
  }

  async analyzeOntology(notes: Note[]): Promise<InferredAttribute[]> {
    const engine = await this.getEngine();
    if (this.useMock || !engine) {
        // Mock Ontology Evolution
        // Randomly suggest a new attribute to demonstrate the loop
        const candidates = [
            { key: "availability", type: "string", description: "Project availability" },
            { key: "experience", type: "number", description: "Years of experience" },
            { key: "location", type: "string", description: "Remote or On-site" }
        ] as const;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];

        return [{
            key: pick.key,
            type: pick.type,
            description: pick.description,
            usageCount: 1,
            sampleValues: ["Remote", "5 years"]
        }];
    }

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
            usageCount: 0,
            sampleValues: r.sampleValues || []
        }));
    } catch (e) {
        console.warn("Failed to parse AI ontology:", content);
        return [];
    }
  }
}
