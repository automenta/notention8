import React from 'react';
import { useSingleNoteMatch } from '../../hooks/useSingleNoteMatch';
import type { Note } from '../../types';
import { Badge } from '../common/Badge';
import { SearchSparkleIcon } from '../layout/icons';

export const EditorMatches = ({ note }: { note: Note }) => {
    const { matches } = useSingleNoteMatch(note);

    if (matches.length === 0) return null;

    return (
        <div className="border-t border-gray-700 bg-gray-900/50 flex flex-col animate-fade-in">
            <div className="p-3 border-b border-gray-800 flex items-center gap-2">
                 <SearchSparkleIcon className="w-4 h-4 text-purple-400" />
                 <h3 className="text-sm font-bold text-gray-300">
                    Network Matches
                 </h3>
                 <Badge variant="default">{matches.length}</Badge>
            </div>

            <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {matches.map(({ event, score }) => (
                     <div key={event.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer">
                         <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-1.5">
                                 <div className="w-2 h-2 rounded-full bg-purple-500" />
                                 <span className="text-xs font-semibold text-purple-300">
                                     {Math.round(score * 100)}% Match
                                 </span>
                             </div>
                             <span className="text-[10px] text-gray-500">
                                 {new Date(event.created_at * 1000).toLocaleDateString()}
                             </span>
                         </div>
                         <p className="text-sm text-gray-300 line-clamp-3">{event.content}</p>
                     </div>
                ))}
            </div>
        </div>
    );
};
