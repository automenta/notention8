import { Note, Property } from './types/index.js';
import { SkillPatternMatcher, SkillDefinition, SkillMatch } from './skillPatternMatcher.js';
import { SkillApprovalManager } from './skillApprovalManager.js';
import { NetworkGate } from './networkGate.js';
import { OntologyService } from './ontologyService.js';

/**
 * SkillExecutor - Orchestrates skill execution with approval and privacy
 * 
 * As per TODO2.md Phase 4:
 * 1. Pattern matching via ontology
 * 2. One-time approval (or auto if previously approved)
 * 3. Background execution
 * 4. Privacy firewall for external API calls
 * 5. Result transformation via skill importMapping
 */

export interface SkillExecutionContext {
    note: Note;
    skill: SkillDefinition;
    match: SkillMatch;
    exportParams: Record<string, any>;
}

export interface SkillExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    resultNotes?: Note[];
}

export class SkillExecutor {
    private matcher: SkillPatternMatcher;
    private approvalManager: SkillApprovalManager;
    private networkGate: NetworkGate;
    private ontologyService: OntologyService;

    // Callback for result notes
    private onResultNotes?: (notes: Note[], sourceNote: Note, skill: SkillDefinition) => void;

    constructor(
        matcher: SkillPatternMatcher,
        approvalManager: SkillApprovalManager,
        ontologyService?: OntologyService
    ) {
        this.matcher = matcher;
        this.approvalManager = approvalManager;
        this.networkGate = new NetworkGate();
        this.ontologyService = ontologyService || matcher.getOntologyService();
    }

    /**
     * Process note and execute matching skills
     * Main entry point for skill execution
     */
    async processNote(note: Note, options: {
        autoExecute?: boolean;
        confidenceThreshold?: number;
    } = {}): Promise<SkillExecutionResult[]> {
        const { autoExecute = true, confidenceThreshold = 50 } = options;

        // Find matching skills
        const matches = this.matcher.matchSkills(note);

        // Filter by confidence
        const qualified = matches.filter(m => m.confidence >= confidenceThreshold);

        if (qualified.length === 0) {
            return []; // No matching skills
        }

        // Execute each matching skill
        const results: SkillExecutionResult[] = [];

        for (const match of qualified) {
            const result = await this.executeSkill(note, match, autoExecute);
            results.push(result);
        }

        return results;
    }

    /**
     * Execute a specific skill
     */
    private async executeSkill(
        note: Note,
        match: SkillMatch,
        autoExecute: boolean
    ): Promise<SkillExecutionResult> {
        const { skill } = match;

        try {
            // 1. Check approval
            if (autoExecute) {
                const approved = await this.approvalManager.requestApproval(skill, match);
                if (!approved) {
                    return {
                        success: false,
                        error: 'Skill execution not approved by user'
                    };
                }
            }

            // 2. Privacy check (note may contain sensitive data)
            const canTransmit = await this.networkGate.canTransmit(
                note,
                `${skill.name} (external API)`,
                undefined // Will throw PrivacyError if private and no callback
            ).catch(() => false);

            if (!canTransmit && !note.public) {
                console.log(`[SkillExecutor] Skipping ${skill.id} - note is private`);
                return {
                    success: false,
                    error: 'Cannot execute skill on private note'
                };
            }

            // 3. Map note properties to external API parameters
            const exportParams = this.matcher.mapToExternal(note, skill);

            // 4. Execute skill
            if (!skill.execute) {
                return {
                    success: false,
                    error: 'Skill has no execute function'
                };
            }

            console.log(`[SkillExecutor] Executing ${skill.name} with params:`, exportParams);

            const data = await skill.execute(note.properties);

            // 5. Transform results to notes
            const resultNotes = this.transformResults(data, note, skill);

            // 6. Notify callback
            if (resultNotes.length > 0 && this.onResultNotes) {
                this.onResultNotes(resultNotes, note, skill);
            }

            return {
                success: true,
                data,
                resultNotes
            };

        } catch (error: any) {
            console.error(`[SkillExecutor] Error executing ${skill.name}:`, error);
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    }

    /**
     * Transform external API results to ontology-based notes
     */
    private transformResults(
        data: any,
        sourceNote: Note,
        skill: SkillDefinition
    ): Note[] {
        if (!data || !Array.isArray(data)) {
            return [];
        }

        const notes: Note[] = [];

        for (const item of data) {
            // Map external data → ontology properties
            const properties = this.matcher.mapFromExternal(item, skill);

            // Create result note
            const note: Note = {
                id: this.generateId(),
                title: this.generateTitle(properties, skill),
                content: JSON.stringify(item, null, 2), // Raw data in content
                tags: ['#skill-result', `#${skill.id}`],
                properties,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),

                // Provenance tracking
                source: {
                    type: 'skill',
                    identifier: `${skill.id}-v1`,
                    url: item.url || undefined,
                    timestamp: Date.now()
                },

                // Privacy: Results default to same as source note
                public: sourceNote.public,

                // Priority: Normal
                priority: 0.5
            };

            notes.push(note);
        }

        return notes;
    }

    /**
     * Generate title from properties
     */
    private generateTitle(properties: Property[], skill: SkillDefinition): string {
        // Try to find a name/title property
        const titleProps = properties.filter(p =>
            p.key === 'name' || p.key === 'title' || p.key === 'role'
        );

        if (titleProps.length > 0 && titleProps[0].values.length > 0) {
            return titleProps[0].values[0];
        }

        return `Result from ${skill.name}`;
    }

    /**
     * Simple ID generator
     */
    private generateId(): string {
        return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Set callback for result notes
     */
    setResultCallback(
        callback: (notes: Note[], sourceNote: Note, skill: SkillDefinition) => void
    ): void {
        this.onResultNotes = callback;
    }

    /**
     * Get pattern matcher
     */
    getMatcher(): SkillPatternMatcher {
        return this.matcher;
    }

    /**
     * Get approval manager
     */
    getApprovalManager(): SkillApprovalManager {
        return this.approvalManager;
    }
}
