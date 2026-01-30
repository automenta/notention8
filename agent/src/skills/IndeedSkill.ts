import { Skill, SkillAction } from './types';
import { Note } from '@notention/core';

export class IndeedSkill implements Skill {
  id = 'skill-indeed-v1';
  name = 'Indeed Job Board';
  description = 'Search and import job listings from Indeed.com';

  // VoltAgent methods
  async export(note: Note): Promise<SkillAction | null> {
    // Check if note has job-related properties
    const hasJobIntent = note.properties.some(p =>
      ['role', 'skill', 'job', 'hiring'].includes(p.key)
    );

    if (!hasJobIntent) return null;

    // Extract query
    const roleProp = note.properties.find(p => ['role', 'job', 'skill'].includes(p.key));
    const locationProp = note.properties.find(p => p.key === 'location');

    const query = roleProp?.values[0] || 'software engineer';
    const location = locationProp?.values[0] || 'remote';

    return {
      type: 'browser',
      action: 'navigate',
      url: `https://indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`,
      payload: {
          query,
          location
      }
    };
  }

  async import(results: any): Promise<Note[]> {
    // Mock import logic
    // results would be the scraped data
    const jobs = Array.isArray(results) ? results : [];

    return jobs.map((job: any) => ({
      id: crypto.randomUUID(),
      title: `Job: ${job.role || 'Unknown Role'} at ${job.company || 'Unknown Company'}`,
      content: `<p>${job.description || 'No description'}</p>`,
      tags: ['job-listing', 'imported'],
      properties: [
        { key: 'role', operator: 'is', values: [job.role || ''] },
        { key: 'company', operator: 'is', values: [job.company || ''] },
        { key: 'salary', operator: 'is', values: [job.salary || ''] }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: {
        type: 'skill',
        identifier: this.id,
        timestamp: Date.now()
      },
      public: false,
      priority: 0.2
    }));
  }
}
