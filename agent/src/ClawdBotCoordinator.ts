import { Gateway } from './Gateway';
import { SkillRegistry } from './skills/SkillRegistry';
import { IndeedSkill } from './skills/IndeedSkill';
import type { Note, ExternalAction, BrowserAction, Skill } from '@notention/core';

export class ClawdBotCoordinator {
  private gateway: Gateway;
  private skillRegistry: SkillRegistry;

  constructor(gateway: Gateway) {
    this.gateway = gateway;
    this.skillRegistry = new SkillRegistry();

    // Register built-in skills
    this.skillRegistry.register(new IndeedSkill());
  }

  async processNote(note: Note): Promise<Note[]> {
    const matchingSkills = this.skillRegistry.findMatching(note);

    if (matchingSkills.length === 0) {
      // console.log(`No matching skills for note: ${note.title}`);
      return [];
    }

    console.log(`Found ${matchingSkills.length} matching skills for: ${note.title}`);

    const allResults: Note[] = [];

    for (const skill of matchingSkills) {
      try {
        const action = await skill.export(note);
        if (!action) continue;

        const results = await this.executeAction(action, skill);
        allResults.push(...results);
      } catch (error) {
        console.error(`Error executing skill ${skill.name}:`, error);
      }
    }

    return allResults;
  }

  private async executeAction(action: ExternalAction, skill: Skill): Promise<Note[]> {
    if (action.type === 'browser') {
      return await this.executeBrowserAction(action.config as BrowserAction, skill);
    }

    // TODO: Implement other action types
    return [];
  }

  private async executeBrowserAction(
    config: BrowserAction,
    skill: Skill
  ): Promise<Note[]> {
    // ClawdBot handles browser automation
    // For now, return mock data
    console.log(`[ClawdBot] Opening ${config.url}`);

    // In real implementation:
    // 1. ClawdBot opens browser
    // 2. Executes steps
    // 3. Extracts data using selectors
    // 4. Returns scraped data

    // MOCK DATA for verification
    const mockScrapedData = [
      {
        role: 'React Developer',
        company: 'Startup XYZ',
        salary: '$80-100K',
        url: 'https://indeed.com/job/12345'
      },
      {
        role: 'Frontend Engineer',
        company: 'Tech Corp',
        salary: '$120k+',
        url: 'https://indeed.com/job/67890'
      }
    ];

    return await skill.import(mockScrapedData);
  }
}
