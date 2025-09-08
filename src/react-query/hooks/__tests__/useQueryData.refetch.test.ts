import {QueryClient, useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {renderHook} from '@testing-library/react';

import {idle} from '../../../core';
import type {AnyInfiniteQueryDataSource} from '../../impl/infinite/types';
import type {AnyPlainQueryDataSource} from '../../impl/plain/types';
import {warnDisabledRefetch} from '../../utils/warnDisabledRefetch';
import {useQueryContext} from '../useQueryContext';
import {useQueryData} from '../useQueryData';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
    useInfiniteQuery: jest.fn(),
}));

jest.mock('../useQueryContext');
jest.mock('../../utils/warnDisabledRefetch');

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<typeof useInfiniteQuery>;
const mockWarnDisabledRefetch = warnDisabledRefetch as jest.MockedFunction<
    typeof warnDisabledRefetch
>;

describe('useQueryData refetch behavior', () => {
    const mockQueryClient = new QueryClient();
    const mockContext = {queryClient: mockQueryClient};

    beforeEach(() => {
        jest.clearAllMocks();
        (useQueryContext as jest.Mock).mockReturnValue(mockContext);
    });

    const createMockQueryResult = (refetch = jest.fn()) => ({
        data: 'test-data',
        error: null,
        status: 'success' as const,
        fetchStatus: 'idle' as const,
        isLoading: false,
        isError: false,
        isSuccess: true,
        isPending: false,
        refetch,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isInitialLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        promise: Promise.resolve('test-data'),
    });

    const createMockInfiniteResult = (refetch = jest.fn()) => ({
        data: {pages: [['item1'], ['item2']], pageParams: [undefined, 'next-page']},
        error: null,
        status: 'success' as const,
        fetchStatus: 'idle' as const,
        isLoading: false,
        isError: false,
        isSuccess: true,
        isPending: false,
        refetch,
        hasNextPage: false,
        hasPreviousPage: false,
        fetchNextPage: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetchingNextPage: false,
        isFetchingPreviousPage: false,
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: 0,
        failureCount: 0,
        failureReason: null,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isInitialLoading: false,
        isLoadingError: false,
        isPaused: false,
        isPlaceholderData: false,
        isPreviousData: false,
        isRefetchError: false,
        isRefetching: false,
        isStale: false,
        promise: Promise.resolve({
            pages: [['item1'], ['item2']],
            pageParams: [undefined, 'next-page'],
        }),
    });

    describe('plain data source', () => {
        const plainDataSource: AnyPlainQueryDataSource = {
            type: 'plain',
            name: 'test-plain',
            fetch: jest.fn().mockResolvedValue({data: 'test-data'}),
        };

        it('should use original refetch when no enabled option', () => {
            const originalRefetch = jest.fn();
            mockUseQuery.mockReturnValue(createMockQueryResult(originalRefetch) as any);

            const {result} = renderHook(() => useQueryData(plainDataSource, {id: 1}));

            expect(result.current.refetch).toBe(originalRefetch);
            expect(result.current.refetch).not.toBe(mockWarnDisabledRefetch);
        });

        it('should use warnDisabledRefetch when enabled: false', () => {
            const originalRefetch = jest.fn();
            mockUseQuery.mockReturnValue(createMockQueryResult(originalRefetch) as any);

            const {result} = renderHook(() =>
                useQueryData(plainDataSource, {id: 1}, {enabled: false}),
            );

            expect(result.current.refetch).toBe(mockWarnDisabledRefetch);
            expect(result.current.refetch).not.toBe(originalRefetch);
        });

        it('should use warnDisabledRefetch when params is idle', () => {
            const originalRefetch = jest.fn();
            mockUseQuery.mockReturnValue(createMockQueryResult(originalRefetch) as any);

            const {result} = renderHook(() => useQueryData(plainDataSource, idle));

            expect(result.current.refetch).toBe(mockWarnDisabledRefetch);
            expect(result.current.refetch).not.toBe(originalRefetch);
        });
    });

    describe('infinite data source', () => {
        const infiniteDataSource: AnyInfiniteQueryDataSource = {
            type: 'infinite',
            name: 'test-infinite',
            fetch: jest.fn().mockResolvedValue({data: ['item1', 'item2']}),
            next: jest.fn(),
        };

        it('should use original refetch when no enabled option', () => {
            const originalRefetch = jest.fn();
            mockUseInfiniteQuery.mockReturnValue(createMockInfiniteResult(originalRefetch) as any);

            const {result} = renderHook(() => useQueryData(infiniteDataSource, {id: 1}));

            expect(result.current.refetch).toBe(originalRefetch);
            expect(result.current.refetch).not.toBe(mockWarnDisabledRefetch);
        });

        it('should use warnDisabledRefetch when enabled: false', () => {
            const originalRefetch = jest.fn();
            mockUseInfiniteQuery.mockReturnValue(createMockInfiniteResult(originalRefetch) as any);

            const {result} = renderHook(() =>
                useQueryData(infiniteDataSource, {id: 1}, {enabled: false}),
            );

            expect(result.current.refetch).toBe(mockWarnDisabledRefetch);
            expect(result.current.refetch).not.toBe(originalRefetch);
        });

        it('should use warnDisabledRefetch when params is idle', () => {
            const originalRefetch = jest.fn();
            mockUseInfiniteQuery.mockReturnValue(createMockInfiniteResult(originalRefetch) as any);

            const {result} = renderHook(() => useQueryData(infiniteDataSource, idle));

            expect(result.current.refetch).toBe(mockWarnDisabledRefetch);
            expect(result.current.refetch).not.toBe(originalRefetch);
        });
    });
});
