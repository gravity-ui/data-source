import type {Query} from '@tanstack/react-query';

import {getProgressiveRefetch} from '../getProgressiveRefetch';

describe('getProgressiveRefetch', () => {
    it('should return a function', () => {
        const refetchFn = getProgressiveRefetch({
            minInterval: 1000,
            maxInterval: 10000,
        });

        expect(refetchFn).toEqual(expect.any(Function));
    });

    it('should return minInterval for the first call (count = 0)', () => {
        const minInterval = 1000;
        const maxInterval = 10000;
        const refetchFn = getProgressiveRefetch({
            minInterval,
            maxInterval,
        });

        const result = refetchFn({} as Query, 0);

        expect(result).toBe(minInterval);
    });

    it('should increase interval by multiplier for each count', () => {
        const minInterval = 1000;
        const maxInterval = 10000;
        const multiplier = 2;
        const refetchFn = getProgressiveRefetch({
            minInterval,
            maxInterval,
            multiplier,
        });

        expect(refetchFn({} as Query, 0)).toBe(1000);
        expect(refetchFn({} as Query, 1)).toBe(2000);
        expect(refetchFn({} as Query, 2)).toBe(4000);
        expect(refetchFn({} as Query, 3)).toBe(8000);
    });

    it('should not exceed maxInterval', () => {
        const minInterval = 1000;
        const maxInterval = 5000;
        const multiplier = 2;
        const refetchFn = getProgressiveRefetch({
            minInterval,
            maxInterval,
            multiplier,
        });

        expect(refetchFn({} as Query, 0)).toBe(1000);
        expect(refetchFn({} as Query, 1)).toBe(2000);
        expect(refetchFn({} as Query, 2)).toBe(4000);
        expect(refetchFn({} as Query, 3)).toBe(5000);
        expect(refetchFn({} as Query, 4)).toBe(5000);
    });

    it('should use default multiplier (2) if not provided', () => {
        const minInterval = 1000;
        const maxInterval = 10000;
        const refetchFn = getProgressiveRefetch({
            minInterval,
            maxInterval,
        });

        expect(refetchFn({} as Query, 0)).toBe(1000);
        expect(refetchFn({} as Query, 1)).toBe(2000);
        expect(refetchFn({} as Query, 2)).toBe(4000);
    });

    it('should work with custom multiplier', () => {
        const minInterval = 1000;
        const maxInterval = 10000;
        const multiplier = 1.5;
        const refetchFn = getProgressiveRefetch({
            minInterval,
            maxInterval,
            multiplier,
        });

        expect(refetchFn({} as Query, 0)).toBe(1000);
        expect(refetchFn({} as Query, 1)).toBe(1500);
        expect(refetchFn({} as Query, 2)).toBe(2250);
    });
});
