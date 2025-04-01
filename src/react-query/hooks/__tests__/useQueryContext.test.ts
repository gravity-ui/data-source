import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {renderHook} from '@testing-library/react';

import {useQueryContext} from '../useQueryContext';

jest.mock('@tanstack/react-query', () => {
    const originalModule = jest.requireActual('@tanstack/react-query');
    return {
        ...originalModule,
        useQueryClient: jest.fn(),
    };
});

describe('useQueryContext', () => {
    const mockQueryClient = new QueryClient();

    beforeEach(() => {
        jest.clearAllMocks();

        (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    });

    it('should return context with queryClient', () => {
        const {result} = renderHook(() => useQueryContext());

        expect(result.current).toEqual({queryClient: mockQueryClient});
    });

    it('should memoize the context', () => {
        const {result, rerender} = renderHook(() => useQueryContext());

        const firstResult = result.current;

        rerender();

        expect(result.current).toBe(firstResult);
    });

    it('should update context when queryClient changes', () => {
        const {result, rerender} = renderHook(() => useQueryContext());

        const firstResult = result.current;

        const newMockQueryClient = new QueryClient();

        (useQueryClient as jest.Mock).mockReturnValue(newMockQueryClient);

        rerender();

        expect(result.current).not.toBe(firstResult);
        expect(result.current).toEqual({queryClient: newMockQueryClient});
    });
});
