import React from 'react';

import { useNetworkView } from '../../hooks/useNetworkView';
import type { Note } from '../../types';
import { ArrowLeftIcon, KeyIcon, LoadingSpinner, SettingsIcon } from '../icons';
import { NostrEventCard } from '../network/NostrEventCard';
import { ProfileHeader } from '../network/ProfileHeader';

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
  } = useNetworkView({ matchAgainst });

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
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {matchAgainst && (
              <button
                onClick={() => setMatchingNoteId(null)}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                title="Back to Feed"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-xl font-bold text-white truncate">
              {matchAgainst
                ? `Matches for "${matchAgainst.title}"`
                : '⚡️ Public Feed'}
            </h1>
          </div>

          <input
            type="text"
            placeholder="Search notes..."
            className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm text-gray-200 w-48 flex-shrink-0"
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
}
