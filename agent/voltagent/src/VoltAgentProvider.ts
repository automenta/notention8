import {
    Agent, AgentStatus, WorkflowInput, WorkflowResult, ToolInput, ToolResult, MemoryAdapter, Workflow, Tool, MCPServer, Document, SearchOptions, SearchResult, AgentCapabilities, AgentFeature
} from '@notention/core/src/types';
import { VoltAgentTransformer } from './VoltAgentTransformer';
import { Note } from '@notention/core/src/types';
import { propertyExtractionWorkflow, skillMatchingWorkflow, skillExecutionWorkflow } from './workflows';
import { VoltAgent, LibSQLMemoryAdapter, Memory, createPinoLogger, honoServer, VAAgent } from './mocks';
import { log } from './utils';

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
    private noteCallbacks: Array<(note: Note) => void> = [];

    constructor(config: VoltAgentConfig) {
        this.transformer = new VoltAgentTransformer();

        const logger = createPinoLogger({
            name: 'notention-voltagent',
            level: config.logLevel || 'info'
        });

        // Using mocked LibSQLMemoryAdapter
        const memoryBackend = new LibSQLMemoryAdapter({
            url: config.memoryUrl || 'file:./.notention/voltagent_memory.db'
        });

        const memory = new Memory({
            storage: memoryBackend
        });

        const workflows = {
            'property-extraction': propertyExtractionWorkflow,
            'skill-matching': skillMatchingWorkflow,
            'skill-execution': skillExecutionWorkflow
        };

        this.voltagent = new VoltAgent({
            agents: this.createNotentionAgents(config),
            workflows: workflows,
            server: honoServer({ port: config.serverPort || 3141 }),
            logger,
            memory
        });
    }

    async start(): Promise<void> {
        await this.voltagent.start();
        this.setupEventHandlers();
    }

    async stop(): Promise<void> {
        await this.voltagent.stop();
    }

    async getStatus(): Promise<AgentStatus> {
        const health = await this.voltagent.health();
        return {
            state: 'running',
            uptime: process.uptime(),
            version: this.voltagent.version,
            capabilities: this.getCapabilities(),
            health: {
                memory: health.memory,
                activeWorkflows: health.activeWorkflows || 0,
                activeTools: health.activeTools || 0
            }
        };
    }

    // === Note Processing ===

    async processNote(note: Note): Promise<Note[]> {
        const workflowInput = await this.transformer.noteToWorkflowInput(note);
        // Defaulting to property-extraction as the primary processing workflow
        const result = await this.executeWorkflow('property-extraction', workflowInput);
        return await this.transformer.workflowResultToNotes(result, note);
    }

    async sendNote(note: Note): Promise<void> {
        const action = await this.transformer.noteToAction(note);
        if (action) {
            await this.executeTool(action.toolId, action.input);
        }
    }

    onNoteReceived(callback: (note: Note) => void): void {
        this.noteCallbacks.push(callback);
    }

    private setupEventHandlers() {
        // Placeholder for future event listeners
    }

    // === VoltAgent Capabilities ===

    async getMemory(): Promise<MemoryAdapter> {
        return this.voltagent.memory.storage;
    }

    async storeMemory(key: string, value: any): Promise<void> {
        await this.voltagent.memory.storage.store(key, value);
    }

    async queryMemory(query: string): Promise<any[]> {
        return await this.voltagent.memory.storage.query(query);
    }

    async getWorkflows(): Promise<Workflow[]> {
        return Object.values(this.voltagent.workflows);
    }

    async executeWorkflow(workflowId: string, input: WorkflowInput): Promise<WorkflowResult> {
        const workflow = this.voltagent.workflows[workflowId];
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        if (typeof workflow.execute === 'function') return await workflow.execute(input);

        log('VoltAgent', `Mock executing workflow ${workflowId}`, input);
        return { items: [] };
    }

    async registerWorkflow(workflow: Workflow): Promise<void> {
        this.voltagent.workflows[workflow.id] = workflow;
    }

    async getTools(): Promise<Tool[]> {
        return this.voltagent.getAllTools();
    }

    async executeTool(toolId: string, input: ToolInput): Promise<ToolResult> {
        const tool = this.voltagent.getTool(toolId);
        if (tool) return await tool.execute(input);

        throw new Error(`Tool ${toolId} not found`);
    }

    async registerTool(tool: Tool): Promise<void> {
        this.voltagent.registerTool(tool);
    }

    async getMCPServers(): Promise<MCPServer[]> {
        // Logic: Retrieve connected MCP servers from VoltAgent
        return this.voltagent.getMCPServers();
    }

    async ingestDocument(document: Document): Promise<void> {
        const id = document.id || `doc-${Date.now()}`;
        await this.storeMemory(`rag:${id}`, document);
        log('RAG', `Ingested document ${id}`);
    }

    async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
        const docs = await this.queryMemory('rag:');
        const q = query.toLowerCase();

        return docs
            .filter(doc => doc.content?.toLowerCase().includes(q))
            .map(doc => ({ document: doc, score: 0.9 }));
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

    private createNotentionAgents(config: VoltAgentConfig): Record<string, VAAgent> {
        return {
            'semantic-processor': new VAAgent({
                name: 'semantic-processor',
                instructions: `You are a semantic note processor for Notention.
          Transform user notes into structured semantic properties based on the ontology.
          Extract properties, infer relationships, and suggest relevant skills.`,
                model: config.model || 'gpt-4o-mini',
                tools: this.createSemanticTools(),
                memory: config.features.memory
            }),
            'skill-executor': new VAAgent({
                name: 'skill-executor',
                instructions: `You execute skills and workflows to interact with external systems.
          Transform semantic notes into external actions and import results back as notes.`,
                model: config.model || 'gpt-4o-mini',
                tools: this.createSkillTools(),
                memory: config.features.memory
            })
        };
    }

    private createSemanticTools(): any[] {
        return [];
    }

    private createSkillTools(): any[] {
        return [];
    }
}
