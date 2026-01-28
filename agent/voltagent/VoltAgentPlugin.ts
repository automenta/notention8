import { Plugin } from '../src/plugins/PluginInterface';
import { StrategyManager } from '../src/strategies/StrategyManager';
import { AgentAction } from '../src/strategies/NoteTranslationStrategy';
import { Agent, Memory, tool } from "@voltagent/core";
import { createPinoLogger } from "@voltagent/logger";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export class VoltAgentPlugin implements Plugin {
    id = 'voltagent-integration';
    name = 'VoltAgent Integration';
    description = 'Integrates VoltAgent capabilities with Notention';
    version = '1.0.0';

    private agent: Agent;
    private broadcaster: ((message: any) => void) | null = null;
    private strategyManager: StrategyManager;

    constructor() {
        this.strategyManager = new StrategyManager();

        const logger = createPinoLogger({
            name: "notention-voltagent",
            level: "info",
        });

        // Define tools that bridge to the Frontend UI
        const createNoteTool = tool({
            name: "create_note",
            description: "Create a new note in the notebook",
            parameters: z.object({
                title: z.string().describe("The title of the note"),
                content: z.string().describe("The content of the note"),
                tags: z.array(z.string()).optional().describe("Tags for the note")
            }),
            execute: async (args) => {
                this.broadcast({
                    type: 'agent_tool_call',
                    payload: {
                        tool: 'create_note',
                        args: args,
                        agentId: 'voltagent',
                        timestamp: new Date().toISOString()
                    }
                });
                return "Request sent to create note. The UI will handle this.";
            }
        });

        const updateOntologyTool = tool({
            name: "update_ontology",
            description: "Update the ontology (schema) of the notebook",
            parameters: z.object({
                parentId: z.string().describe("Parent node ID"),
                id: z.string().describe("New node ID"),
                label: z.string().describe("Label for the new node"),
                description: z.string().describe("Description of the new node")
            }),
            execute: async (args) => {
                 this.broadcast({
                    type: 'agent_tool_call',
                    payload: {
                        tool: 'update_ontology',
                        args: args,
                        agentId: 'voltagent',
                        timestamp: new Date().toISOString()
                    }
                });
                return "Request sent to update ontology.";
            }
        });

        this.agent = new Agent({
            name: "notention-assistant",
            instructions: "You are an intelligent agent managing a notebook. You can create notes, update ontology, and answer questions. Use the provided tools to perform actions.",
            model: openai("gpt-4o-mini"),
            // @ts-ignore - Memory constructor requirements vary by version
            memory: new Memory({}),
            tools: [createNoteTool, updateOntologyTool],
            logger
        });
    }

    setBroadcaster(broadcaster: (message: any) => void) {
        this.broadcaster = broadcaster;
    }

    async handleMessage(message: any): Promise<void> {
        if (message.type === 'agent_request' || message.type === 'clawdbot_request') {
             const prompt = message.payload.message || message.payload.prompt;
             if (prompt) {
                 await this.processAgentRequest(prompt, message.id);
             }
        }
    }

    private async processAgentRequest(prompt: string, requestId?: string) {
        try {
            // @ts-ignore - Assuming run method exists in this version of VoltAgent
            const result: any = await this.agent.run({ input: prompt });
            const responseText = result.text || result.output || JSON.stringify(result);

            this.broadcast({
                type: 'agent_response',
                requestId,
                result: { message: responseText }
            });
        } catch (error) {
            console.error('VoltAgent execution error:', error);
            this.broadcast({
                type: 'agent_error',
                requestId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async onNoteCreated(note: any): Promise<void> {
        console.log('VoltAgent: Note created', note.id);
        // Optionally inject into agent memory
    }

    async onNoteUpdated(note: any): Promise<void> {}
    async onNoteDeleted(noteId: string): Promise<void> {}

    private broadcast(msg: any) {
        if (this.broadcaster) this.broadcaster(msg);
    }
}
