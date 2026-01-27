import { useCallback, useState } from 'react';
import { finalizeEvent } from 'nostr-tools';
import { useSettings } from './useSettingsContext';
import { pool, DEFAULT_RELAYS, hexToBytes, publishNoteToNostr } from '@notention/core';
import type { Note } from '@notention/core';

export interface PrivacyCheckRequest {
    note: Note;
    message: string;
    resolve: (value: boolean) => void;
}

export const usePublish = () => {
  const { settings } = useSettings();
  const [isPublishing, setIsPublishing] = useState(false);
  const [privacyCheck, setPrivacyCheck] = useState<PrivacyCheckRequest | null>(null);

  const relays = settings.nostr.relays || DEFAULT_RELAYS;

  const publishNote = useCallback(async (note: Note) => {
    if (!settings.nostr.privkey) {
      throw new Error('No private key found in settings. Please configure your Nostr identity.');
    }

    setIsPublishing(true);
    try {
      const eventId = await publishNoteToNostr(
        note,
        settings.nostr.privkey,
        relays,
        (message: string) => {
            return new Promise<boolean>((resolve) => {
                setPrivacyCheck({
                    note,
                    message,
                    resolve: (val) => {
                        setPrivacyCheck(null);
                        resolve(val);
                    }
                });
            });
        }
      );
      return eventId;
    } catch (error) {
      console.error('Failed to publish note:', error);
      throw error;
    } finally {
      setIsPublishing(false);
    }
  }, [settings.nostr.privkey, relays]);

  const publishProfile = useCallback(async (metadata: { name: string; about: string; picture: string }) => {
    if (!settings.nostr.privkey) {
        throw new Error('No private key found.');
    }

    setIsPublishing(true);
    try {
        const privkeyBytes = hexToBytes(settings.nostr.privkey);
        const created_at = Math.floor(Date.now() / 1000);

        const eventTemplate = {
            kind: 0,
            created_at,
            tags: [],
            content: JSON.stringify(metadata)
        };

        const signedEvent = finalizeEvent(eventTemplate, privkeyBytes);
        const pubs = pool.publish(relays, signedEvent);
        await Promise.any(pubs);

    } catch (error) {
        console.error('Failed to publish profile:', error);
        throw error;
    } finally {
        setIsPublishing(false);
    }
  }, [settings.nostr.privkey, relays]);

  return { publishNote, publishProfile, isPublishing, privacyCheck };
};
