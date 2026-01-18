import React from 'react';

import { useNetworkView } from '../../hooks/useNetworkView';
import { useView } from '../../hooks/useViewContext';
import type { Note } from '../../types';
import { NostrEventCard } from '../network/NostrEventCard';
import { ProfileHeader } from '../network/ProfileHeader';
import {
  ArrowLeftIcon,
  KeyIcon,
  LoadingSpinner,
  SettingsIcon,
  SparklesIcon,
} from '../icons';

interface NetworkViewProps {
  matchAgainst?: Note | null;
}

export function NetworkView({ matchAgainst }: NetworkViewProps) {
  const { matches } = useView();
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

          <div className="flex flex-col items-end gap-2">
            <input
                type="text"
                placeholder="Search notes..."
                className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm text-gray-200 w-48 flex-shrink-0 focus:border-blue-500 outline-none transition-colors"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
            {sortedEvents.length > 0 && (
                <div className="flex gap-1">
                    {[...new Set(sortedEvents.flatMap(e => e.tags.filter((t: string[]) => t[0] === 't').map((t: string[]) => t[1])))]
                        .slice(0, 3)
                        .map(tag => (
                            <button
                                key={tag}
                                onClick={() => setFilter(filter === tag ? '' : tag)}
                                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${filter === tag ? 'bg-blue-900/50 border-blue-500 text-blue-200' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                            >
                                #{tag}
                            </button>
                        ))
                    }
                </div>
            )}
          </div>
        </div>

        {/* Suggested Matches Section */}
        {!matchAgainst && matches.length > 0 && !filter && (
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-blue-400" />
                    Suggested Opportunities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.slice(0, 4).map(match => (
                        <div
                            key={`${match.localNoteId}-${match.event.id}`}
                            className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/50 hover:bg-gray-700 transition cursor-pointer"
                            onClick={() => {
                                // For now, set matching note id so we drill down into that specific note's matches?
                                // Actually, if we set matchingNoteId, we see matches for that note.
                                // Since this match IS for that note, it works.
                                setMatchingNoteId(match.localNoteId);
                            }}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-mono text-blue-400">Match Score: {Math.round(match.score * 100)}%</span>
                                <span className="text-xs text-gray-500">Your note: {match.localNoteId.slice(0,6)}...</span>
                            </div>
                            <div className="text-white font-medium text-sm mb-1 line-clamp-1">
                                {match.event.content.slice(0, 50)}...
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-px bg-gray-700 my-6"></div>
            </div>
        )}

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
                onApplyMatch={matchAgainst ? applyMatchToNote : undefined}
                onFork={() => forkNote(event)}
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
