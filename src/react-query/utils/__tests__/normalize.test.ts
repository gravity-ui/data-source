import {shouldNormalize, shouldUpdateOptimistically} from '../normalize';

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
    });

    describe('shouldUpdateOptimistically', () => {
        it('should return providerConfig if mutationConfig is undefined', () => {
            expect(shouldUpdateOptimistically(true, undefined)).toBe(true);
            expect(shouldUpdateOptimistically(false, undefined)).toBe(false);
        });

        it('should return mutationConfig if defined', () => {
            expect(shouldUpdateOptimistically(true, false)).toBe(false);
            expect(shouldUpdateOptimistically(false, true)).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('shouldNormalize should work with boolean false (not falsy)', () => {
            // false is a valid value, should not fallback to provider
            expect(shouldNormalize(true, false)).toBe(false);
        });

        it('shouldUpdateOptimistically should work with boolean false', () => {
            expect(shouldUpdateOptimistically(true, false)).toBe(false);
        });
    });
});
