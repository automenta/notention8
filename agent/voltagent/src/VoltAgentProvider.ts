import {
    Agent, AgentStatus, WorkflowInput, WorkflowResult, ToolInput, ToolResult, MemoryAdapter, Workflow, Tool, MCPServer, Document, SearchOptions, SearchResult, AgentCapabilities, AgentFeature, NoteSource
} from '@notention/core/src/types';
import { VoltAgentTransformer } from './VoltAgentTransformer';
import { Note } from '@notention/core/src/types';
import { propertyExtractionWorkflow, skillMatchingWorkflow, skillExecutionWorkflow } from './workflows';
import { VoltAgent, VAAgent, Memory } from './core/VoltAgentCore';
import { log } from './utils';
import { v4 as uuidv4 } from 'uuid';

// Import logger from the mocks file where it's defined
import { createPinoLogger } from './mocks';

export interface VoltAgentConfig {
    enabled: boolean;
    model: string;
    serverPort: number;
    memoryUrl: string;
    logLevel: string;
    features: {
        memory: boolean;
        rag: boolean;
        mcp: boolean;
        workflows: boolean;
        voice: boolean;
    };
}

export class VoltAgentProvider implements Agent {
    private voltagent: VoltAgent;
    private transformer: VoltAgentTransformer;
    private memory: Memory;
    private noteCallbacks: Array<(note: Note) => void> = [];
    // Store agents locally to allow dynamic tool registration
    private agents: Record<string, VAAgent>;
    private logger: any;

    constructor(config: VoltAgentConfig) {
        this.transformer = new VoltAgentTransformer();

        this.logger = createPinoLogger({
            name: 'notention-voltagent',
            level: config.logLevel || 'info'
        });

        // Create memory storage
        this.memory = new Memory();

        // Create agents according to VoltAgent Quick Start pattern
        this.agents = {
            'semantic-processor': new VAAgent({
                name: 'semantic-processor',
                instructions: `You are a semantic note processor for Notention.
          Transform user notes into structured semantic properties based on the ontology.
          Extract properties, infer relationships, and suggest relevant skills.`,
                model: config.model || 'gpt-4o-mini',
                tools: [],
                memory: config.features.memory ? this.memory : false
            }),
            'skill-executor': new VAAgent({
                name: 'skill-executor',
                instructions: `You execute skills and workflows to interact with external systems.
          Transform semantic notes into external actions and import results back as notes.`,
                model: config.model || 'gpt-4o-mini',
                tools: [],
                memory: config.features.memory ? this.memory : false
            })
        };

        // Initialize VoltAgent
        this.voltagent = new VoltAgent({
            agents: this.agents,
            logger: this.logger
        });

        // Add our predefined workflows to the VoltAgent
        this.voltagent.addWorkflow('property-extraction', propertyExtractionWorkflow);
        this.voltagent.addWorkflow('skill-matching', skillMatchingWorkflow);
        this.voltagent.addWorkflow('skill-execution', skillExecutionWorkflow);
    }

    async start(): Promise<void> {
        await this.voltagent.start();
        this.setupEventHandlers();
        log('VoltAgent', 'Started');
    }

    async stop(): Promise<void> {
        await this.voltagent.stop();
        log('VoltAgent', 'Stopped');
    }

    async getStatus(): Promise<AgentStatus> {
        const health = this.voltagent.health();
        return {
            state: 'running',
            uptime: process.uptime(),
            version: this.voltagent.version,
            capabilities: this.getCapabilities(),
            health: {
                memory: health.memory,
                activeWorkflows: health.activeWorkflows,
                activeTools: health.activeTools
            }
        };
    }

    // === Note Processing ===

    async processNote(note: Note): Promise<Note[]> {
        try {
            const workflowInput = await this.transformer.noteToWorkflowInput(note);

            // Execute the process-note workflow (using property extraction as default)
            const result = await this.executeWorkflow('property-extraction', workflowInput);

            // Transform results back to Notes
            return await this.transformer.workflowResultToNotes(result, note);
        } catch (error) {
            log('VoltAgent', `Error processing note: ${error}`);
            // Return original note if processing fails
            return [note];
        }
    }

    async sendNote(note: Note): Promise<void> {
        const action = await this.transformer.noteToAction(note);
        if (action) {
            try {
                const result = await this.executeTool(action.toolId, action.input);
                log('VoltAgent', `Note action executed: ${JSON.stringify(result)}`);
            } catch (error) {
                log('VoltAgent', `Error executing note action: ${error}`);
            }
        }
    }

