import React, { useMemo } from 'react';
import type { Note } from '../../types';
import { matchNotes } from '../../utils/matching';

interface Props {
  networkNotes: Note[];
}

export const CommunityWindow: React.FC<Props> = ({ networkNotes }) => {

  // Simple matching visualization
  // Find pairs of notes that match (score > 0)
  const matches = useMemo(() => {
    const found: { source: Note; target: Note; score: number }[] = [];

    // Naive O(n^2) check - fine for simulation with few notes
    for (let i = 0; i < networkNotes.length; i++) {
        for (let j = 0; j < networkNotes.length; j++) {
            if (i === j) continue;
            const source = networkNotes[i];
            const target = networkNotes[j];

            // Only check if source is a Request?
            // The matching engine is directional: source (constraints) -> target (facts)
            const score = matchNotes(source, target);
            if (score > 0) {
                found.push({ source, target, score });
            }
        }
    }
    return found;
  }, [networkNotes]);

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-purple-900/30 px-3 py-2 border-b border-purple-500/30 flex justify-between items-center">
        <h3 className="font-bold text-sm text-purple-200">🌐 Community / Network</h3>
        <span className="text-xs text-purple-400">{networkNotes.length} Events</span>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {networkNotes.length === 0 && (
            <div className="text-center text-gray-600 text-sm mt-10">
                Waiting for network activity...
            </div>
        )}

        {/* Render Notes as "Cards" in a feed */}
        {networkNotes.map((note) => {
             // Check if this note is involved in a match
             const relatedMatches = matches.filter(m => m.source.id === note.id || m.target.id === note.id);

             return (
                <div key={note.id} className="bg-gray-800 p-3 rounded border border-gray-700 relative">
                    <div className="text-xs text-gray-400 mb-1">{note.updatedAt ? new Date(note.updatedAt).toLocaleTimeString() : 'Just now'}</div>
                    <div className="text-sm text-gray-200 font-medium mb-2">{note.content.split('\n')[0].slice(0, 50)}...</div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-700 px-1 rounded text-blue-300">#{tag}</span>
                        ))}
                    </div>

                    {/* Semantic Properties (rendered roughly) */}
                    <div className="flex flex-wrap gap-1">
                        {note.properties.map((p, i) => (
                             <span key={i} className="text-[10px] bg-gray-900 border border-gray-600 px-1 rounded text-green-400 font-mono">
                                [{p.key} {p.operator} {p.value}]
                             </span>
                        ))}
                    </div>

                    {/* Match Badges */}
                    {relatedMatches.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            {relatedMatches.map((m, k) => (
                                <div key={k} className="text-xs text-yellow-400 flex items-center gap-1">
                                    <span>⚡ Matched with</span>
                                    <span className="italic text-gray-400">
                                        {m.source.id === note.id ? "an offer" : "a request"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             );
        })}
      </div>
    </div>
  );
};
