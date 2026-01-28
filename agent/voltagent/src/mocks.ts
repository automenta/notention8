// Mock implementations of VoltAgent components for development
// These will be replaced with real implementations later

import { VoltAgent, VAAgent, Memory } from './core/VoltAgentCore';

// Simple logger mock
export function createPinoLogger(options: any) {
  return {
    info: (msg: string) => console.log(`[INFO] ${options.name}: ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${options.name}: ${msg}`),
    warn: (msg: string) => console.warn(`[WARN] ${options.name}: ${msg}`)
  };
}

// Simple server mock
export function honoServer(options: { port: number }) {
  return {
    port: options.port,
    start: async () => console.log(`Server starting on port ${options.port}`),
    stop: async () => console.log(`Server stopped`)
  };
}

// Simple memory adapter mock
export class LibSQLMemoryAdapter {
  private url: string;

  constructor(options: { url: string }) {
    this.url = options.url;
  }

  async connect() {
    console.log(`Connected to memory adapter at ${this.url}`);
  }
}

export { VoltAgent, VAAgent, Memory };
