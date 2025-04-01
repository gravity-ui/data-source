import {act, renderHook} from '@testing-library/react';

import {useRefetchErrored} from '../useRefetchErrored';

describe('useRefetchErrored', () => {
    it('should return a function that calls refetch only on states with errors', () => {
        const refetch1 = jest.fn();
        const refetch2 = jest.fn();
        const refetch3 = jest.fn();

        const states = [
            {error: {message: 'Error 1'}, refetch: refetch1},
            {error: null, refetch: refetch2},
            {error: {message: 'Error 3'}, refetch: refetch3},
        ];

        const {result} = renderHook(() => useRefetchErrored(states));

        expect(result.current).toEqual(expect.any(Function));

        act(() => {
            result.current();
        });

        expect(refetch1).toHaveBeenCalledTimes(1);
        expect(refetch2).toHaveBeenCalledTimes(0);
        expect(refetch3).toHaveBeenCalledTimes(1);
    });

    it('should not call refetch if no states have errors', () => {
        const refetch1 = jest.fn();
        const refetch2 = jest.fn();

        const states = [
            {error: null, refetch: refetch1},
            {error: null, refetch: refetch2},
        ];

        const {result} = renderHook(() => useRefetchErrored(states));

        act(() => {
            result.current();
        });

        expect(refetch1).not.toHaveBeenCalled();
        expect(refetch2).not.toHaveBeenCalled();
    });

    it('should handle empty states array', () => {
        const {result} = renderHook(() => useRefetchErrored([]));

        act(() => {
            result.current();
        });
    });

    it('should memoize the refetch function when dependencies do not change', () => {
        const refetch1 = jest.fn();
        const refetch2 = jest.fn();

        const states = [
            {error: {message: 'Error 1'}, refetch: refetch1},
            {error: null, refetch: refetch2},
        ];

        const {result, rerender} = renderHook(() => useRefetchErrored(states));

        const firstRefetchErrored = result.current;

        rerender();

        expect(result.current).toBe(firstRefetchErrored);
    });

    it('should create a new refetch function when dependencies change', () => {
        const refetch1 = jest.fn();
        const refetch2 = jest.fn();

        let states = [
            {error: {message: 'Error 1'}, refetch: refetch1},
            {error: null, refetch: refetch2},
        ];

        const {result, rerender} = renderHook(() => useRefetchErrored(states));

        const firstRefetchErrored = result.current;

        states = [
            {error: {message: 'New Error 1'}, refetch: refetch1},
            {error: null, refetch: refetch2},
        ];

        rerender();

        expect(result.current).not.toBe(firstRefetchErrored);
    });
});
