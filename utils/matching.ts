import type { Note, Property } from '../types';
import { parseGeo, haversineDistance } from './spacetime';
import { parseQuantity, compareQuantities } from './quantities';

const CANONICAL: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  py: 'python',
  python: 'python',
  react: 'react',
  reactjs: 'react',
  node: 'nodejs',
  nodejs: 'nodejs',
  dev: 'developer',
  developer: 'developer',
  engineer: 'developer', // Soft synonym? Maybe 'engineer' is distinct. Let's map 'eng' to 'engineer'.
  eng: 'engineer',
  swe: 'software engineer',
  'software engineer': 'software engineer',
  remote: 'remote',
  wfh: 'remote',
  distributed: 'remote',
};

export const normalizeTerm = (term: string): string => {
  if (!term) return '';
  const lower = term.toLowerCase().trim();
  // Remove common punctuation?
  const clean = lower.replace(/[^a-z0-9\s]/g, '');

  return CANONICAL[clean] || clean;
};

export interface MatchResultDetails {
    score: number;
    satisfied: Property[];
    failed: Property[];
}

/**
 * Levenshtein distance for fuzzy string matching
 */
export const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Calculates a match score between a Request Note (Query) and an Offer Note (Target).
 *
 * Logic:
 * - The Request Note's properties are ALL treated as constraints (requirements).
 *   - [key:is:value] -> Requires target to have key:is:value (Equality)
 *   - [key > value]  -> Requires target to have key:is:X where X > value (Condition)
 *
 * - The Offer Note's properties are treated as Facts.
 *
 * Score = (Satisfied Constraints) / (Total Constraints)
 */
export const matchNotes = (request: Note, offer: Note): MatchResultDetails => {
  // All properties in the request are constraints to be satisfied
  const constraints = request.properties;

  if (constraints.length === 0) {
    return { score: 0, satisfied: [], failed: [] };
  }

  const satisfied: Property[] = [];
  const failed: Property[] = [];

  for (const constraint of constraints) {
    if (checkConstraint(constraint, offer)) {
      satisfied.push(constraint);
    } else {
        failed.push(constraint);
    }
  }

  return {
      score: satisfied.length / constraints.length,
      satisfied,
      failed
  };
};

/**
 * Calculates a semantic overlap score between two notes based on shared property keys.
 * This is useful for "See also" or "Related" suggestions where exact constraints might not match.
 */
export const calculateSemanticOverlap = (noteA: Note, noteB: Note): number => {
    const keysA = new Set(noteA.properties.map(p => p.key));
    const keysB = new Set(noteB.properties.map(p => p.key));

    if (keysA.size === 0 || keysB.size === 0) return 0;

    let overlap = 0;
    keysA.forEach(key => {
        if (keysB.has(key)) overlap++;
    });

    // Jaccard index
    const union = new Set([...keysA, ...keysB]);
    return overlap / union.size;
};

