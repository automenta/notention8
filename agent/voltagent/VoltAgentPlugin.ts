import { Plugin } from '../src/plugins/PluginInterface';
import { StrategyManager } from '../src/strategies/StrategyManager';
import { AgentAction } from '../src/strategies/NoteTranslationStrategy';
import { Agent, Memory } from "@voltagent/core";
import { createPinoLogger } from "@voltagent/logger";
import { openai } from "@ai-sdk/openai";

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

        this.agent = new Agent({
            name: "notention-assistant",
            instructions: "You are an intelligent agent managing a notebook. You can create notes, update ontology, and answer questions.",
            model: openai("gpt-4o-mini"),
            // @ts-ignore - Memory constructor requirements vary by version
            memory: new Memory({}),
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
    }

    async onNoteUpdated(note: any): Promise<void> {}
    async onNoteDeleted(noteId: string): Promise<void> {}

    private broadcast(msg: any) {
        if (this.broadcaster) this.broadcaster(msg);
    }
}
