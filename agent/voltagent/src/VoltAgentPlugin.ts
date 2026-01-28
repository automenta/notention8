import { Plugin } from '@notention/agent';
import { VoltAgentProvider, VoltAgentConfig } from './VoltAgentProvider';

export class VoltAgentPlugin implements Plugin {
    id = 'voltagent-integration';
    name = 'VoltAgent Integration';
    description = 'Integrates VoltAgent capabilities with Notention';
    version = '1.0.0';

    private provider: VoltAgentProvider;

    constructor(config: VoltAgentConfig) {
        this.provider = new VoltAgentProvider(config);
    }

    async initialize() {
        console.log('VoltAgent plugin initialized');
        await this.provider.start();
    }

    async destroy() {
        console.log('VoltAgent plugin destroyed');
        await this.provider.stop();
    }

    async onNoteCreated(note: any): Promise<void> {
        await this.provider.processNote(note);
    }

    async onNoteUpdated(note: any): Promise<void> {
        await this.provider.processNote(note);
    }

    async onNoteDeleted(noteId: string): Promise<void> {
        // Implementation for cleanup if needed
    }

    getAPI() {
        return this.provider;
    }
}
