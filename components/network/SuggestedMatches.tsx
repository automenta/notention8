import React from 'react';
import { SparklesIcon } from '../layout/icons';
import { useView } from '../../hooks/useViewContext';

export const SuggestedMatches: React.FC = () => {
    const { matches, setMatchingNoteId } = useView();

    if (matches.length === 0) return null;

    return (
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
                            setMatchingNoteId(match.localNoteId);
                        }}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-mono text-blue-400">Match Score: {Math.round(match.score * 100)}%</span>
                            <span className="text-xs text-gray-500">Your note: {match.localNoteId.slice(0, 6)}...</span>
                        </div>
                        <div className="text-white font-medium text-sm mb-1 line-clamp-1">
                            {match.event.content.slice(0, 50)}...
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-px bg-gray-700 my-6"></div>
        </div>
    );
};
