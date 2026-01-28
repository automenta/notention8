import { Agent, WorkflowResult } from '@notention/core/src/types';
import { Note } from '@notention/core/src/types';
import { SkillRegistry } from './SkillRegistry';

export class SkillExecutor {
    constructor(
        private agent: Agent,
        private registry: SkillRegistry
    ) { }

    async executeForNote(note: Note): Promise<Note[]> {
        // Find matching skills via agent
        const matches = await this.registry.findMatchingWithAgent(note);

        if (matches.length === 0) {
            console.log(`No matching skills for note: ${note.title}`);
            return [];
        }

        console.log(`Found ${matches.length} matching skills`);

        // Execute via VoltAgent's skill-execution workflow
        const allResults: Note[] = [];

        for (const { skill, confidence } of matches) {
            if (confidence < 0.5) continue; // Skip low-confidence matches

            try {
                // Note: The workflow 'skill-execution' was defined to take noteData.
                const result = await this.agent.executeWorkflow('skill-execution', {
                    skillId: skill.id,
                    noteData: {
                        properties: note.properties,
                        content: note.content
                    }
                });

                allResults.push(...(result.importedNotes || []));
            } catch (error) {
                console.error(`Error executing skill ${skill.name}:`, error);
            }
        }

        return allResults;
    }
}
