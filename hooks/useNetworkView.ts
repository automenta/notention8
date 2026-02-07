import { useEffect, useMemo, useState, useRef } from 'react';
import { getPublicKey } from 'nostr-tools';
import type { NostrEvent, Note, Property } from '../types';
import { DEFAULT_RELAYS, hexToBytes, pool, extractPropertiesFromTags, convertEventToNote } from '../utils/nostr';
import { matchNotes } from '../utils/matching';
import { useNostrProfile } from './useNostrProfile';
import { useView } from './useViewContext';
import { useToast } from '../components/contexts/ToastContext';
import { useSettings } from './useSettingsContext';
import { useGardener } from './useGardener';
import { useNotes } from './useNotes';

interface UseNetworkViewProps {
  matchAgainst?: Note | null;
}

export const useNetworkView = ({ matchAgainst }: UseNetworkViewProps = {}) => {
  const { settings } = useSettings();
  const { setActiveView, setMatchingNoteId, setSelectedNoteId } = useView();
  const { addToast } = useToast();
  const { learnFromProperties } = useGardener();
  const { addNote, updateNote } = useNotes();

  const relays = useMemo(() => settings.nostr.relays || DEFAULT_RELAYS, [settings.nostr.relays]);

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
      relays,
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
  }, [pubkey, learnFromProperties, relays]);

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

  const applyMatchToNote = (event: NostrEvent) => {
      if (!matchAgainst) return;

      const props = extractPropertiesFromTags(event.tags);
      if (props.length === 0) {
          addToast("No semantic properties found in this note.", 'warning');
          return;
      }

      const tagsToAdd = props.map(p => {
          // Flatten simple values
          return p.values.map(v => `[${p.key}:${p.operator}:${v}]`).join('');
      }).join('\n');

      const newContent = matchAgainst.content + '\n\n' + tagsToAdd;

      updateNote({
          ...matchAgainst,
          content: newContent,
      });

      addToast(`Applied ${props.length} properties from match!`, 'success');
  };

  const forkNote = (event: NostrEvent) => {
      const newNote = addNote();
      const eventNote = convertEventToNote(event);

      const updatedNote = {
          ...newNote,
          title: `Fork of ${eventNote.title || 'Untitled'}`,
          content: eventNote.content,
          properties: eventNote.properties,
          tags: eventNote.tags
      };

      updateNote(updatedNote);
      setSelectedNoteId(newNote.id);
      setActiveView('notes');
      addToast('Note forked successfully!', 'success');
  };

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
    applyMatchToNote,
    forkNote,
  };
};