    onNoteReceived(callback: (note: Note) => void): void {
        this.noteCallbacks.push(callback);
    }

    private setupEventHandlers() {
        // Set up callbacks for when notes are processed
        // This would connect to VoltAgent's event system when available
    }

    // === VoltAgent Capabilities ===

    async getMemory(): Promise<MemoryAdapter> {
        return this.memory;
    }

    async storeMemory(key: string, value: any): Promise<void> {
        await this.memory.store(key, value);
    }

    async queryMemory(query: string): Promise<any[]> {
        return await this.memory.query(query);
    }

    async getWorkflows(): Promise<Workflow[]> {
        const workflows = this.voltagent.getAllWorkflows();
        return Object.values(workflows);
    }

    async executeWorkflow(workflowId: string, input: WorkflowInput): Promise<WorkflowResult> {
        const workflow = this.voltagent.getWorkflow(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        // If the workflow has an execute function, use it
        if (workflow.execute) {
            return await workflow.execute(input);
        }

        // Otherwise, simulate workflow execution by running through the steps
        let context = { ...input };

        for (const step of workflow.steps) {
            if (step.agent) {
                const agent = this.agents[step.agent];
                if (agent) {
                    // Execute agent step - for now just return context since we don't have real agent execution
                    if (typeof step.prompt === 'function') {
                        const prompt = step.prompt(context);
                        // Simulate agent processing
                        const agentResult = { processed: true, promptUsed: prompt };
                        if (step.output) {
                            context[step.output] = agentResult;
                        } else {
                            context = { ...context, ...agentResult };
                        }
                    }
                }
            } else if (step.tool) {
                // Execute tool step
                const toolResult = await this.executeTool(step.tool, step.input ?
                    typeof step.input === 'function' ? step.input({input: context}) : step.input
                    : context);
                if (step.output) {
                    context[step.output] = toolResult;
                } else {
                    context = { ...context, ...toolResult };
                }
            }
        }

        return context as WorkflowResult;
    }

    async registerWorkflow(workflow: Workflow): Promise<void> {
        this.voltagent.addWorkflow(workflow.id, workflow);
    }

    async getTools(): Promise<Tool[]> {
        return this.voltagent.getAllTools();
    }

    async executeTool(toolId: string, input: ToolInput): Promise<ToolResult> {
        try {
            return await this.voltagent.executeTool(toolId, input);
        } catch (error) {
            return {
                success: false,
                reason: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async registerTool(tool: Tool): Promise<void> {
        // Add tool to all agents or specific agents as needed
        for (const agentName in this.agents) {
            const agent = this.agents[agentName];
            // Add to agent's tools array
            if (Array.isArray(agent.tools)) {
                agent.tools.push(tool);
            }
        }
    }

    async getMCPServers(): Promise<MCPServer[]> {
        // For now, return empty array - this would connect to actual MCP servers when available
        return [];
    }

    async ingestDocument(document: Document): Promise<void> {
        const id = document.id || `doc-${Date.now()}`;
        await this.storeMemory(`rag:${id}`, document);
        log('RAG', `Ingested document ${id}`);
    }

    async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
        const results = await this.queryMemory(query);
        const limit = options?.limit || 10;
        const threshold = options?.threshold || 0.5;

        return results
            .slice(0, limit)
            .map((item: any) => {
                // Calculate a basic similarity score
                const score = this.calculateSimilarity(query, JSON.stringify(item.value));
                if (score >= threshold) {
                    return {
                        document: item.value as Document,
                        score
                    };
                }
                return null;
            })
            .filter((result): result is SearchResult => result !== null);
    }

    private calculateSimilarity(query: string, text: string): number {
        const q = query.toLowerCase();
        const t = text.toLowerCase();

        // Simple word overlap similarity calculation
        const queryWords = q.split(/\s+/);
        const textWords = t.split(/\s+/);

        let matches = 0;
        for (const word of queryWords) {
            if (textWords.includes(word)) {
                matches++;
            }
        }

        return Math.min(matches / queryWords.length, 1.0); // Ensure score doesn't exceed 1.0
    }

    getCapabilities(): AgentCapabilities {
        return {
            memory: true,
            rag: true,
            mcp: true,
            workflows: true,
            tools: true,
            voice: false,
            streaming: true,
            guardrails: true,
            evals: true
        };
    }

    supportsFeature(feature: AgentFeature): boolean {
        return this.getCapabilities()[feature];
    }
}
