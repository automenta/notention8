import type { Skill, Note, ExternalAction, BrowserAction } from '@notention/core';

export class IndeedSkill implements Skill {
  id = 'skill-indeed-v1';
  name = 'Indeed Job Board';
  description = 'Search and import job listings from Indeed.com';
  version = '1.0.0';

  semanticPattern = [
    { keys: ['role', 'skill', 'job'], required: true },
    { keys: ['salary', 'rate', 'budget'], required: false },
    { keys: ['location'], required: false }
  ];

  domains = ['jobs', 'employment', 'freelance'];
  sources = ['indeed.com'];
  capabilities = ['search', 'scrape'];

  async export(note: Note): Promise<ExternalAction | null> {
    // Extract semantic properties
    const role = this.extractPropertyValue(note, ['role', 'skill', 'job']);
    if (!role) return null;

    const location = this.extractPropertyValue(note, ['location']) || 'remote';
    const salary = this.extractPropertyValue(note, ['salary', 'rate']);

    return {
      type: 'browser',
      config: {
        url: `https://indeed.com/jobs?q=${encodeURIComponent(role)}&l=${encodeURIComponent(location)}`,
        steps: [
          { type: 'wait', timeout: 2000 },
          { type: 'scroll', value: 'bottom' }
        ],
        extractors: [
          {
            propertyKey: 'role',
            selector: '.jobTitle',
            transform: (text: string) => text.trim()
          },
          {
            propertyKey: 'company',
            selector: '.companyName',
            transform: (text: string) => text.trim()
          },
          {
            propertyKey: 'salary',
            selector: '.salary-snippet',
            transform: this.parseSalary
          },
          {
            propertyKey: 'url',
            selector: '.jobTitle',
            attribute: 'href',
            transform: (href: string) => `https://indeed.com${href}`
          }
        ]
      } as BrowserAction
    };
  }

  async import(scrapedData: any[]): Promise<Note[]> {
    return scrapedData.map(job => ({
      id: this.generateId(),
      title: `Job: ${job.role} at ${job.company}`,
      content: `<p>Found on Indeed</p>`,
      tags: ['job-listing', 'imported'],
      properties: [
        { key: 'role', operator: 'is', values: [job.role] },
        { key: 'company', operator: 'is', values: [job.company] },
        ...(job.salary ? [{ key: 'salary', operator: 'is', values: [job.salary] }] : []),
        { key: 'url', operator: 'is', values: [job.url] }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Provenance
      source: {
        type: 'skill',
        identifier: this.id,
        url: job.url,
        timestamp: Date.now()
      },

      // Privacy & Priority
      public: false,    // Imported data is private by default
      priority: 0.2     // Low priority (bulk import)
    }));
  }

  private extractPropertyValue(note: Note, keys: string[]): string | null {
    for (const prop of note.properties) {
      if (keys.includes(prop.key)) {
        return prop.values[0];
      }
    }
    return null;
  }

  private parseSalary(text: string): string {
    // Extract salary from text like "$80K - $100K a year"
    const match = text.match(/\$[\d,]+/);
    return match?.[0] || text;
  }

  private generateId(): string {
    return `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
