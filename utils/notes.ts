import type { Note } from '../types';

export const createNote = (overrides?: Partial<Note>): Note => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: 'Untitled Note',
    content: '',
    tags: [],
    properties: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

export const sortNotesByDate = (notes: Note[]) => {
  return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const areNotesEqual = (a: Note, b: Note) => {
  return (
    a.title === b.title &&
    a.content === b.content &&
    JSON.stringify(a.tags) === JSON.stringify(b.tags) &&
    JSON.stringify(a.properties) === JSON.stringify(b.properties)
  );
};
