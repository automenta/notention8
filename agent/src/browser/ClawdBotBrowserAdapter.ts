import type { BrowserAction } from '@notention/core';
import { ClawdBotClient } from '../communication/ClawdBotClient';

/**
 * ClawdBotBrowserAdapter bridges our BrowserExecutor interface to ClawdBot's API.
 * This adapter delegates all browser automation to ClawdBot, avoiding duplication.
 */
export class ClawdBotBrowserAdapter {
    private client: ClawdBotClient;

    constructor(client: ClawdBotClient) {
        this.client = client;
    }

    /**
     * Execute browser actions through ClawdBot API.
     * Translates our BrowserAction format to ClawdBot's executeAction format.
     */
    async execute(actions: BrowserAction[]): Promise<unknown[]> {
        const results: unknown[] = [];

        for (const action of actions) {
            try {
                const result = await this.client.executeAction(this.translateAction(action));
                results.push(result);
            } catch (error) {
                console.error(`ClawdBot action failed:`, action, error);
                throw error;
            }
        }

        return results;
    }

    /**
     * Translate our BrowserAction format to ClawdBot format.
     * Adapts to ClawdBot's existing action structure.
     */
    private translateAction(action: BrowserAction): any {
        switch (action.type) {
            case 'navigate':
                return {
                    type: 'navigate',
                    url: action.url,
                    waitUntil: 'networkidle',
                    description: action.description
                };

            case 'click':
                return {
                    type: 'click',
                    selector: action.selector,
                    description: action.description
                };

            case 'type':
                return {
                    type: 'type',
                    selector: action.selector,
                    text: action.text,
                    description: action.description
                };

            case 'wait':
                return {
                    type: 'wait',
                    duration: action.duration,
                    description: action.description
                };

            case 'scrape':
                return {
                    type: 'scrape',
                    selector: action.selector,
                    scrapeRules: action.scrapeRules,
                    description: action.description
                };

            case 'screenshot':
                return {
                    type: 'screenshot',
                    path: action.path,
                    fullPage: action.fullPage ?? false,
                    description: action.description
                };

            default:
                throw new Error(`Unsupported action type: ${(action as any).type}`);
        }
    }

    /**
     * Check if ClawdBot is available
     */
    async isAvailable(): Promise<boolean> {
        return await this.client.ping();
    }

    /**
     * Get ClawdBot status
     */
    async getStatus(): Promise<any> {
        return await this.client.getStatus();
    }
}

/**
 * Factory function to create ClawdBotBrowserAdapter
 */
export function createClawdBotExecutor(options: {
    host?: string;
    port?: number;
    timeout?: number;
}): ClawdBotBrowserAdapter {
    const client = new ClawdBotClient({
        host: options.host || '127.0.0.1',
        port: options.port || 3000,
        timeout: options.timeout || 30000
    });

    return new ClawdBotBrowserAdapter(client);
}
