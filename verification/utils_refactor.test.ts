import { describe, it, expect } from 'vitest';
import { areStringArraysEqual } from '../utils/notes';
import { arePropertiesEqual, arePropertyArraysEqual } from '../utils/properties';
import type { Property } from '../types';

describe('Utils Refactor Tests', () => {
  describe('areStringArraysEqual', () => {
    it('should return true for identical arrays', () => {
      expect(areStringArraysEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    });

    it('should return false for different lengths', () => {
      expect(areStringArraysEqual(['a'], ['a', 'b'])).toBe(false);
    });

    it('should return false for different content', () => {
      expect(areStringArraysEqual(['a', 'b'], ['a', 'c'])).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(areStringArraysEqual([], [])).toBe(true);
    });

    it('should return true for same reference', () => {
        const arr = ['a'];
        expect(areStringArraysEqual(arr, arr)).toBe(true);
    });
  });

  describe('arePropertiesEqual', () => {
    const p1: Property = { key: 'k', operator: 'op', values: ['v'] };
    const p2: Property = { key: 'k', operator: 'op', values: ['v'] };
    const p3: Property = { key: 'k', operator: 'op', values: ['v2'] };
    const p4: Property = { key: 'k2', operator: 'op', values: ['v'] };

    it('should return true for identical properties', () => {
      expect(arePropertiesEqual(p1, p2)).toBe(true);
    });

    it('should return false for different values', () => {
      expect(arePropertiesEqual(p1, p3)).toBe(false);
    });

    it('should return false for different keys', () => {
      expect(arePropertiesEqual(p1, p4)).toBe(false);
    });

    it('should handle nulls', () => {
      expect(arePropertiesEqual(null, null)).toBe(true);
      expect(arePropertiesEqual(p1, null)).toBe(false);
      expect(arePropertiesEqual(null, p1)).toBe(false);
    });

     it('should return true for same reference', () => {
        expect(arePropertiesEqual(p1, p1)).toBe(true);
    });
  });

  describe('arePropertyArraysEqual', () => {
    const p1: Property = { key: 'k', operator: 'op', values: ['v'] };
    const p2: Property = { key: 'k', operator: 'op', values: ['v'] };
    const p3: Property = { key: 'k', operator: 'op', values: ['v2'] };

    it('should return true for identical arrays', () => {
      expect(arePropertyArraysEqual([p1, p3], [p2, p3])).toBe(true);
    });

    it('should return false for different lengths', () => {
      expect(arePropertyArraysEqual([p1], [p1, p3])).toBe(false);
    });

    it('should return false for different content', () => {
      expect(arePropertyArraysEqual([p1], [p3])).toBe(false);
    });
  });
});
