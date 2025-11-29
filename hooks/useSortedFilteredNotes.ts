import { useMemo } from 'react';
import type { Note, SortOrder } from '../types';
import { getTextFromHtml } from '../utils/nostr';

const sortStrategies: Record<SortOrder, (a: Note, b: Note) => number> = {
  updatedAt_desc: (a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  updatedAt_asc: (a, b) =>
    new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
  createdAt_desc: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  createdAt_asc: (a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  title_asc: (a, b) => a.title.localeCompare(b.title),
  title_desc: (a, b) => b.title.localeCompare(a.title),
};

export const useSortedFilteredNotes = (
  notes: Note[],
  searchTerm: string,
  sortOrder: SortOrder
) => {
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return notes;
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

    return notes.filter((note) => {
      const noteContentText = getTextFromHtml(note.content).toLowerCase();
      const noteTitle = note.title.toLowerCase();

      const textMatch = textQueries.every(
        (query) => noteTitle.includes(query) || noteContentText.includes(query)
      );

      const tagMatch = tagQueries.every((query) =>
        (note.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );

      const propMatch = propQueries.every((query) =>
        (note.properties || []).some(
          (prop) =>
            prop.key.toLowerCase() === query.key &&
            prop.values.some((val) => val.toLowerCase().includes(query.value))
        )
      );

      return textMatch && tagMatch && propMatch;
    });
  }, [notes, searchTerm]);

  return useMemo(() => {
    const sorter = sortStrategies[sortOrder];
    return [...filteredNotes].sort(sorter);
  }, [filteredNotes, sortOrder]);
};
