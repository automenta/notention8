import { NoteTranslationStrategy, ClawdBotAction, ClawdBotConfiguration, TranslationContext } from './NoteTranslationStrategy';
import { SkillRegistry } from '../skills/SkillRegistry';
import type { Note, ExternalAction } from '@notention/core';

export class SkillBasedStrategy implements NoteTranslationStrategy {
  private readonly name = 'Skill Based Strategy';
  private readonly priority = 100;
  private skillRegistry: SkillRegistry;

  constructor(skillRegistry: SkillRegistry) {
    this.skillRegistry = skillRegistry;
  }

  canHandle(note: any): boolean {
    const matching = this.skillRegistry.findMatching(note as Note);
    return matching.length > 0;
  }

  async translate(note: any): Promise<ClawdBotAction[] | ClawdBotConfiguration> {
    const matchingSkills = this.skillRegistry.findMatching(note as Note);
    const actions: ClawdBotAction[] = [];

    for (const skill of matchingSkills) {
        try {
            const externalAction = await skill.export(note as Note);
            if (externalAction) {
                actions.push({
                    id: `skill-${skill.id}-${note.id}-${Date.now()}`,
                    type: 'skill_execution',
                    description: `Execute skill ${skill.name}`,
                    parameters: {
                        skillId: skill.id,
                        action: externalAction
                    },
                    priority: 10
                });
            }
        } catch (error) {
            console.error(`Error exporting skill ${skill.name}:`, error);
        }
    }

    return actions;
  }

  getPriority(): number {
    return this.priority;
  }

  getName(): string {
    return this.name;
  }
}
