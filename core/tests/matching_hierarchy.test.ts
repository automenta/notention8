import { describe, it, expect } from 'vitest';
import { MatchingEngine } from '../src/matching';
import type { OntologyNode } from '../src/types';

describe('MatchingEngine (Hierarchy)', () => {
    // Construct a mini ontology
    // Vehicles -> Cars -> Sedans
    //          -> Trucks
    // Professions -> Engineers -> Software Engineers
    //                          -> Civil Engineers
    //             -> Doctors
    const ontology: OntologyNode[] = [
        {
            id: 'vehicles', label: 'Vehicle', children: [
                { id: 'cars', label: 'Car', children: [
                    { id: 'sedans', label: 'Sedan' }
                ]},
                { id: 'trucks', label: 'Truck' }
            ]
        },
        {
            id: 'professions', label: 'Profession', children: [
                { id: 'engineers', label: 'Engineer', children: [
                    { id: 'swe', label: 'Software Engineer' },
                    { id: 'civil', label: 'Civil Engineer' }
                ]},
                { id: 'doctors', label: 'Doctor' }
            ]
        }
    ];

    const engine = new MatchingEngine(ontology);

    describe('isSubtype', () => {
        it('identifies direct children', () => {
            expect(engine.isSubtype('Car', 'Vehicle')).toBe(true);
            expect(engine.isSubtype('Engineer', 'Profession')).toBe(true);
        });

        it('identifies grandchildren', () => {
            expect(engine.isSubtype('Sedan', 'Vehicle')).toBe(true);
            expect(engine.isSubtype('Software Engineer', 'Profession')).toBe(true);
        });

        it('handles case insensitivity and synonyms', () => {
            expect(engine.isSubtype('software engineer', 'engineer')).toBe(true);
            expect(engine.isSubtype('SWE', 'Engineer')).toBe(true); // Assuming 'swe' is in canonical list
        });

        it('returns false for unrelated types', () => {
            expect(engine.isSubtype('Car', 'Engineer')).toBe(false);
            expect(engine.isSubtype('Doctor', 'Vehicle')).toBe(false);
        });

        it('returns false for reverse relationship (Parent IS A Child is false)', () => {
            expect(engine.isSubtype('Vehicle', 'Car')).toBe(false);
        });
    });

    describe('matchNotes with Hierarchy', () => {
        it('matches generic request with specific offer', () => {
            const request = {
                id: 'req1', title: 'Need Vehicle', content: '', tags: [],
                properties: [{ key: 'type', operator: 'is', values: ['Vehicle'] }],
                // ... boilerplate
                source: { type: 'user', identifier: 'u1', timestamp: 0 },
                public: true, priority: 1
            } as any;

            const offer = {
                id: 'off1', title: 'Selling Sedan', content: '', tags: [],
                properties: [{ key: 'type', operator: 'is', values: ['Sedan'] }],
                source: { type: 'user', identifier: 'u2', timestamp: 0 },
                public: true, priority: 1
            } as any;

            const result = engine.matchNotes(request, offer);
            expect(result.score).toBe(1.0);
            expect(result.satisfied).toHaveLength(1);
        });

        it('does NOT match specific request with generic offer', () => {
            // Need "Sedan", Offering "Vehicle" (could be a Truck) -> No Match
            // Strictness: A Sedan IS A Vehicle. A Vehicle IS NOT NECESSARILY A Sedan.

            const request = {
                id: 'req1', title: 'Need Sedan', content: '', tags: [],
                properties: [{ key: 'type', operator: 'is', values: ['Sedan'] }],
                source: { type: 'user', identifier: 'u1', timestamp: 0 },
                public: true, priority: 1
            } as any;

            const offer = {
                id: 'off1', title: 'Selling Vehicle', content: '', tags: [],
                properties: [{ key: 'type', operator: 'is', values: ['Vehicle'] }],
                source: { type: 'user', identifier: 'u2', timestamp: 0 },
                public: true, priority: 1
            } as any;

            const result = engine.matchNotes(request, offer);
            expect(result.score).toBe(0.0);
        });
    });
});
