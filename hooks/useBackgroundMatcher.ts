import { useEffect, useRef } from 'react';
import { useSettings } from './useSettingsContext';
import { useNotes } from './useNotes';
import { useView } from './useViewContext';
import { DEFAULT_RELAYS, pool, convertEventToNote } from '../utils/nostr';
import { matchNotes } from '../utils/matching';

export const useBackgroundMatcher = () => {
  const { settings } = useSettings();
  const { notes } = useNotes(); // Local notes
  const { addMatch, showToast } = useView();

  // Use a ref to track seen events to avoid re-notifying
  const seenEvents = useRef(new Set<string>());

  useEffect(() => {
    // Only run if we have local notes to match against
    if (notes.length === 0) return;

    const relays = settings.nostr.relays || DEFAULT_RELAYS;

    const sub = pool.subscribeMany(
      relays,
      [{ kinds: [1], limit: 0, since: Math.floor(Date.now() / 1000) }], // Only new events
      {
        onevent: (event) => {
          if (seenEvents.current.has(event.id)) return;
          seenEvents.current.add(event.id);

          // Convert to note for matching
          const offerNote = convertEventToNote(event);

          // Check against all local notes
          // This is O(N) per event.
          notes.forEach(localNote => {
             // Only match if local note has semantic properties?
             // Or if it has any content.
             const score = matchNotes(localNote, offerNote);

             if (score > 0.6) { // Threshold
                 addMatch({
                     localNoteId: localNote.id,
                     event,
                     score,
                     timestamp: Date.now()
                 });
                 // Optional: Toast for high relevance
                 if (score > 0.8) {
                    // Only toast if it's REALLY good, and the throttle in ViewContext handles spam
                    showToast(`New match found for "${localNote.title || 'Note'}"!`);
                 }
             }
          });
        },
      }
    );

    return () => {
      sub.close();
    };
  }, [notes, settings.nostr.relays, addMatch, showToast]);
};
