import React, { useMemo } from 'react';
import { nip19 } from 'nostr-tools';

import { useView } from '../../hooks/useViewContext';
import type { NostrEvent, NostrProfile } from '../../types';
import { formatNpub, extractPropertiesFromTags } from '../../utils/nostr';
import { ChatIcon, SparklesIcon, MergeIcon, DocumentDuplicateIcon } from '../icons';

// Extend NostrEvent to include score if available
export type ScoredNostrEvent = NostrEvent & { score?: number };

interface NostrEventCardProps {
  event: ScoredNostrEvent;
  profile: NostrProfile | undefined;
  onApplyMatch?: (event: ScoredNostrEvent) => void;
  onFork?: () => void;
}

export function NostrEventCard({
  event,
  profile,
  onApplyMatch,
  onFork,
}: NostrEventCardProps) {
  const { setActiveView, setSelectedChatPubkey } = useView();

  const eventDate = new Date(event.created_at * 1000).toLocaleString();
  const authorNpub = useMemo(
    () => nip19.npubEncode(event.pubkey),
    [event.pubkey]
  );

  const matchScore = event.score;

  const handleChat = () => {
    setSelectedChatPubkey(event.pubkey);
    setActiveView('chat');
  };

  const hasProperties = extractPropertiesFromTags(event.tags).length > 0;

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700/80 animate-fade-in relative overflow-hidden group">
      {matchScore !== undefined && (
        <div
          className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold rounded-bl-lg ${
            matchScore > 80
              ? 'bg-green-900/80 text-green-400'
              : matchScore > 50
                ? 'bg-yellow-900/80 text-yellow-400'
                : 'bg-gray-700/80 text-gray-400'
          }`}
        >
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
      <p className="text-gray-300 whitespace-pre-wrap break-words mb-2">
        {event.content}
      </p>

      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onApplyMatch && hasProperties && (
            <button
              onClick={() => onApplyMatch(event)}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white rounded transition-colors"
              title="Apply semantic properties to your note"
            >
              <MergeIcon className="w-3 h-3" />
              Apply Match
            </button>
        )}
        {onFork && (
            <button
                onClick={onFork}
                className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-700 hover:bg-green-600 text-gray-300 hover:text-white rounded transition-colors"
                title="Fork this note to your collection"
            >
                <DocumentDuplicateIcon className="w-3 h-3" />
                Fork
            </button>
        )}
        <button
          onClick={handleChat}
          className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white rounded transition-colors"
        >
          <ChatIcon className="w-3 h-3" />
          Chat
        </button>
      </div>
    </div>
  );
}
