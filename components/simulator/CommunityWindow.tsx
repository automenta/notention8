import React, { useMemo } from 'react';
import type { Note } from '../../types';
import { matchNotes } from '../../utils/matching';
import { DownloadIcon } from '../layout/icons';

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
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-purple-900/30 px-3 py-2 border-b border-purple-500/30 flex justify-between items-center">
        <h3 className="font-bold text-xs text-purple-200">🌐 Network</h3>
        <span className="text-[10px] text-purple-400">{networkNotes.length} Events</span>
      </div>

      <div className="flex-grow p-2 overflow-y-auto relative">
        {networkNotes.length === 0 && (
            <div className="text-center text-gray-600 text-[10px] mt-10">
                Waiting for network activity...
            </div>
        )}

        <div className="space-y-2">
            {networkNotes.map((note) => {
                const relatedMatches = matches.filter(m => m.source.id === note.id || m.target.id === note.id);
                const isMatch = relatedMatches.length > 0;

                return (
                    <div
                        key={note.id}
                        className={`p-2 rounded border transition-all duration-500 ${isMatch ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-gray-800 border-gray-700'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                             <div className="text-[9px] text-gray-400">{note.updatedAt ? new Date(note.updatedAt).toLocaleTimeString() : 'Now'}</div>
                             {isMatch && <span className="text-[8px] bg-indigo-600 text-white px-1 rounded animate-pulse">MATCH</span>}

                             {onSaveNote && (
                                 <button
                                    onClick={() => onSaveNote(note)}
                                    title="Save to My Notes"
                                    className="ml-auto text-gray-500 hover:text-green-400 transition-colors"
                                 >
                                     <DownloadIcon className="w-3 h-3" />
                                 </button>
                             )}
                        </div>

                        <div className="text-[10px] text-gray-200 font-medium mb-1 break-words leading-tight">
                            {note.content.split('\n')[0].slice(0, 50)}
                            {note.content.length > 50 && "..."}
                        </div>

                        {/* Semantic Properties */}
                        <div className="flex flex-wrap gap-1 mb-1">
                            {note.properties.map((p, i) => {
                                // Highlight property if it's involved in a match?
                                // For now, just styling.
                                return (
                                    <span key={i} className={`text-[9px] px-1 rounded font-mono border ${isMatch ? 'bg-indigo-950 border-indigo-400 text-indigo-300' : 'bg-gray-950/50 border-green-500/30 text-green-400'}`}>
                                        [{p.key}:{p.operator === 'is' ? 'is' : p.operator}:{p.values.join(', ')}]
                                    </span>
                                );
                            })}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                            {note.tags.map(tag => (
                                <span key={tag} className="text-[9px] text-blue-400/80">#{tag}</span>
                            ))}
                        </div>

                        {/* Match Details */}
                        {relatedMatches.length > 0 && (
                             <div className="mt-1 pt-1 border-t border-white/10 text-[9px] text-indigo-300">
                                 {relatedMatches.map((m, idx) => (
                                     <div key={idx}>
                                         &lt;-&gt; {m.source.id === note.id ? m.target.id.slice(0,4) : m.source.id.slice(0,4)}
                                         <span className="ml-1 opacity-75">({Math.round(m.score * 100)}%)</span>
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
