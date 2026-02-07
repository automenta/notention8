import { ProposedThought } from '../types/index.js';

interface LifeTemplate {
  ontology: string;
  prompt: string;
}

const LIFE_TEMPLATES: Record<string, LifeTemplate[]> = {
  health: [
    { ontology: 'wellbeing.sleep', prompt: "What time did you actually fall asleep last night?" },
    { ontology: 'wellbeing.nutrition', prompt: "What's one food you'd eat less of this week?" }
  ],
  work: [
    { ontology: 'career.blocker', prompt: "What's the one task you've been avoiding?" },
    { ontology: 'career.growth', prompt: "What skill would make your job 20% easier?" }
  ],
  finances: [
    { ontology: 'finance.savings', prompt: "What's one subscription you could cancel?" },
    { ontology: 'finance.income', prompt: "What's one way you could increase your income this month?" }
  ],
  relationships: [
    { ontology: 'relationship.connection', prompt: "Who have you been meaning to reach out to?" },
    { ontology: 'relationship.conflict', prompt: "Is there a conversation you've been putting off?" }
  ],
  existential: [
    { ontology: 'life.purpose', prompt: "What's keeping you awake at 3am?" },
    { ontology: 'life.joy', prompt: "When was the last time you felt truly alive?" }
  ]
};

export class LifeDecomposer {
  decompose(rawIntent: string): ProposedThought[] {
    const intent = rawIntent.toLowerCase();
    const proposed: ProposedThought[] = [];

    // Simple keyword matching for domain selection
    // In future this would be a local classifier
    const domainsToInclude = new Set<string>();

    if (intent.includes('health') || intent.includes('diet') || intent.includes('sleep') || intent.includes('tired')) {
        domainsToInclude.add('health');
    }
    if (intent.includes('work') || intent.includes('job') || intent.includes('career') || intent.includes('busy')) {
        domainsToInclude.add('work');
    }
    if (intent.includes('money') || intent.includes('finance') || intent.includes('cost') || intent.includes('save')) {
        domainsToInclude.add('finances');
    }
    if (intent.includes('relationship') || intent.includes('friend') || intent.includes('family') || intent.includes('love')) {
        domainsToInclude.add('relationships');
    }

    // Default: "Fix my life" or generic queries -> return top picks from major domains
    if (domainsToInclude.size === 0 || intent.includes('fix my life') || intent.includes('help')) {
        domainsToInclude.add('health');
        domainsToInclude.add('work');
        domainsToInclude.add('finances');
        domainsToInclude.add('relationships');
    }

    domainsToInclude.forEach(domain => {
        const templates = LIFE_TEMPLATES[domain];
        if (templates) {
            templates.forEach(template => {
                 proposed.push({
                    ontology: template.ontology,
                    status: 'proposed',
                    content: template.prompt,
                    sovereignty: 'local',
                    source: 'decomposer:v1'
                });
            });
        }
    });

    // Limit to prevent overwhelm (max 4 initially as per plan)
    // We try to pick one from each selected domain first to ensure diversity
    if (proposed.length > 4) {
        const diverse: ProposedThought[] = [];
        const domainsArray = Array.from(domainsToInclude);

        // Round robin selection
        let i = 0;
        while (diverse.length < 4 && i < 10) { // Safety break
             const domain = domainsArray[i % domainsArray.length];
             const templates = LIFE_TEMPLATES[domain];
             // Simple logic: pick index based on round
             const templateIndex = Math.floor(i / domainsArray.length);
             if (templates && templateIndex < templates.length) {
                 diverse.push({
                    ontology: templates[templateIndex].ontology,
                    status: 'proposed',
                    content: templates[templateIndex].prompt,
                    sovereignty: 'local',
                    source: 'decomposer:v1'
                 });
             }
             i++;
             if (diverse.length >= 4) break;
        }
        return diverse;
    }

    return proposed;
  }
}
