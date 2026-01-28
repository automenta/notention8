import { z } from 'zod';
import { Tool } from '@notention/core/src/types';
import { Skill } from './types';
import { Note } from '@notention/core/src/types';
import { createTool, log } from '../core/utils';

export class SkillToolAdapter {
    static createToolFromSkill(skill: Skill): Tool {
        return createTool({
            name: `skill-${skill.id}`,
            description: skill.description,
            schema: z.object({
                note: z.object({
                    properties: z.array(z.any()),
                    content: z.string()
                })
            }),
            execute: async ({ note }: any) => {
                const action = await skill.export(note as Note);
                if (!action) {
                    return { success: false, reason: 'Skill did not generate action' };
                }

                // Execute external action
                const results = await this.executeExternalAction(action);
                return await skill.import(results);
            }
        });
    }

    private static async executeExternalAction(action: any): Promise<any> {
        log('SkillToolAdapter', 'Executing external action:', action);
        // Stub implementation
        return { status: 'success', data: 'Stubbed action result' };
    }
}