export const checkConstraint = (constraint: Property, target: Note): boolean => {
  // Find corresponding property in target
  // We look for a "Real" property in target with the same key
  // Usually target has [key:is:value].
  // But what if target has [key:is:val1, val2]?

  const targetProp = target.properties.find(
    p => p.key === constraint.key && (p.operator === 'is' || p.operator === 'contains')
  );

  if (!targetProp) return false;

  // Optimize 'between' constraint
  if (constraint.operator === 'between') {
      if (constraint.values.length === 2) {
          const min = parseValue(constraint.values[0]);
          const max = parseValue(constraint.values[1]);
          // Target matches if ANY of its values fall in range
          return targetProp.values.some(v => {
              const tVal = parseValue(v);
              return tVal >= min && tVal <= max;
          });
      }
      return false;
  }

  // Optimize 'is near' constraint
  if (constraint.operator === 'is near') {
      // constraint.values[0] is center point
      // Optional constraint.values[1] could be radius? Not standard yet.
      const p2 = parseGeo(String(parseValue(constraint.values[0])));
      if (!p2) return false;

      return targetProp.values.some(v => {
          const p1 = parseGeo(String(parseValue(v)));
          if (!p1) return false;
          const dist = haversineDistance(p1, p2);
          return dist <= 50; // Hardcoded 50km for now
      });
  }

  // Standard constraints iterate all constraint values (AND logic for constraints)
  // [skill:is:React, Vue] -> requires React AND Vue (if constraint is strict subset)

  // However, traditionally:
  // [key:is:A] matches [key:is:A, B] (subset match)
  // [key:is:A, B] matches [key:is:A, B, C]
  // [key:is:A, B] does NOT match [key:is:A] (B missing)

  // What if constraint uses 'contains'?
  // [skill:contains:React] matches "React Native"
  // [skill:contains:React, Vue] matches "React Native" AND "Vue.js" ? Yes.

  return constraint.values.every(cValStr => {
      const constraintVal = parseValue(cValStr);
      const constraintQty = parseQuantity(cValStr);

      // Target must satisfy this specific value constraint
      // We look for ONE value in target that satisfies this constraint value
      return targetProp.values.some(v => {
        const tVal = parseValue(v);
        const tQty = parseQuantity(v);

        // Try quantity comparison first if both are parseable as quantities
        // BUT strictness: only if compareQuantities returns non-null (meaning compatible units)
        // If one is "100" (unitless) and other is "100 USD", compareQuantities returns null.
        if (constraintQty && tQty) {
            const cmp = compareQuantities(tQty, constraintQty);
            if (cmp !== null) {
                switch (constraint.operator) {
                    case 'is': return cmp === 0;
                    case 'is not': return cmp !== 0;
                    case 'less than': return cmp === -1;
                    case 'greater than': return cmp === 1;
                    // 'is before' and 'is after' usually for dates, handled by string/number fallback or maybe quantities if time?
                    // But 'time' units in quantities are durations (1 hr), not points in time.
                }
            }
        }

        switch (constraint.operator) {
          case 'is':
            // Exact match (string or number equality) or soft semantic match
            // Handle simple variations: trim, lower case, removing common punctuation
            if (typeof tVal === 'string' && typeof constraintVal === 'string') {
                const cleanT = normalizeTerm(tVal);
                const cleanC = normalizeTerm(constraintVal);

                // Check exact match on normalized terms (handles synonyms)
                if (cleanT === cleanC) return true;

                // Fallback to fuzzy logic on original raw strings if synonym match fails
                // (e.g. slight typos not in synonym dict)
                const rawT = tVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                const rawC = constraintVal.toLowerCase().replace(/[^a-z0-9]/g, '');

                // Fuzzy Match
                const dist = levenshteinDistance(rawT, rawC);
                const maxLen = Math.max(rawT.length, rawC.length);
                // Allow 1 edit for length 4-7, 2 edits for length 8+
                const allowedDist = maxLen > 7 ? 2 : maxLen > 3 ? 1 : 0;

                return rawT === rawC || rawT.includes(rawC) || rawC.includes(rawT) || dist <= allowedDist;
            }
            return tVal == constraintVal; // loose equality for "100" == 100

          case 'is not':
            if (typeof tVal === 'string' && typeof constraintVal === 'string') {
                const cleanT = normalizeTerm(tVal);
                const cleanC = normalizeTerm(constraintVal);

                if (cleanT === cleanC) return false;

                const rawT = tVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                const rawC = constraintVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                // It is NOT a match if they ARE equal (or soft equal)
                const dist = levenshteinDistance(rawT, rawC);
                const maxLen = Math.max(rawT.length, rawC.length);
                const allowedDist = maxLen > 7 ? 2 : maxLen > 3 ? 1 : 0;

                const isSoftEqual = rawT === rawC || rawT.includes(rawC) || rawC.includes(rawT) || dist <= allowedDist;
                return !isSoftEqual;
            }
            return tVal != constraintVal;

          case 'less than':
          case 'is before':
            return tVal < constraintVal;

          case 'greater than':
          case 'is after':
            return tVal > constraintVal;

          case 'contains':
            // Check normalized contains
            const normT = normalizeTerm(String(tVal));
            const normC = normalizeTerm(String(constraintVal));
            if (normT.includes(normC)) return true;

            return String(tVal).toLowerCase().includes(String(constraintVal).toLowerCase());

          default:
            return false;
        }
      });
  });
};

const parseValue = (val: string | number): string | number => {
  if (typeof val === 'number') return val;

  // Try to parse as Date first if it looks like one (simple check)
  // ISO date format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
      return val;
  }

  const num = parseFloat(val);
  // Check if it is a valid number and the string is actually numeric
  // We want to avoid parsing "40.7,-74.0" as 40.7 (losing info)

  // If the string contains a comma, treat as string (likely coords or list)
  if (val.includes(',')) return val;

  return isNaN(num) ? val : num;
};
