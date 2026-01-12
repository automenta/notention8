import React, { useMemo } from 'react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent, NostrProfile } from '../../types';
import { formatNpub } from '../../utils/nostr';

// Extend NostrEvent to include score if available
export type ScoredNostrEvent = NostrEvent & { score?: number };

export const NostrEventCard: React.FC<{
  event: ScoredNostrEvent;
  profile: NostrProfile | undefined;
}> = ({ event, profile }) => {
  const eventDate = new Date(event.created_at * 1000).toLocaleString();
  const authorNpub = useMemo(
    () => nip19.npubEncode(event.pubkey),
    [event.pubkey]
  );

  const matchScore = event.score;

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700/80 animate-fade-in relative overflow-hidden">
      {matchScore !== undefined && (
          <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold rounded-bl-lg ${
              matchScore > 80 ? 'bg-green-900/80 text-green-400' :
              matchScore > 50 ? 'bg-yellow-900/80 text-yellow-400' :
              'bg-gray-700/80 text-gray-400'
          }`}>
              {Math.round(matchScore)}% Match
          </div>
      )}
      <div className="flex items-center text-sm text-gray-400 mb-2">
        {profile?.picture && (
          <img
            src={profile.picture}
            alt={profile.name || ''}
            className="h-6 w-6 rounded-full mr-2"
          />
        )}
        <span
          className="font-semibold text-blue-400 hover:underline cursor-pointer"
          title={authorNpub}
        >
          {profile?.name || formatNpub(authorNpub)}
        </span>
        <span className="ml-auto">{eventDate}</span>
      </div>
      <p className="text-gray-300 whitespace-pre-wrap break-words">
        {event.content}
      </p>
    </div>
  );
};
