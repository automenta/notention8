import React, { useMemo } from 'react';
import type { Note } from '../../types';
import { matchNotes } from '../../utils/matching';
import { DownloadIcon, WorldIcon } from '../layout/icons';

interface Props {
  networkNotes: Note[];
  onSaveNote?: (note: Note) => void;
}

export const CommunityWindow: React.FC<Props> = ({ networkNotes, onSaveNote }) => {

  // Simple matching visualization
  const matches = useMemo(() => {
    const found: { source: Note; target: Note; score: number }[] = [];

    for (let i = 0; i < networkNotes.length; i++) {
        for (let j = 0; j < networkNotes.length; j++) {
            if (i === j) continue;
            const source = networkNotes[i];
            const target = networkNotes[j];

            // Explicitly prevent self-matching if ID check failed (though unlikely with proper state management)
            if (source.id === target.id) continue;

            const score = matchNotes(source, target);
            if (score > 0.5) {
                found.push({ source, target, score });
            }
        }
    }
    return found;
  }, [networkNotes]);

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-purple-900/20 px-3 py-2 border-b border-purple-500/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <WorldIcon className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-xs text-purple-200 tracking-wide">NETWORK</h3>
        </div>
        <span className="text-[10px] text-purple-400 bg-purple-900/40 px-1.5 py-0.5 rounded border border-purple-500/20">
            {networkNotes.length} Events
        </span>
      </div>

      <div className="flex-grow p-2 overflow-y-auto relative bg-gray-950/50 custom-scrollbar">
        {networkNotes.length === 0 && (
            <div className="flex items-center justify-center h-full flex-col gap-2 text-gray-600">
                <WorldIcon className="w-8 h-8 opacity-20" />
                <span className="text-[10px] italic">Waiting for network activity...</span>
            </div>
        )}

        <div className="space-y-2">
            {networkNotes.map((note) => {
                const relatedMatches = matches.filter(m => m.source.id === note.id || m.target.id === note.id);
                const isMatch = relatedMatches.length > 0;

                return (
                    <div
                        key={note.id}
                        className={`p-2 rounded border transition-all duration-500 group ${
                            isMatch
                            ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:bg-indigo-900/30'
                            : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1.5">
                             <div className="text-[9px] text-gray-500 font-mono">
                                 {note.updatedAt ? new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : 'Now'}
                             </div>
                             {isMatch && <span className="text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 rounded animate-pulse font-bold">MATCH</span>}

                             {onSaveNote && (
                                 <button
                                    onClick={() => onSaveNote(note)}
                                    title="Save to My Notes"
                                    className="ml-auto text-gray-600 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100"
                                 >
                                     <DownloadIcon className="w-3 h-3" />
                                 </button>
                             )}
                        </div>

                        <div className="text-[10px] text-gray-300 font-medium mb-2 break-words leading-relaxed line-clamp-2">
                            {note.content.replace(/<[^>]*>/g, '')}
                        </div>

                        {/* Semantic Properties */}
                        {note.properties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5">
                                {note.properties.map((p, i) => (
                                    <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${
                                        isMatch
                                        ? 'bg-indigo-900/40 border-indigo-500/30 text-indigo-200'
                                        : 'bg-gray-900 border-gray-700 text-gray-400'
                                    }`}>
                                        {p.key}:{p.values.join(', ')}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Tags */}
                        {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {note.tags.map(tag => (
                                    <span key={tag} className="text-[9px] text-blue-400/70 hover:text-blue-400 transition-colors">#{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Match Details */}
                        {relatedMatches.length > 0 && (
                             <div className="mt-2 pt-1 border-t border-indigo-500/20 text-[9px] text-indigo-300/80 font-mono">
                                 {relatedMatches.map((m, idx) => (
                                     <div key={idx} className="flex justify-between">
                                         <span>&lt;-&gt; {m.source.id === note.id ? m.target.id.slice(0,6) : m.source.id.slice(0,6)}</span>
                                         <span className="font-bold">{Math.round(m.score * 100)}%</span>
                                     </div>
                                 ))}
                             </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
