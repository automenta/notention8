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
