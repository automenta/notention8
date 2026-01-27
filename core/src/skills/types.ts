import type { Note } from '../types';

export interface PropertyPattern {
  keys: string[];
  operators?: string[];
  required?: boolean;
}

export interface ExternalAction {
  type: 'browser' | 'api' | 'file' | 'chat';
  config: BrowserAction | APIAction | FileAction | ChatAction;
}

export interface BrowserAction {
  url: string;
  steps: BrowserStep[];
  extractors: DataExtractor[];
}

// Placeholders for other action types
export interface APIAction {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
}

export interface FileAction {
    path: string;
    content?: string;
    operation: 'read' | 'write' | 'append';
}

export interface ChatAction {
    platform: 'whatsapp' | 'telegram' | 'slack';
    recipient: string;
    message: string;
}

export interface BrowserStep {
  type: 'navigate' | 'click' | 'type' | 'wait' | 'scroll';
  selector?: string;
  value?: string;
  timeout?: number;
}

export interface DataExtractor {
  propertyKey: string;  // What property to create
  selector: string;     // CSS selector
  attribute?: string;   // Extract attribute vs text
  transform?: (raw: string) => any;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;

  // What semantic patterns trigger this skill?
  semanticPattern: PropertyPattern[];

  // Translate Note → External action
  export(note: Note): Promise<ExternalAction | null>;

  // Translate External data → Notes
  import(data: any): Promise<Note[]>;

  // Metadata
  domains?: string[];      // Hint: ['jobs', 'freelance']
  sources?: string[];      // ['indeed.com', 'linkedin.com']
  capabilities?: string[]; // ['search', 'post', 'scrape']
}
