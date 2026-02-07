
import type { Note, Property } from '../types';

export type NoteIntent = 'Real' | 'Imaginary' | 'Ambiguous';

/**
 * Infers the intent of a note based on the definiteness of its properties.
 *
 * - 'Real' (Offer/Fact): Describes something that exists (Definite properties).
 * - 'Imaginary' (Request/Requirement): Describes something desired (Indefinite properties).
 *
 * Logic:
 * - If a note has *any* Indefinite property (constraints like range, inequality), it implies a Requirement/Request.
 * - If a note has *only* Definite properties (equality), it implies a Fact/Offer.
 */
export const inferNoteIntent = (note: Note): NoteIntent => {
    // 1. Explicit Tag Override (Backward Compatibility)
    if (note.tags.includes('request') || note.content.includes('[intent:is:request]')) return 'Imaginary';
    if (note.tags.includes('offer') || note.content.includes('[intent:is:offer]')) return 'Real';

    if (note.properties.length === 0) return 'Ambiguous';

    // 2. Property Analysis
    const hasIndefinite = note.properties.some(isIndefiniteProperty);

    if (hasIndefinite) {
        return 'Imaginary';
    }

    // If we only have definite properties, it's likely describing a Real entity
    return 'Real';
};

const isIndefiniteProperty = (prop: Property): boolean => {
    // Operators that imply a range, exclusion, or fuzzy match are Indefinite constraints
    const indefiniteOps = ['greater than', 'less than', 'between', 'is not', 'contains'];

    if (indefiniteOps.includes(prop.operator)) {
        return true;
    }

    // "is" can be indefinite if the value is a wildcard or variable (future feature)
    // For now, "is" is treated as Definite (Equality constraint or Fact).

    return false;
};
