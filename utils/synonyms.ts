
const SYNONYMS: Record<string, string> = {
    // Tech
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'golang': 'go',
    'reactjs': 'react',
    'vuejs': 'vue',
    'node': 'nodejs',
    'aws': 'amazon web services',
    'gcp': 'google cloud platform',
    'k8s': 'kubernetes',

    // Roles
    'dev': 'developer',
    'eng': 'engineer',
    'swe': 'software engineer',
    'pm': 'product manager',
    'qa': 'quality assurance',
    'designer': 'product designer', // maybe?
    'ux': 'user experience',
    'ui': 'user interface',

    // Business
    'biz': 'business',
    'mgmt': 'management',
    'hr': 'human resources',
    'marketing': 'growth', // loose synonym?

    // Common
    'remote': 'work from home',
    'wfh': 'remote', // circular? Normalized target should be consistent.
    'asap': 'immediate',
    'urgent': 'high priority'
};

// Reverse map for lookup? Or just normalize to one canonical form.
// Let's pick canonical forms.
const CANONICAL: Record<string, string> = {
    'js': 'javascript',
    'javascript': 'javascript',
    'ts': 'typescript',
    'typescript': 'typescript',
    'py': 'python',
    'python': 'python',
    'react': 'react',
    'reactjs': 'react',
    'node': 'nodejs',
    'nodejs': 'nodejs',
    'dev': 'developer',
    'developer': 'developer',
    'engineer': 'developer', // Soft synonym? Maybe 'engineer' is distinct. Let's map 'eng' to 'engineer'.
    'eng': 'engineer',
    'swe': 'software engineer',
    'software engineer': 'software engineer',
    'remote': 'remote',
    'wfh': 'remote',
    'distributed': 'remote'
};

export const normalizeTerm = (term: string): string => {
    if (!term) return '';
    const lower = term.toLowerCase().trim();
    // Remove common punctuation?
    const clean = lower.replace(/[^a-z0-9\s]/g, '');

    return CANONICAL[clean] || clean;
};
