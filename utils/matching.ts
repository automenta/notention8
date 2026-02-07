import type { Note, Property } from '../types';
import { parseGeo, haversineDistance } from './spacetime';

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

  // We parse constraint values.
  // Note: Constraint might have multiple values? Usually constraints are single value per property entry.
  // [key:is:A, B] -> Does this mean is A AND is B? or is A OR is B?
  // Usually [skill:is:React, Vue] means "I have React and Vue".
  // If request is [skill:is:React], and target is [skill:is:React, Vue], it's a match.

  // If request is [skill:is:React, Vue], and target is [skill:is:React], it's NOT a match (missing Vue).
  // So we iterate ALL constraint values and ensure target has them (AND logic).

  return constraint.values.every(cValStr => {

      // Special handling for 'is near' which needs parsing but we handle inside loop?
      // No, let's parse inside loop.

      const constraintVal = parseValue(cValStr);

      // Target must satisfy this specific value constraint
      return targetProp.values.some(v => {
        const tVal = parseValue(v);

        switch (constraint.operator) {
          case 'is':
            // Exact match (string or number equality) or soft semantic match
            // Handle simple variations: trim, lower case, removing common punctuation
            if (typeof tVal === 'string' && typeof constraintVal === 'string') {
                const cleanT = tVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanC = constraintVal.toLowerCase().replace(/[^a-z0-9]/g, '');

                // Fuzzy Match
                const dist = levenshteinDistance(cleanT, cleanC);
                const maxLen = Math.max(cleanT.length, cleanC.length);
                // Allow 1 edit for length 4-7, 2 edits for length 8+
                const allowedDist = maxLen > 7 ? 2 : maxLen > 3 ? 1 : 0;

                return cleanT === cleanC || cleanT.includes(cleanC) || cleanC.includes(cleanT) || dist <= allowedDist;
            }
            return tVal == constraintVal; // loose equality for "100" == 100

          case 'is not':
            if (typeof tVal === 'string' && typeof constraintVal === 'string') {
                const cleanT = tVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanC = constraintVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                // It is NOT a match if they ARE equal (or soft equal)
                const dist = levenshteinDistance(cleanT, cleanC);
                const maxLen = Math.max(cleanT.length, cleanC.length);
                const allowedDist = maxLen > 7 ? 2 : maxLen > 3 ? 1 : 0;

                const isSoftEqual = cleanT === cleanC || cleanT.includes(cleanC) || cleanC.includes(cleanT) || dist <= allowedDist;
                return !isSoftEqual;
            }
            return tVal != constraintVal;

          case 'less than':
          case 'is before':
            return tVal < constraintVal;

          case 'greater than':
          case 'is after':
            return tVal > constraintVal;

          case 'between':
              // Range check
              // Expects constraint.values to have 2 items: [min, max]
              // But here we are iterating constraint.values (which is `cValStr` / `constraintVal`)
              // checkConstraint loop:
              // return constraint.values.every(cValStr => { ... })

              // Wait, if operator is 'between', constraint.values should be treated as a set of boundaries?
              // The outer loop iterates `constraint.values`.
              // If we have `[price:between:100,200]`, parseProperties returns values=['100', '200'].
              // Then the loop runs for '100', then '200'.
              // This structure (every) implies AND logic.
              // But 'between' isn't checking "is 100" AND "is 200".

              // We need to handle 'between' specially outside the standard value loop?
              // OR we can hack it: if operator is 'between', we expect 2 values.
              // But the architecture loops values individually.

              // Let's look at `constraint.values`.
              if (constraint.values.length === 2) {
                  const min = parseValue(constraint.values[0]);
                  const max = parseValue(constraint.values[1]);
                  return tVal >= min && tVal <= max;
              }
              return false;

          case 'contains':
            // constraint: [skill contains React]
            // target value: "React"
            // If target value is string, does it contain substring?
            // Or is it set membership?
            // If targetProp.values is ["React", "Vue"], we already iterate them.
            // So here tVal is "React". "React" contains "React"? Yes.
            // "React Developer" contains "React"? Yes.
            return String(tVal).toLowerCase().includes(String(constraintVal).toLowerCase());

          case 'is near':
              // Spacetime proximity
              const p1 = parseGeo(String(tVal));
              const p2 = parseGeo(String(constraintVal));
              if (!p1 || !p2) return false;

              // Default 50km if not specified?
              // Ideally constraint would be [location is near 40.7,-74.0, 50km]
              // But parsing "40.7,-74.0, 50km" in parseGeo is not supported yet.
              // Let's hardcode 50km for now as "near".
              const dist = haversineDistance(p1, p2);
              return dist <= 50;

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
