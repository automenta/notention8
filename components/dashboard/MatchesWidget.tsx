import React from 'react';
import { SearchSparkleIcon, ArrowRightIcon } from '../layout/icons';
import { useView } from '../../hooks/useViewContext';
import { useNotes } from '../../hooks/useNotes';
import { Badge } from '../common/Badge';
import { IconButton } from '../common/IconButton';

export const MatchesWidget = ({ onSelectNote }: { onSelectNote: (id: string) => void }) => {
    const { matches } = useView();
    const { notes } = useNotes();

    const recentMatches = matches.slice(0, 4);

    return (
        <div>
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                    <SearchSparkleIcon className="h-5 w-5 text-purple-400" />
                    Opportunities
                    {matches.length > 0 && <Badge variant="default">{matches.length}</Badge>}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentMatches.length === 0 ? (
                    <div className="col-span-full p-8 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed text-center text-gray-500">
                        Scanning network for semantic matches...
                    </div>
                ) : (
                    recentMatches.map((match, idx) => {
                        const localNote = notes.find(n => n.id === match.localNoteId);
                        return (
                            <div
                                key={`${match.event.id}_${match.localNoteId}_${idx}`}
                                className="p-4 bg-gray-800 hover:bg-gray-750 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all flex flex-col gap-2 shadow-sm group"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-medium text-purple-300 truncate w-3/4">
                                        Re: {localNote?.title || 'Untitled'}
                                    </h3>
                                    <span className="text-xs font-mono text-gray-500">
                                        {Math.round(match.score * 100)}%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {match.event.content}
                                </p>
                                <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <IconButton
                                        onClick={() => onSelectNote(match.localNoteId)}
                                        icon={ArrowRightIcon}
                                        title="Go to Note"
                                        size="xs"
                                        variant="ghost"
                                     />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
