import {act, renderHook} from '@testing-library/react';

import {useRefetchAll} from '../useRefetchAll';

describe('useRefetchAll', () => {
    it('should return a function that calls refetch on all states', () => {
        const refetch1 = jest.fn();
        const refetch2 = jest.fn();
        const refetch3 = jest.fn();

        const states = [{refetch: refetch1}, {refetch: refetch2}, {refetch: refetch3}];

        const {result} = renderHook(() => useRefetchAll(states));

        expect(result.current).toEqual(expect.any(Function));

        act(() => {
            result.current();
        });

        expect(refetch1).toHaveBeenCalledTimes(1);
        expect(refetch2).toHaveBeenCalledTimes(1);
        expect(refetch3).toHaveBeenCalledTimes(1);
    });

    it('should handle empty states array', () => {
        const {result} = renderHook(() => useRefetchAll([]));

        act(() => {
            result.current();
        });
    });

    it('should memoize the refetch function when dependencies do not change', () => {
        const refetch1 = jest.fn();
        const refetch2 = jest.fn();

        const states = [{refetch: refetch1}, {refetch: refetch2}];

        const {result, rerender} = renderHook(() => useRefetchAll(states));

        const firstRefetchAll = result.current;

        rerender();

        expect(result.current).toBe(firstRefetchAll);
    });

    it('should create a new refetch function when dependencies change', () => {
        const refetch1 = jest.fn();
        const refetch2 = jest.fn();
        const refetch3 = jest.fn();

        let states = [{refetch: refetch1}, {refetch: refetch2}];

        const {result, rerender} = renderHook(() => useRefetchAll(states));

        const firstRefetchAll = result.current;

        states = [{refetch: refetch1}, {refetch: refetch3}];

        rerender();

        expect(result.current).not.toBe(firstRefetchAll);
    });
});
