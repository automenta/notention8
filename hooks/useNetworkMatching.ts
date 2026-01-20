import { useMemo } from 'react';
import type { Note } from '../types';
import { matchNotes } from '../utils/matching';

export interface MatchResult {
    source: Note;
    target: Note;
    score: number;
}

export function useNetworkMatching(networkNotes: Note[]) {
    return useMemo(() => {
        const found: MatchResult[] = [];

        for (let i = 0; i < networkNotes.length; i++) {
            for (let j = 0; j < networkNotes.length; j++) {
                if (i === j) continue;
                const source = networkNotes[i];
                const target = networkNotes[j];

                // Explicitly prevent self-matching if ID check failed
                if (source.id === target.id) continue;

                const score = matchNotes(source, target);
                if (score > 0.5) {
                    found.push({ source, target, score });
                }
            }
        }
        return found;
    }, [networkNotes]);
}
