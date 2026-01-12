import { useCallback, useState } from 'react';
import { finalizeEvent } from 'nostr-tools';
import { useSettings } from './useSettingsContext';
import { pool, DEFAULT_RELAYS, hexToBytes, getTextFromHtml } from '../utils/nostr';
import type { Note } from '../types';

export const usePublish = () => {
  const { settings } = useSettings();
  const [isPublishing, setIsPublishing] = useState(false);

  const publishNote = useCallback(async (note: Note) => {
    if (!settings.nostr.privkey) {
      throw new Error('No private key found in settings. Please configure your Nostr identity.');
    }

    setIsPublishing(true);
    try {
      const privkeyBytes = hexToBytes(settings.nostr.privkey);
      const content = getTextFromHtml(note.content);

      // Construct tags
      const tags = note.tags.map(tag => ['t', tag]);

      // Add property tags: ['property', key, operator, value]
      // Note: we might have multiple values for a key.
      // Current Nostr spec for NIP-01 doesn't strictly define property tags,
      // but we follow our internal convention: ['property', key, operator, value]
      // If values is array, should we emit multiple tags or one tag with joined values?
      // For query simplicity, separate tags per value might be better if value is strict,
      // but here we have (key, operator, values[]).
      // Let's serialize values as CSV for now to match our parsing logic, or use multiple tags?
      // Ontology.md says: ["property", "price", "is", "100"]
      note.properties.forEach(prop => {
        // We emit one tag per value if operator is 'is' (fact)?
        // Or just one tag with joined values?
        // Let's stick to the example: ["property", "price", "is", "100"]
        // If values has multiple, we probably want multiple tags?
        // E.g. [skill:is:React, Vue] -> ["property", "skill", "is", "React"], ["property", "skill", "is", "Vue"]
        if (prop.values.length > 0) {
            prop.values.forEach(val => {
                tags.push(['property', prop.key, prop.operator, val]);
            });
        }
      });

      const created_at = Math.floor(Date.now() / 1000);

      const eventTemplate = {
        kind: 1,
        created_at,
        tags,
        content: `${note.title}\n\n${content}`,
      };

      const signedEvent = finalizeEvent(eventTemplate, privkeyBytes);

      // Publish to relays
      const pubs = pool.publish(DEFAULT_RELAYS, signedEvent);

      // Wait for at least one success
      // pool.publish returns an array of promises that resolve when the relay accepts the event
      // or reject if it fails.
      await Promise.any(pubs);

      return signedEvent.id;
    } catch (error) {
      console.error('Failed to publish note:', error);
      throw error;
    } finally {
      setIsPublishing(false);
    }
  }, [settings.nostr.privkey]);

  return { publishNote, isPublishing };
};
