import React from 'react';
import { useSingleNoteMatch } from '../../hooks/useSingleNoteMatch';
import { useNotes } from '../../hooks/useNotes';
import type { Note } from '../../types';
import { Badge } from '../common/Badge';
import { SearchSparkleIcon, PlusIcon } from '../layout/icons';
import { parseProperties } from '../../utils/parsing';
import { useToast } from '../../hooks/useToast';
import { useGardener } from '../../hooks/useGardener';
import { useEffect, useRef } from 'react';
import { convertEventToNote } from '../../utils/nostr';

export const EditorMatches = ({ note }: { note: Note }) => {
    const { matches } = useSingleNoteMatch(note);
    const { addNote } = useNotes();
    const { addToast } = useToast();
    const { learnFromProperties } = useGardener();
    const learnedRef = useRef(new Set<string>());

    // Passive Learning: When matches appear, learn from their properties
    useEffect(() => {
        if (matches.length > 0) {
            matches.slice(0, 5).forEach(({ event }) => {
                if (learnedRef.current.has(event.id)) return;

                const note = convertEventToNote(event);
                if (note.properties.length > 0) {
                    learnFromProperties(note.properties);
                    learnedRef.current.add(event.id);
                }
            });
        }
    }, [matches, learnFromProperties]);

    if (matches.length === 0) return null;

    const handleReply = (content: string) => {
        const properties = parseProperties(content);
        addNote({
            title: `Reply to ${note.title}`,
            content: `> ${content}\n\n`,
            tags: [],
            properties
        });
        addToast("Reply draft created.", "success");
    };

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
                {matches.map(({ event, score, satisfied, failed }) => (
                     <div key={event.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors group">
                         <div className="flex justify-between items-start mb-1">
                             <div className="flex items-center gap-1.5">
                                 <div className={`w-2 h-2 rounded-full ${score > 0.8 ? 'bg-green-500' : 'bg-purple-500'}`} />
                                 <span className="text-xs font-semibold text-purple-300">
                                     {Math.round(score * 100)}% Match
                                 </span>
                             </div>
                             <span className="text-[10px] text-gray-500">
                                 {new Date(event.created_at * 1000).toLocaleDateString()}
                             </span>
                         </div>
                         <p className="text-sm text-gray-300 line-clamp-3">{event.content}</p>

                         {satisfied && satisfied.length > 0 && (
                             <div className="mt-2 flex flex-wrap gap-1">
                                 {satisfied.map((p: any) => (
                                     <span key={p.key} className="text-[9px] px-1 rounded bg-green-900/30 text-green-400 border border-green-900/50" title={`Matched: ${p.key}`}>
                                         ✓ {p.key}
                                     </span>
                                 ))}
                             </div>
                         )}

                         {failed && failed.length > 0 && (
                             <div className="mt-1 flex flex-wrap gap-1">
                                 {failed.map((p: any) => (
                                     <span key={p.key} className="text-[9px] px-1 rounded bg-red-900/20 text-red-400 border border-red-900/30 opacity-70" title={`Missing/Mismatch: ${p.key}`}>
                                         ✗ {p.key}
                                     </span>
                                 ))}
                             </div>
                         )}

                         <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                                onClick={() => handleReply(event.content)}
                                className="text-xs flex items-center gap-1 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                             >
                                 <PlusIcon className="w-3 h-3" />
                                 Reply
                             </button>
                         </div>
                     </div>
                ))}
            </div>
        </div>
    );
};
