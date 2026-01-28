import { Note, AppSettings } from '@notention/core';
import { parseConfigFromNote, mergeConfigs } from '@notention/core/src/config/NoteBasedConfig';
import { log } from '../core/utils';

export class ConfigProcessor {
    private currentConfig: Partial<AppSettings> = {};

    /**
     * Process a note to see if it is a configuration note.
     * If so, parse it and update the system configuration.
     */
    processNote(note: Note): void {
        if (note.tags.includes('@config:active')) {
            log('Config', `Detected active configuration note: ${note.title}`);
            const newConfig = parseConfigFromNote(note);

            // In a real system, we would broadcast this config change or apply it to the Agent instance.
            // For now, we log the detected changes.
            this.applyConfig(newConfig);
        }
    }

    private applyConfig(config: Partial<AppSettings>): void {
        // Calculate diff for logging
        const changes: string[] = [];
        if (config.privacyMode && config.privacyMode !== this.currentConfig.privacyMode) {
            changes.push(`Privacy Mode: ${config.privacyMode}`);
        }
        if (config.capabilities) {
            if (config.capabilities.browser !== this.currentConfig.capabilities?.browser) {
                changes.push(`Browser Capability: ${config.capabilities.browser}`);
            }
            if (config.capabilities.files !== this.currentConfig.capabilities?.files) {
                changes.push(`Files Capability: ${config.capabilities.files}`);
            }
        }

        if (changes.length > 0) {
            log('Config', `Applying configuration changes: ${changes.join(', ')}`);
        } else {
            log('Config', 'Configuration loaded (no changes or initial load)');
        }

        this.currentConfig = mergeConfigs(this.currentConfig as AppSettings, config);
    }

    getConfig(): Partial<AppSettings> {
        return this.currentConfig;
    }
}
