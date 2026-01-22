import type { Note, Property } from '../types';
import { parseGeo, haversineDistance } from './spacetime';

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
export const matchNotes = (request: Note, offer: Note): number => {
  // All properties in the request are constraints to be satisfied
  const constraints = request.properties;

  if (constraints.length === 0) {
    return 0;
  }

  let matches = 0;

  for (const constraint of constraints) {
    if (checkConstraint(constraint, offer)) {
      matches++;
    }
  }

  return matches / constraints.length;
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
                return cleanT === cleanC || cleanT.includes(cleanC) || cleanC.includes(cleanT);
            }
            return tVal == constraintVal; // loose equality for "100" == 100

          case 'is not':
            if (typeof tVal === 'string' && typeof constraintVal === 'string') {
                const cleanT = tVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanC = constraintVal.toLowerCase().replace(/[^a-z0-9]/g, '');
                // It is NOT a match if they ARE equal (or soft equal)
                const isSoftEqual = cleanT === cleanC || cleanT.includes(cleanC) || cleanC.includes(cleanT);
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
