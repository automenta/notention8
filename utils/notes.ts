import type { Note, Property } from '../types';

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

export const sortNotesByDate = (notes: Note[]) =>
  [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

const areStringArraysEqual = (a: string[], b: string[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const arePropertiesEqual = (a: Property[], b: Property[]) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const p1 = a[i];
    const p2 = b[i];
    if (
      p1.key !== p2.key ||
      p1.operator !== p2.operator ||
      !areStringArraysEqual(p1.values, p2.values)
    ) {
      return false;
    }
  }
  return true;
};

export const areNotesEqual = (a: Note, b: Note) => {
  if (a === b) return true;
  return (
    a.title === b.title &&
    a.content === b.content &&
    areStringArraysEqual(a.tags, b.tags) &&
    arePropertiesEqual(a.properties, b.properties)
  );
};
