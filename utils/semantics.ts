
import type { Note, Property } from '../types';

export type NoteIntent = 'Real' | 'Imaginary' | 'Ambiguous';

const INDEFINITE_OPS = new Set([
    'greater than',
    'less than',
    'between',
    'is not',
    'contains',
    'is near',
    // Symbolic fallbacks if not normalized
    '<',
    '>',
    '!=',
    '≈',
    '∋'
]);

export const isIndefiniteOperator = (operator: string): boolean => {
    return INDEFINITE_OPS.has(operator);
};

export const isIndefiniteProperty = (prop: Property): boolean => {
    return isIndefiniteOperator(prop.operator);
};

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
