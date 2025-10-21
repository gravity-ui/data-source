import {shouldNormalize, shouldOptimisticallyUpdate} from '../normalize';

describe('normalize utils', () => {
    describe('shouldNormalize', () => {
        it('should return providerConfig if queryConfig is undefined', () => {
            expect(shouldNormalize(true, undefined)).toBe(true);
            expect(shouldNormalize(false, undefined)).toBe(false);
        });

        it('should return queryConfig if defined', () => {
            expect(shouldNormalize(true, false)).toBe(false);
            expect(shouldNormalize(false, true)).toBe(true);
        });

        it('queryConfig should have priority over providerConfig', () => {
            // Provider: true, Query: false → false
            expect(shouldNormalize(true, false)).toBe(false);

            // Provider: false, Query: true → true
            expect(shouldNormalize(false, true)).toBe(true);
        });

        it('should work with various combinations', () => {
            // Both true
            expect(shouldNormalize(true, true)).toBe(true);

            // Both false
            expect(shouldNormalize(false, false)).toBe(false);

            // Provider true, query false
            expect(shouldNormalize(true, false)).toBe(false);

            // Provider false, query true
            expect(shouldNormalize(false, true)).toBe(true);

            // Provider true, query undefined
            expect(shouldNormalize(true, undefined)).toBe(true);

            // Provider false, query undefined
            expect(shouldNormalize(false, undefined)).toBe(false);
        });
    });

    describe('shouldOptimisticallyUpdate', () => {
        it('should return providerConfig if mutationConfig is undefined', () => {
            expect(shouldOptimisticallyUpdate(true, undefined)).toBe(true);
            expect(shouldOptimisticallyUpdate(false, undefined)).toBe(false);
        });

        it('should return mutationConfig if defined', () => {
            expect(shouldOptimisticallyUpdate(true, false)).toBe(false);
            expect(shouldOptimisticallyUpdate(false, true)).toBe(true);
        });

        it('mutationConfig should have priority over providerConfig', () => {
            // Provider: true, Mutation: false → false
            expect(shouldOptimisticallyUpdate(true, false)).toBe(false);

            // Provider: false, Mutation: true → true
            expect(shouldOptimisticallyUpdate(false, true)).toBe(true);
        });

        it('should work with various combinations', () => {
            // Both true
            expect(shouldOptimisticallyUpdate(true, true)).toBe(true);

            // Both false
            expect(shouldOptimisticallyUpdate(false, false)).toBe(false);

            // Provider true, mutation false
            expect(shouldOptimisticallyUpdate(true, false)).toBe(false);

            // Provider false, mutation true
            expect(shouldOptimisticallyUpdate(false, true)).toBe(true);

            // Provider true, mutation undefined
            expect(shouldOptimisticallyUpdate(true, undefined)).toBe(true);

            // Provider false, mutation undefined
            expect(shouldOptimisticallyUpdate(false, undefined)).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('shouldNormalize should work with boolean false (not falsy)', () => {
            // false is a valid value, should not fallback to provider
            expect(shouldNormalize(true, false)).toBe(false);
        });

        it('shouldOptimisticallyUpdate should work with boolean false', () => {
            expect(shouldOptimisticallyUpdate(true, false)).toBe(false);
        });
    });
});
