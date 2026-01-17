import { useMemo, useRef } from 'react';
import type { Note, SortOrder } from '../types';
import { getTextFromHtml } from '../utils/nostr';

const sortStrategies: Record<SortOrder, (a: Note, b: Note) => number> = {
  updatedAt_desc: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  updatedAt_asc: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
  createdAt_desc: (a, b) => b.createdAt.localeCompare(a.createdAt),
  createdAt_asc: (a, b) => a.createdAt.localeCompare(b.createdAt),
  title_asc: (a, b) => a.title.localeCompare(b.title),
  title_desc: (a, b) => b.title.localeCompare(a.title),
};

interface NoteMetadata {
  textContent: string;
  lowerTitle: string;
  lowerTags: string[];
  lowerProps: { key: string; values: string[] }[];
  updatedAt: string;
}

export const useSortedFilteredNotes = (
  notes: Note[],
  searchTerm: string,
  sortOrder: SortOrder,
  showTrash: boolean = false
) => {
  const cacheRef = useRef<Record<string, NoteMetadata>>({});

  // Augment notes with searchable metadata, using a cache to avoid expensive DOM operations
  const notesWithMetadata = useMemo(() => {
    // Filter by deletion status before processing metadata
    const activeNotes = notes.filter(n => showTrash ? !!n.deletedAt : !n.deletedAt);

    const cache = cacheRef.current;
    return activeNotes.map((note) => {
      const cached = cache[note.id];
      // Only re-parse if the note has been updated
      if (cached && cached.updatedAt === note.updatedAt) {
        return { ...note, ...cached };
      }

      const textContent = getTextFromHtml(note.content).toLowerCase();
      const lowerTitle = note.title.toLowerCase();
      const lowerTags = note.tags.map((t) => t.toLowerCase());
      const lowerProps =
        note.properties?.map((p) => ({
          key: p.key.toLowerCase(),
          values: p.values.map((v) => v.toLowerCase()),
        })) || [];

      const metadata: NoteMetadata = {
        textContent,
        lowerTitle,
        lowerTags,
        lowerProps,
        updatedAt: note.updatedAt,
      };
      cache[note.id] = metadata;

      return { ...note, ...metadata };
    });
  }, [notes, showTrash]);

  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return notesWithMetadata; // Return parsed notes (which are already filtered by deletion status)
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Parse search terms
    const searchParts: string[] =
      lowerCaseSearchTerm.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

    const textQueries = searchParts
      .filter((p) => !p.startsWith('#') && !p.includes(':'))
      .map((p) => p.replace(/"/g, ''));

    const tagQueries = searchParts
      .filter((p) => p.startsWith('#'))
      .map((p) => p.substring(1));

    const propQueries = searchParts
      .filter((p) => p.includes(':'))
      .map((p) => {
        const [key, value] = p.split(':', 2);
        return { key, value: value.replace(/"/g, '') };
      });

    return notesWithMetadata.filter((note) => {
      const textMatch = textQueries.every(
        (query) =>
          note.lowerTitle.includes(query) || note.textContent.includes(query)
      );

      const tagMatch = tagQueries.every((query) =>
        note.lowerTags.some((tag) => tag.includes(query))
      );

      const propMatch = propQueries.every((query) =>
        note.lowerProps.some(
          (prop) =>
            prop.key === query.key &&
            prop.values.some((val) => val.includes(query.value))
        )
      );

      return textMatch && tagMatch && propMatch;
    });
  }, [notes, notesWithMetadata, searchTerm]);

  return useMemo(() => {
    const sorter = sortStrategies[sortOrder];
    // Return sorted original notes (stripping metadata for cleanliness, though not strictly necessary in JS)
    // Actually we can just return the objects from filteredNotes which are augmented.
    // Consumers of this hook expect Note[]. The augmented object is a valid Note.
    return [...filteredNotes].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return sorter(a, b);
    });
  }, [filteredNotes, sortOrder]);
};
