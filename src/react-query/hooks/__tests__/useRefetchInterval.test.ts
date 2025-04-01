import {type Query, skipToken} from '@tanstack/react-query';
import {renderHook} from '@testing-library/react';

import {useRefetchInterval} from '../useRefetchInterval';

describe('useRefetchInterval', () => {
    it('should return undefined when no refetchInterval is provided', () => {
        const {result} = renderHook(() => useRefetchInterval());

        expect(result.current.refetchInterval).toBeUndefined();
        expect(result.current.queryFn).toBeUndefined();
    });

    it('should return the provided refetchInterval when it is a number', () => {
        const interval = 5000;
        const {result} = renderHook(() => useRefetchInterval(interval));

        expect(result.current.refetchInterval).toBe(interval);
    });

    it('should return the provided refetchInterval when it is false', () => {
        const interval = false;
        const {result} = renderHook(() => useRefetchInterval(interval));

        expect(result.current.refetchInterval).toBe(interval);
    });

    it('should wrap the provided refetchInterval function', () => {
        const mockQuery = {
            state: {
                data: {value: 42},
                status: 'success',
            },
        } as Query;

        const refetchInterval = jest.fn((_query, count) => {
            return count > 3 ? false : 1000;
        });

        const {result} = renderHook(() => useRefetchInterval(refetchInterval));

        expect(result.current.refetchInterval).toEqual(expect.any(Function));

        const resultInterval = (result.current.refetchInterval as Function)(mockQuery);

        expect(refetchInterval).toHaveBeenCalledWith(mockQuery, 0);
        expect(resultInterval).toBe(1000);
    });

    it('should wrap the provided queryFn and increment count on each call', () => {
        const mockContext = {};
        const mockQuery = {
            state: {
                data: {value: 42},
                status: 'success',
            },
        } as Query;

        const queryFn = jest.fn().mockResolvedValue({value: 42});
        const refetchInterval = jest.fn((_query, count) => {
            return count > 3 ? false : 1000;
        });

        const {result} = renderHook(() => useRefetchInterval(refetchInterval, queryFn));

        expect(result.current.queryFn).toEqual(expect.any(Function));
        expect(result.current.refetchInterval).toEqual(expect.any(Function));

        (result.current.queryFn as Function)(mockContext);
        (result.current.refetchInterval as Function)(mockQuery);
        (result.current.queryFn as Function)(mockContext);
        (result.current.refetchInterval as Function)(mockQuery);
        (result.current.queryFn as Function)(mockContext);
        (result.current.refetchInterval as Function)(mockQuery);
        (result.current.queryFn as Function)(mockContext);
        (result.current.refetchInterval as Function)(mockQuery);

        expect(queryFn.mock.calls).toEqual([
            [mockContext],
            [mockContext],
            [mockContext],
            [mockContext],
        ]);
        expect(refetchInterval.mock.calls).toEqual([
            [mockQuery, 1],
            [mockQuery, 2],
            [mockQuery, 3],
            [mockQuery, 4],
        ]);
        expect(refetchInterval.mock.results).toEqual([
            {type: 'return', value: 1000},
            {type: 'return', value: 1000},
            {type: 'return', value: 1000},
            {type: 'return', value: false},
        ]);
    });

    it('should return the provided queryFn when it is not a function', () => {
        const {result} = renderHook(() => useRefetchInterval(undefined, skipToken));

        expect(result.current.queryFn).toBe(skipToken);
    });

    it('should memoize the wrapped functions', () => {
        const refetchInterval = jest.fn(() => 1000);
        const queryFn = jest.fn().mockResolvedValue({value: 42});

        const {result, rerender} = renderHook(() => useRefetchInterval(refetchInterval, queryFn));

        const firstRefetchInterval = result.current.refetchInterval;
        const firstQueryFn = result.current.queryFn;

        rerender();

        expect(result.current.refetchInterval).toBe(firstRefetchInterval);
        expect(result.current.queryFn).toBe(firstQueryFn);
    });

    it('should create new functions when dependencies change', () => {
        const refetchInterval1 = jest.fn(() => 1000);
        const queryFn1 = jest.fn().mockResolvedValue({value: 42});

        const {result, rerender} = renderHook(
            (props) => useRefetchInterval(props.refetchInterval, props.queryFn),
            {
                initialProps: {
                    refetchInterval: refetchInterval1,
                    queryFn: queryFn1,
                },
            },
        );

        const firstRefetchInterval = result.current.refetchInterval;
        const firstQueryFn = result.current.queryFn;

        const refetchInterval2 = jest.fn(() => 2000);
        const queryFn2 = jest.fn().mockResolvedValue({value: 100});

        rerender({
            refetchInterval: refetchInterval2,
            queryFn: queryFn2,
        });

        expect(result.current.refetchInterval).not.toBe(firstRefetchInterval);
        expect(result.current.queryFn).not.toBe(firstQueryFn);
    });
});
