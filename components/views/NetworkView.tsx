import React, { useEffect, useMemo, useState, useRef } from 'react';
import { getPublicKey } from 'nostr-tools';
import type { NostrEvent } from '../../types';
import { KeyIcon, LoadingSpinner, SettingsIcon } from '../icons';
import { DEFAULT_RELAYS, hexToBytes, pool } from '../../utils/nostr';
import { matchNotes } from '../../utils/matching';
import type { Note } from '../../types';
import { parseProperties } from '../../utils/parsing'; // Need to parse events to notes for matching
import { useNostrProfile } from '../../hooks/useNostrProfile';
import { ProfileHeader } from '../network/ProfileHeader';
import { NostrEventCard } from '../network/NostrEventCard';
import { useView } from '../../hooks/useViewContext';
import { useSettings } from '../../hooks/useSettingsContext';

interface NetworkViewProps {
    matchAgainst?: Note | null;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ matchAgainst }) => {
  const { settings } = useSettings();
  const { setActiveView } = useView();
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
  const [filter, setFilter] = useState(''); // Simple text filter for now

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
        setEvents((prev) => [...prev, ...pendingEventsRef.current]);
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
  }, [pubkey]);

  const sortedEvents = useMemo(() => {
    // Clone before sort to avoid mutating state
    let filtered = [...events];

    // Filter by simple text search for now
    if (filter) {
        filtered = filtered.filter(e => e.content.toLowerCase().includes(filter.toLowerCase()));
    }

    // If matching mode, sort by match score
    if (matchAgainst) {
        // We need to convert NostrEvent to Note for matching logic
        // This is a bit expensive to do on render, but fine for prototype.
        // Also note properties are in tags.
        return filtered.map(event => {
            // Extract props from tags
            const props: Record<string, any> = {};
            event.tags
                .filter(t => t[0] === 'property')
                .forEach(t => {
                   // t: ['property', key, op, value]
                   // Note structure expects prop key -> { operator, values } (Wait, Note type check needed)
                   // Checking types/index.ts...
                   // Actually matchNotes expects Note interface which has properties: Record<string, { operator: string; values: any[] }>;
                   props[t[1]] = { operator: t[2], values: [t[3]] };
                });


            // Construct temp note
            const offerNote: Note = {
                id: event.id,
                title: '',
                content: event.content,
                tags: event.tags.filter(t => t[0] === 't').map(t => t[1]),
                published: true, // It's from Nostr
                properties: props,
                createdAt: '',
                updatedAt: ''
            };

            const score = matchNotes(matchAgainst, offerNote);
            return { event, score };
        })
        .sort((a, b) => b.score - a.score) // Sort by score desc
        .map(item => item.event)
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

  if (!pubkey) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center bg-gray-800/50 rounded-lg">
        <KeyIcon className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Connect your Nostr Identity
        </h2>
        <p className="text-gray-400 mb-6 max-w-md">
          A Nostr identity is required to publish notes and interact with the
          network. You can generate one in settings.
        </p>
        <button
          onClick={onNavigateToSettings}
          className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SettingsIcon className="h-5 w-5" /> Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg overflow-hidden">
      <ProfileHeader
        settings={settings}
        pubkey={pubkey}
        profileCache={profiles}
      />
      <div className="p-4 md:p-6 flex-grow overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">
                {matchAgainst ? `🎯 Matches for "${matchAgainst.title}"` : '⚡️ Public Feed'}
            </h1>
            <input
                type="text"
                placeholder="Search notes..."
                className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm text-gray-200"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner className="h-8 w-8 text-gray-400" />
          </div>
        ) : sortedEvents.length > 0 ? (
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <NostrEventCard
                key={event.id}
                event={event}
                profile={profiles[event.pubkey]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p>No public notes found from connected relays.</p>
            <p className="text-sm mt-1">
              This could be a temporary connection issue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
