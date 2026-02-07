import { describe, it, expect } from 'vitest';
import { matchNotes } from '../../utils/matching';
import type { Note } from '../../types';

const createNote = (properties: any[]): Note => ({
  id: '1',
  title: 'Test',
  content: '',
  tags: [],
  properties,
  createdAt: '',
  updatedAt: ''
});

describe('matchNotes', () => {
  it('matches exact real property', () => {
    const req = createNote([{ key: 'role', operator: 'is', values: ['Engineer'] }]);
    const offer = createNote([{ key: 'role', operator: 'is', values: ['Engineer'] }]);
    expect(matchNotes(req, offer)).toBe(1);
  });

  it('fails mismatch real property', () => {
    const req = createNote([{ key: 'role', operator: 'is', values: ['Engineer'] }]);
    const offer = createNote([{ key: 'role', operator: 'is', values: ['Designer'] }]);
    expect(matchNotes(req, offer)).toBe(0);
  });

  it('matches numeric constraint (less than)', () => {
    const req = createNote([{ key: 'price', operator: 'less than', values: ['100'] }]);
    const offer = createNote([{ key: 'price', operator: 'is', values: ['50'] }]);
    expect(matchNotes(req, offer)).toBe(1);
  });

  it('fails numeric constraint (less than)', () => {
    const req = createNote([{ key: 'price', operator: 'less than', values: ['100'] }]);
    const offer = createNote([{ key: 'price', operator: 'is', values: ['150'] }]);
    expect(matchNotes(req, offer)).toBe(0);
  });

  it('calculates partial match score', () => {
    const req = createNote([
      { key: 'role', operator: 'is', values: ['Dev'] },
      { key: 'exp', operator: 'greater than', values: ['5'] }
    ]);
    const offer = createNote([
      { key: 'role', operator: 'is', values: ['Dev'] }, // Match
      { key: 'exp', operator: 'is', values: ['3'] }     // Fail (3 !> 5)
    ]);

    // In matchNotes, we iterate *constraints*.
    // Here both are constraints (is is also checked).
    // 1 match out of 2 = 0.5
    expect(matchNotes(req, offer)).toBe(0.5);
  });
});
