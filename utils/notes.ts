import type { Note } from '../types';
import { arePropertyArraysEqual } from './properties';

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

export const areStringArraysEqual = (a: string[], b: string[]) =>
  a === b || (a.length === b.length && a.every((val, i) => val === b[i]));

export const areNotesEqual = (a: Note, b: Note) => {
  if (a === b) return true;
  return (
    a.title === b.title &&
    a.content === b.content &&
    areStringArraysEqual(a.tags, b.tags) &&
    arePropertyArraysEqual(a.properties, b.properties)
  );
};
