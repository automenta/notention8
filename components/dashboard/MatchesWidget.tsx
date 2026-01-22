import React, { useMemo } from 'react';
import { SearchSparkleIcon, ArrowRightIcon } from '../layout/icons';
import { useView } from '../../hooks/useViewContext';
import { useNotes } from '../../hooks/useNotes';
import { IconButton } from '../common/IconButton';
import { DashboardCard } from './DashboardCard';
import type { MatchResult } from '../../components/contexts/ViewContext';

export const MatchesWidget = ({ onSelectNote }: { onSelectNote: (id: string) => void }) => {
    const { matches } = useView();
    const { notes } = useNotes();

    // Group matches by localNoteId
    const groupedMatches = useMemo(() => {
        const groups: Record<string, MatchResult[]> = {};
        matches.forEach(m => {
            if (!groups[m.localNoteId]) {
                groups[m.localNoteId] = [];
            }
            groups[m.localNoteId].push(m);
        });

        // Sort groups by most recent match in the group
        return Object.entries(groups).sort(([, matchesA], [, matchesB]) => {
            const maxA = Math.max(...matchesA.map(m => m.timestamp || 0));
            const maxB = Math.max(...matchesB.map(m => m.timestamp || 0));
            return maxB - maxA;
        });
    }, [matches]);

    return (
        <DashboardCard title="Network Matches" icon={SearchSparkleIcon}>
            <div className="space-y-4">
                {groupedMatches.length === 0 ? (
                    <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed text-center flex flex-col items-center gap-3">
                        <div className="bg-gray-800 p-3 rounded-full">
                            <SearchSparkleIcon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm font-medium mb-1">No active opportunities.</p>
                            <p className="text-xs text-gray-500 max-w-[250px] mx-auto leading-relaxed">
                                Express your intent clearly. Try adding constraints like <code className="bg-gray-800 px-1 py-0.5 rounded text-purple-300">[price &lt; 100]</code> or <code className="bg-gray-800 px-1 py-0.5 rounded text-blue-300">[skill:coding]</code>.
                            </p>
                        </div>
                    </div>
                ) : (
                    groupedMatches.map(([noteId, groupMatches]) => {
                        const note = notes.find(n => n.id === noteId);
                        const noteTitle = note?.title || 'Untitled Note';

                        // Infer category from note content or tags
                        // Simple heuristic for now: check for intent tag
                        const isRequest = note?.content.includes('[intent:is:request]');
                        const isOffer = note?.content.includes('[intent:is:offer]');
                        const categoryLabel = isRequest ? 'Your Request' : isOffer ? 'Your Offer' : 'Your Note';
                        const categoryColor = isRequest ? 'bg-purple-500' : isOffer ? 'bg-green-500' : 'bg-blue-500';

                        return (
                            <div key={noteId} className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                                {/* Header */}
                                <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-gray-700/50 cursor-pointer hover:bg-gray-750 transition-colors"
                                     onClick={() => onSelectNote(noteId)}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-1 h-8 ${categoryColor} rounded-full flex-shrink-0`} />
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-gray-200 truncate">{noteTitle}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{categoryLabel}</span>
                                                <span>•</span>
                                                <span className="text-purple-400">{groupMatches.length} Matches</span>
                                            </div>
                                        </div>
                                    </div>
                                    <IconButton
                                        icon={ArrowRightIcon}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectNote(noteId);
                                        }}
                                        size="xs"
                                        variant="ghost"
                                        title="View Details"
                                    />
                                </div>

                                {/* Body: Top Matches */}
                                <div className="p-2 space-y-2">
                                    {groupMatches.slice(0, 3).map((match, idx) => (
                                        <div key={`${match.event.id}-${idx}`} className="flex items-start gap-3 p-2 hover:bg-gray-800 rounded transition-colors group">
                                            <div className={`mt-1 text-xs font-bold px-1.5 py-0.5 rounded ${match.score > 0.8 ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                                                {Math.round(match.score * 100)}%
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-300 line-clamp-2">{match.event.content}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-600 font-mono truncate max-w-[100px]">
                                                        {match.event.pubkey.slice(0, 8)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {groupMatches.length > 3 && (
                                        <div className="text-center py-1">
                                            <span className="text-xs text-gray-500 italic">+{groupMatches.length - 3} more opportunities...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </DashboardCard>
    );
};
