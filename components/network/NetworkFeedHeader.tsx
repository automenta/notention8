import React from 'react';
import type { NostrEvent } from '../../types';
import { ArrowLeftIcon } from '../layout/icons';

interface NetworkFeedHeaderProps {
    matchAgainstTitle?: string;
    onClearMatch: () => void;
    filter: string;
    setFilter: (filter: string) => void;
    sortedEvents: NostrEvent[];
}

export const NetworkFeedHeader: React.FC<NetworkFeedHeaderProps> = ({
    matchAgainstTitle,
    onClearMatch,
    filter,
    setFilter,
    sortedEvents
}) => {
    return (
        <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
                {matchAgainstTitle && (
                    <button
                        onClick={onClearMatch}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                        title="Back to Feed"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-xl font-bold text-white truncate">
                    {matchAgainstTitle
                        ? `Matches for "${matchAgainstTitle}"`
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
    );
};
