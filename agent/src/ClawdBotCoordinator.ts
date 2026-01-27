import type { Note, ActionSequence, BrowserAction } from '@notention/core';
import { SkillRegistry } from './skills/SkillRegistry';
import { IndeedSkill } from './skills/IndeedSkill';
import { CraigslistSkill } from './skills/CraigslistSkill';
import { GitHubSkill } from './skills/GitHubSkill';
import { EventbriteSkill } from './skills/EventbriteSkill';
import { ZillowSkill } from './skills/ZillowSkill';

/**
 * Browser execution handler interface for ClawdBot/MoltBot integration
 */
export interface BrowserExecutor {
    execute(actions: BrowserAction[]): Promise<unknown[]>;
}

/**
 * ClawdBotCoordinator orchestrates skill execution.
 * 
 * Workflow:
 * 1. User creates note with semantic properties
 * 2. Find matching skills via SkillRegistry
 * 3. Execute skill actions via browser executor
 * 4. Import results as structured notes
 * 5. User reviews/curates imported notes
 */
export class ClawdBotCoordinator {
    private registry: SkillRegistry;
    private browserExecutor?: BrowserExecutor;

    constructor(registry?: SkillRegistry, browserExecutor?: BrowserExecutor) {
        this.registry = registry || new SkillRegistry();
        this.browserExecutor = browserExecutor;
        this.initializeBuiltInSkills();
    }

    private initializeBuiltInSkills(): void {
        const skills = [
            { skill: new IndeedSkill(), meta: { tags: ['jobs', 'employment'], domains: ['indeed.com'] } },
            { skill: new CraigslistSkill(), meta: { tags: ['marketplace', 'products'], domains: ['craigslist.org'] } },
            { skill: new GitHubSkill(), meta: { tags: ['code', 'opensource'], domains: ['github.com'] } },
            { skill: new EventbriteSkill(), meta: { tags: ['events', 'concerts'], domains: ['eventbrite.com'] } },
            { skill: new ZillowSkill(), meta: { tags: ['realestate', 'housing'], domains: ['zillow.com'] } }
        ];

        skills.forEach(({ skill, meta }) =>
            this.registry.register(skill, { ...meta, requiresAuth: false, author: 'notention' })
        );

        console.log(`🤖 ClawdBot initialized with ${skills.length} skills`);
    }

    /**
     * Process note through matching skills, returning action sequences
     */
    async processNote(note: Note): Promise<ActionSequence[]> {
        const matches = this.registry.findMatching(note, 0.5);

        if (!matches.length) {
            console.log(`ℹ️ No matching skills for: "${note.title}"`);
            return [];
        }

        console.log(
            `✨ Found ${matches.length} skill(s):`,
            matches.map(m => `${m.skill.name} (${(m.confidence * 100).toFixed(0)}%)`)
        );

        return matches
            .map(m => {
                try {
                    const sequence = m.skill.exportToActions(note);
                    console.log(`📋 ${sequence.name}${m.skill.preview ? `: ${m.skill.preview(note)}` : ''}`);
                    return sequence;
                } catch (error) {
                    console.error(`❌ Error in ${m.skill.name}:`, error);
                    return null;
                }
            })
            .filter((s): s is ActionSequence => s !== null);
    }

    /**
     * Execute action sequence via browser executor
     */
    async executeActionSequence(sequence: ActionSequence): Promise<Note[]> {
        if (!this.browserExecutor) {
            throw new Error('No browser executor configured. Set via setBrowserExecutor()');
        }

        console.log(`🚀 Executing: ${sequence.name} (${sequence.actions.length} steps)`);

        const scrapedData = await this.browserExecutor.execute(sequence.actions);

        const skillMetadata = this.registry.getAll().find(
            m => sequence.id.includes(m.skill.id) ||
                sequence.id.includes(m.skill.name.toLowerCase().replace(/\s+/g, '-'))
        );

        if (!skillMetadata) {
            console.warn('⚠️ Skill not found for sequence');
            return [];
        }

        const importedNotes = skillMetadata.skill.importFromData(scrapedData, sequence.sourceNote);
        console.log(`✅ Imported ${importedNotes.length} notes from ${skillMetadata.skill.name}`);

        return importedNotes;
    }

    /**
     * End-to-end: Note → Actions → Execution → Imported Notes
     */
    async processAndExecute(note: Note): Promise<Note[]> {
        const sequences = await this.processNote(note);
        if (!sequences.length) return [];

        const results = await Promise.all(
            sequences.map(seq => this.executeActionSequence(seq))
        );

        return results.flat();
    }

    getRegistry(): SkillRegistry {
        return this.registry;
    }

    setBrowserExecutor(executor: BrowserExecutor): void {
        this.browserExecutor = executor;
    }
}

/**
 * Global coordinator singleton
 */
export const clawdBotCoordinator = new ClawdBotCoordinator();

/**
 * Initialize ClawdBot browser integration.
 * Call this to connect to a running ClawdBot instance.
 * 
 * @example
 * ```typescript
 * import { initializeClawdBotIntegration } from './ClawdBotCoordinator';
 * 
 * // Connect to ClawdBot running on default port
 * await initializeClawdBotIntegration();
 * 
 * // Or specify custom options
 * await initializeClawdBotIntegration({
 *   host: '127.0.0.1',
 *   port: 3000,
 *   timeout: 30000
 * });
 * ```
 */
export async function initializeClawdBotIntegration(options?: {
    host?: string;
    port?: number;
    timeout?: number;
}): Promise<void> {
    const { createClawdBotExecutor } = await import('./browser/ClawdBotBrowserAdapter');

    const executor = createClawdBotExecutor(options ?? {});

    // Verify connection
    const available = await executor.isAvailable();
    if (!available) {
        throw new Error('ClawdBot is not available. Make sure ClawdBot is running.');
    }

    // Set executor
    clawdBotCoordinator.setBrowserExecutor(executor);

    console.log('✅ ClawdBot integration initialized');
}

