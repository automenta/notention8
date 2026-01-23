import { describe, it, expect } from 'vitest';
import { inferNoteIntent, createNote } from '../../utils/notes';

describe('inferNoteIntent', () => {
  it('returns "Real" for explicit offer tags', () => {
    const note = createNote({ tags: ['offer'] });
    expect(inferNoteIntent(note)).toBe('Real');
  });

  it('returns "Imaginary" for explicit request tags', () => {
    const note = createNote({ tags: ['request'] });
    expect(inferNoteIntent(note)).toBe('Imaginary');
  });

  it('returns "Ambiguous" if no properties', () => {
    const note = createNote({ properties: [] });
    expect(inferNoteIntent(note)).toBe('Ambiguous');
  });

  it('returns "Imaginary" if indefinite properties exist', () => {
    const note = createNote({
      properties: [
        { key: 'price', operator: 'less than', values: ['100'] }
      ]
    });
    expect(inferNoteIntent(note)).toBe('Imaginary');
  });

  it('returns "Real" if only definite properties exist', () => {
    const note = createNote({
      properties: [
        { key: 'price', operator: 'is', values: ['100'] }
      ]
    });
    expect(inferNoteIntent(note)).toBe('Real');
  });

  it('prioritizes indefinite properties over definite ones (implies constraint)', () => {
    const note = createNote({
      properties: [
        { key: 'type', operator: 'is', values: ['car'] },
        { key: 'price', operator: 'less than', values: ['5000'] }
      ]
    });
    expect(inferNoteIntent(note)).toBe('Imaginary');
  });
});
