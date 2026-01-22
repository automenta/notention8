import React from 'react';
import type { NostrEvent } from '../../types';
import { ArrowLeftIcon } from '../layout/icons';
import { IconButton } from '../common/IconButton';
import { Input } from '../common/Input';

import { Button } from '../common/Button';

interface NetworkFeedHeaderProps {
    matchAgainstTitle?: string;
    onClearMatch: () => void;
    filter: string;
    setFilter: (filter: string) => void;
    sortedEvents: NostrEvent[];
    intentFilter?: 'all' | 'request' | 'offer';
    setIntentFilter?: (val: 'all' | 'request' | 'offer') => void;
}

export const NetworkFeedHeader: React.FC<NetworkFeedHeaderProps> = ({
    matchAgainstTitle,
    onClearMatch,
    filter,
    setFilter,
    sortedEvents,
    intentFilter = 'all',
    setIntentFilter
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
                {matchAgainstTitle && (
                    <IconButton
                        onClick={onClearMatch}
                        icon={ArrowLeftIcon}
                        title="Back to Feed"
                        variant="ghost"
                        size="md"
                    />
                )}
                <h1 className="text-xl font-bold text-white truncate">
                    {matchAgainstTitle
                        ? `Matches for "${matchAgainstTitle}"`
                        : '⚡️ Public Feed'}
                </h1>
            </div>

            <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto">
                 {setIntentFilter && (
                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                        <button
                            onClick={() => setIntentFilter('all')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${intentFilter === 'all' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setIntentFilter('request')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${intentFilter === 'request' ? 'bg-purple-900/50 text-purple-200 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            Requests
                        </button>
                        <button
                            onClick={() => setIntentFilter('offer')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${intentFilter === 'offer' ? 'bg-green-900/50 text-green-200 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            Offers
                        </button>
                    </div>
                )}
                <Input
                    type="text"
                    placeholder="Search notes..."
                    className="w-full md:w-48"
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
