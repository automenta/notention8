import type { Event as NostrToolsEvent } from 'nostr-tools';

export type NostrEvent = NostrToolsEvent;

export type SortOrder =
  | 'updatedAt_desc'
  | 'updatedAt_asc'
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'title_asc'
  | 'title_desc'
  | 'soonest'
  | 'nearest'
  | 'relevance'
  | 'tags';

export type SidebarViewMode = 'list' | 'grid' | 'cloud';

export interface Property {
  key: string;
  operator: string;
  values: string[];
}

export interface NoteSource {
  type: 'user' | 'skill' | 'import' | 'inference';
  identifier: string;  // 'user-<id>', 'skill-indeed-v1', 'gpt-4o'
  url?: string;        // Origin URL for imports
  timestamp: number;
}

export interface OntologyAttribute {
  type: 'string' | 'date' | 'number' | 'enum' | 'datetime' | 'geo';
  description?: string;
  icon?: string;
  options?: string[]; // for enum type
  operators: {
    real: string[];
    imaginary: string[];
  };
}

export interface OntologyNode {
  id: string;
  label: string;
  description?: string;
  attributes?: {
    [key: string]: OntologyAttribute;
  };
  children?: OntologyNode[];
  actionLabel?: string;
  requiredAttributes?: string[];
  extends?: string[];
}

export interface Note {
  id: string;
  title: string;
  /** Content stored as an HTML string */
  content: string;
  tags: string[];
  properties: Property[];
  createdAt: string;
  updatedAt: string;
  nostrEventId?: string;
  publishedAt?: string;
  pinned?: boolean;
  deletedAt?: string;

  // PROVENANCE: Track origin of note
  source: NoteSource;

  // PRIVACY FIREWALL: Default private
  public: boolean;

  // SIGNAL STRENGTH: Weighting for matching (0.0-1.0)
  priority: number;
}

export interface Template {
  id: string;
  label: string;
  content: string;
  icon?: string;
}

export interface AppSettings {
  aiEnabled: boolean;
  aiProvider?: 'remote' | 'webllm';
  aiModel?: string; // Specific model ID for the provider (mostly for WebLLM)
  googleGeminiApiKey?: string; // Added user-configurable API key
  developerMode: boolean;
  theme: 'light' | 'dark';
  nostr: {
    privkey: string | null;
    relays?: string[];
  };
  ontology: OntologyNode[];
  customTemplates: Template[];
}

export interface NostrProfile {
  name?: string;
  display_name?: string;
  picture?: string;
  about?: string;
  banner?: string;
  website?: string;
  lud16?: string;
}

export interface Contact {
  pubkey: string;
  name?: string;
  picture?: string;
  about?: string;
  isAgent?: boolean;
}

export type View =
  | 'notes'
  | 'ontology'
  | 'network'
  | 'chat'
  | 'settings'
  | 'map'
  | 'time'
  | 'trash'
  | 'simulator'
  | 'dashboard';
