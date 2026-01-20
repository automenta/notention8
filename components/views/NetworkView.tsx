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
        />

        {!matchAgainst && !filter && <SuggestedMatches />}

        <NetworkFeedList
            isLoading={isLoading}
            sortedEvents={sortedEvents}
            profiles={profiles}
            onApplyMatch={matchAgainst ? applyMatchToNote : undefined}
            onFork={forkNote}
        />
      </div>
    </div>
  );
}
