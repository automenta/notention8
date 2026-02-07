import type { Note, Property } from '../types';

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

const checkConstraint = (constraint: Property, target: Note): boolean => {
  // Find corresponding property in target
  // We look for a "Real" property in target with the same key
  // Usually target has [key:is:value].
  // But what if target has [key:is:val1, val2]?

  const targetProp = target.properties.find(
    p => p.key === constraint.key && p.operator === 'is'
  );

  if (!targetProp) return false;

  // We assume single value for simplicity in comparison for now, or 'any' match
  const constraintVal = parseValue(constraint.values[0]);

  // Target might have multiple values (e.g. skills). Check if ANY satisfies the constraint.
  return targetProp.values.some(v => {
    const tVal = parseValue(v);

    switch (constraint.operator) {
      case 'is':
        // Exact match (string or number equality)
        return tVal == constraintVal; // loose equality for "100" == 100

      case 'is not':
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
        return String(tVal).includes(String(constraintVal));

      default:
        return false;
    }
  });
};

const parseValue = (val: string | number): string | number => {
  if (typeof val === 'number') return val;
  const num = parseFloat(val);
  return isNaN(num) ? val : num;
};
