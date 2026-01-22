import React from 'react';

import { useNetworkView } from '../../hooks/useNetworkView';
import type { Note } from '../../types';
import { ProfileHeader } from '../network/ProfileHeader';
import { ConnectIdentityPrompt } from '../network/ConnectIdentityPrompt';
import { NetworkFeedHeader } from '../network/NetworkFeedHeader';
import { SuggestedMatches } from '../network/SuggestedMatches';
import { NetworkFeedList } from '../network/NetworkFeedList';

interface NetworkViewProps {
  matchAgainst?: Note | null;
}

import { useState, useMemo } from 'react';

export function NetworkView({ matchAgainst }: NetworkViewProps) {
  const {
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
  } = useNetworkView({ matchAgainst });

  const [intentFilter, setIntentFilter] = useState<'all' | 'request' | 'offer'>('all');

  const filteredEvents = useMemo(() => {
      if (intentFilter === 'all') return sortedEvents;
      return sortedEvents.filter(event => {
          const tags = event.tags;
          // Look for semantic tag [intent:is:request] or [intent:is:offer]
          // The format in tags is usually ["i", "intent:is:request", "namespace"] or specific nip tags?
          // Our system uses simple text search or property extraction.
          // Let's check raw content or tags if available.
          // Note: our system often puts these in content as text `[intent:is:...]`.
          // But `extractPropertiesFromTags` uses regex on tags?
          // Actually, our parser extracts from content.
          // But `sortedEvents` are raw Nostr events.
          // If we published correctly, we might have added "t" tags or custom tags?
          // Assuming content check for now as it is most reliable with our current architecture.
          const content = event.content.toLowerCase();
          return content.includes(`[intent:is:${intentFilter}]`);
      });
  }, [sortedEvents, intentFilter]);

  if (!pubkey) {
    return <ConnectIdentityPrompt onNavigateToSettings={onNavigateToSettings} />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/50 rounded-lg overflow-hidden">
      <ProfileHeader
        settings={settings}
        pubkey={pubkey}
        profileCache={profiles}
      />
      <div className="p-4 md:p-6 flex-grow overflow-y-auto">
        <NetworkFeedHeader
            matchAgainstTitle={matchAgainst?.title}
            onClearMatch={() => setMatchingNoteId(null)}
            filter={filter}
            setFilter={setFilter}
            sortedEvents={sortedEvents}
            intentFilter={intentFilter}
            setIntentFilter={setIntentFilter}
        />

        {!matchAgainst && !filter && intentFilter === 'all' && <SuggestedMatches />}

        <NetworkFeedList
            isLoading={isLoading}
            sortedEvents={filteredEvents}
            profiles={profiles}
            onApplyMatch={matchAgainst ? applyMatchToNote : undefined}
            onFork={forkNote}
        />
      </div>
    </div>
  );
}
