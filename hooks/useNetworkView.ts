import { useEffect, useMemo, useState, useRef } from 'react';
import { getPublicKey } from 'nostr-tools';
import type { NostrEvent, Note, Property } from '../types';
import { DEFAULT_RELAYS, hexToBytes, pool, extractPropertiesFromTags, convertEventToNote } from '../utils/nostr';
import { matchNotes } from '../utils/matching';
import { useNostrProfile } from './useNostrProfile';
import { useView } from './useViewContext';
import { useSettings } from './useSettingsContext';
import { useGardener } from './useGardener';

interface UseNetworkViewProps {
  matchAgainst?: Note | null;
}

export const useNetworkView = ({ matchAgainst }: UseNetworkViewProps = {}) => {
  const { settings } = useSettings();
  const { setActiveView, setMatchingNoteId } = useView();
  const { learnFromProperties } = useGardener();

  const onNavigateToSettings = () => setActiveView('settings');
  const pubkey = useMemo(
    () =>
      settings.nostr?.privkey
        ? getPublicKey(hexToBytes(settings.nostr.privkey))
        : null,
    [settings.nostr?.privkey]
  );
  const [events, setEvents] = useState<NostrEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // Batching refs
  const pendingEventsRef = useRef<NostrEvent[]>([]);
  const seenEventIdsRef = useRef(new Set<string>());
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!pubkey) return;

    setEvents([]); // Clear previous events
    setIsLoading(true);
    seenEventIdsRef.current = new Set();
    pendingEventsRef.current = [];
    if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);

    const flushBatch = () => {
      if (pendingEventsRef.current.length > 0) {
        const newEvents = pendingEventsRef.current;
        setEvents((prev) => [...prev, ...newEvents]);

        // Passive Learning: Extract properties from new events
        const allProps: Property[] = newEvents.flatMap(evt => extractPropertiesFromTags(evt.tags));

        if (allProps.length > 0) {
            learnFromProperties(allProps);
        }

        pendingEventsRef.current = [];
      }
      batchTimeoutRef.current = null;
    };

    const sub = pool.subscribeMany(
      DEFAULT_RELAYS,
      [{ kinds: [1], limit: 50 }],
      {
        onevent: (event) => {
          if (!seenEventIdsRef.current.has(event.id)) {
            seenEventIdsRef.current.add(event.id);
            pendingEventsRef.current.push(event);

            if (!batchTimeoutRef.current) {
              batchTimeoutRef.current = setTimeout(flushBatch, 500);
            }
          }
        },
      }
    );

    const timer = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      clearTimeout(timer);
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      sub.close();
    };
  }, [pubkey, learnFromProperties]);

  const sortedEvents = useMemo(() => {
    let filtered = [...events];

    if (filter) {
        filtered = filtered.filter(e => e.content.toLowerCase().includes(filter.toLowerCase()));
    }

    if (matchAgainst) {
        return filtered.map(event => {
            const offerNote: Note = convertEventToNote(event);
            const score = matchNotes(matchAgainst, offerNote) * 100;
            return { event, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(item => {
             return { ...item.event, score: item.score };
        })
        .slice(0, 100);
    }

    return filtered
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 100);
  }, [events, filter, matchAgainst]);

  const authorPubkeys = useMemo(() => {
    const pubkeys = new Set(sortedEvents.map((e) => e.pubkey));
    if (pubkey) {
      pubkeys.add(pubkey);
    }
    return Array.from(pubkeys);
  }, [sortedEvents, pubkey]);

  const profiles = useNostrProfile(authorPubkeys);

  return {
    settings,
    pubkey,
    onNavigateToSettings,
    setMatchingNoteId,
    filter,
    setFilter,
    isLoading,
    sortedEvents,
    profiles,
  };
};
