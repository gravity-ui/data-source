import React from 'react';

import {QueryClient, QueryClientProvider, useMutation, useQuery} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';

import type {DataSourceNormalizerConfig, OptimisticUpdateConfig} from '../../types/normalizer';
import {QueryNormalizerProvider, useQueryNormalizer} from '../QueryNormalizerProvider';

describe('QueryNormalizerProvider', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {retry: false},
                mutations: {retry: false},
            },
        });
    });

    afterEach(() => {
        queryClient.clear();
    });

    const createWrapper = (
        normalizerConfig?: DataSourceNormalizerConfig,
        optimisticUpdateConfig?: OptimisticUpdateConfig,
    ) => {
        const Wrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
            <QueryClientProvider client={queryClient}>
                <QueryNormalizerProvider
                    queryClient={queryClient}
                    normalizerConfig={normalizerConfig}
                    optimisticUpdateConfig={optimisticUpdateConfig}
                >
                    {children}
                </QueryNormalizerProvider>
            </QueryClientProvider>
        );
        Wrapper.displayName = 'TestWrapper';
        return Wrapper;
    };

    describe('Provider setup', () => {
        it('should provide queryNormalizer through context', () => {
            const wrapper = createWrapper({normalize: true});

            const {result} = renderHook(() => useQueryNormalizer(), {wrapper});

            expect(result.current).toBeDefined();
            expect(result.current.getNormalizedData).toBeDefined();
        });

        it('should throw error if used outside Provider', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            expect(() => {
                renderHook(() => useQueryNormalizer());
            }).toThrow('No QueryNormalizer set, use QueryNormalizerProvider to set one');

            consoleSpy.mockRestore();
        });

        it('should create normalizer with global configuration', () => {
            const getNormalizationObjectKey = jest.fn((obj) => obj.id);

            const wrapper = createWrapper({
                normalize: true,
                getNormalizationObjectKey,
            });

            renderHook(() => useQueryNormalizer(), {wrapper});

            // Normalizer should be created with passed function
            expect(getNormalizationObjectKey).toBeDefined();
        });
    });

    describe('React Query integration', () => {
        it('should normalize data from useQuery', async () => {
            const wrapper = createWrapper({normalize: true});

            const {result: normalizerResult} = renderHook(() => useQueryNormalizer(), {wrapper});

            const {result: queryResult} = renderHook(
                () =>
                    useQuery({
                        queryKey: ['users'],
                        queryFn: async () => [{id: '1', name: 'User 1'}],
                    }),
                {wrapper},
            );

            await waitFor(() => expect(queryResult.current.isSuccess).toBe(true));

            const normalized = normalizerResult.current.getNormalizedData();

            expect(normalized.objects['@@1']).toBeDefined();
            expect(normalized.objects['@@1'].name).toBe('User 1');
        });

        it('should update data on mutation', async () => {
            const wrapper = createWrapper({normalize: true});

            const {result: queryResult} = renderHook(
                () =>
                    useQuery({
                        queryKey: ['users'],
                        queryFn: async () => [{id: '1', name: 'User 1'}],
                    }),
                {wrapper},
            );

            await waitFor(() => expect(queryResult.current.isSuccess).toBe(true));

            // Mutation
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async (name: string) => ({
                            id: '1',
                            name,
                        }),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate('Updated User');

            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            // Query data should be updated
            await waitFor(() => {
                const data = queryClient.getQueryData(['users']) as any[];
                expect(data[0].name).toBe('Updated User');
            });
        });

        it('should work with multiple queries', async () => {
            const wrapper = createWrapper({normalize: true});

            // Two queries with the same object
            const {result: query1} = renderHook(
                () =>
                    useQuery({
                        queryKey: ['users'],
                        queryFn: async () => [{id: '1', name: 'User 1'}],
                    }),
                {wrapper},
            );

            const {result: query2} = renderHook(
                () =>
                    useQuery({
                        queryKey: ['user', '1'],
                        queryFn: async () => ({id: '1', name: 'User 1'}),
                    }),
                {wrapper},
            );

            await waitFor(() => expect(query1.current.isSuccess).toBe(true));
            await waitFor(() => expect(query2.current.isSuccess).toBe(true));

            // Mutation
            const {result: mutation} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => ({
                            id: '1',
                            name: 'Updated User',
                        }),
                    }),
                {wrapper},
            );

            mutation.current.mutate();

            await waitFor(() => expect(mutation.current.isSuccess).toBe(true));

            // Both queries should be updated
            await waitFor(() => {
                const users = queryClient.getQueryData(['users']) as any[];
                const user = queryClient.getQueryData(['user', '1']) as any;

                expect(users[0].name).toBe('Updated User');
                expect(user.name).toBe('Updated User');
            });
        });
    });

    describe('Optimistic updates via Provider', () => {
        it('should apply optimistic updates', async () => {
            const wrapper = createWrapper(
                {normalize: true},
                {
                    enabled: true,
                    autoCalculateRollback: true,
                },
            );

            // Initial data
            const {result: queryResult} = renderHook(
                () =>
                    useQuery({
                        queryKey: ['users'],
                        queryFn: async () => [{id: '1', name: 'Original'}],
                    }),
                {wrapper},
            );

            await waitFor(() => expect(queryResult.current.isSuccess).toBe(true));

            // Mutation with optimistic data
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 100));
                            return {id: '1', name: 'Final'};
                        },
                        onMutate: () => ({
                            optimisticData: {id: '1', name: 'Optimistic'},
                        }),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate();

            // Should have optimistic data immediately
            await waitFor(() => {
                const data = queryClient.getQueryData(['users']) as any[];
                expect(data[0].name).toBe('Optimistic');
            });

            // After completion - final data
            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            await waitFor(() => {
                const data = queryClient.getQueryData(['users']) as any[];
                expect(data[0].name).toBe('Final');
            });
        });

        it('should rollback changes on error', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const wrapper = createWrapper(
                {normalize: true},
                {
                    enabled: true,
                    autoCalculateRollback: true,
                    devLogging: true,
                },
            );

            // Initial data
            const {result: queryResult} = renderHook(
                () =>
                    useQuery({
                        queryKey: ['users'],
                        queryFn: async () => [{id: '1', name: 'Original'}],
                    }),
                {wrapper},
            );

            await waitFor(() => expect(queryResult.current.isSuccess).toBe(true));

            // Mutation that will fail
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 50));
                            throw new Error('Failed');
                        },
                        onMutate: () => ({
                            optimisticData: {id: '1', name: 'Optimistic'},
                        }),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate();

            // Should have optimistic data
            await waitFor(() => {
                const data = queryClient.getQueryData(['users']) as any[];
                expect(data[0].name).toBe('Optimistic');
            });

            // After error - rollback
            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            await waitFor(() => {
                const data = queryClient.getQueryData(['users']) as any[];
                expect(data[0].name).toBe('Original');
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Cleanup', () => {
        it('should unsubscribe on unmount', () => {
            const wrapper = createWrapper({normalize: true});

            const {result, unmount} = renderHook(() => useQueryNormalizer(), {wrapper});

            expect(result.current).toBeDefined();

            // Should not throw errors on unmount
            expect(() => unmount()).not.toThrow();
        });

        it('should clear data on unmount', async () => {
            const wrapper = createWrapper({normalize: true});

            const {result: normalizerResult} = renderHook(() => useQueryNormalizer(), {wrapper});

            // Add data
            await queryClient.fetchQuery({
                queryKey: ['users'],
                queryFn: async () => [{id: '1', name: 'User 1'}],
            });

            const normalizedBefore = normalizerResult.current.getNormalizedData();
            expect(Object.keys(normalizedBefore.objects)).toHaveLength(1);
        });
    });

    describe('Default configuration', () => {
        it('should work with empty configuration', () => {
            const wrapper = createWrapper();

            const {result} = renderHook(() => useQueryNormalizer(), {wrapper});

            expect(result.current).toBeDefined();
        });

        it('normalization should be disabled by default', async () => {
            const wrapper = createWrapper(); // normalize not specified

            const {result: normalizerResult} = renderHook(() => useQueryNormalizer(), {wrapper});

            await queryClient.fetchQuery({
                queryKey: ['users'],
                queryFn: async () => [{id: '1', name: 'User 1'}],
            });

            const normalized = normalizerResult.current.getNormalizedData();

            // Data should not be normalized
            expect(Object.keys(normalized.objects)).toHaveLength(0);
        });
    });
});
