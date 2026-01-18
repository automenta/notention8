export interface SimulationAgent {
    id: string;
    name: string;
    persona: string;
    bio: string;
    avatar?: string;
    currentDraft: string;
    status: string; // "Thinking", "Typing", "Idle", "Contacting"
    goal: string;
    isAgent: boolean;
}

export const INITIAL_AGENTS: SimulationAgent[] = [
    {
        id: '1111111111111111111111111111111111111111111111111111111111111111',
        name: 'Alice (Client)',
        persona: 'You are Alice, a startup founder looking for a React developer to build a landing page. Budget is around $500.',
        bio: 'Startup founder looking for tech talent.',
        goal: 'Create a Request Note for a React Developer.',
        currentDraft: '',
        status: 'Idle',
        isAgent: true
    },
    {
        id: '2222222222222222222222222222222222222222222222222222222222222222',
        name: 'Bob (Freelancer)',
        persona: 'You are Bob, an experienced React and Node.js developer looking for gigs. Your rate is $50/hr.',
        bio: 'Experienced React/Node.js developer.',
        goal: 'Create an Offer Note listing your services.',
        currentDraft: '',
        status: 'Idle',
        isAgent: true
    }
];
