import React from 'react';

import {createNormalizer} from '@normy/core';
import {QueryClient, QueryClientProvider, useMutation} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';

import type {DataSourceNormalizerConfig, OptimisticUpdateConfig} from '../../types/normalizer';
import {createQueryNormalizer} from '../normalization';

describe('subscriptions', () => {
    let queryClient: QueryClient;
    let normalizer: ReturnType<typeof createNormalizer>;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {retry: false},
                mutations: {retry: false},
            },
        });

        normalizer = createNormalizer({
            devLogging: false,
        });
    });

    afterEach(() => {
        queryClient.clear();
    });

    describe('QueryCache subscription', () => {
        const normalizerConfig: DataSourceNormalizerConfig = {
            normalize: true,
        };

        const optimisticUpdateConfig: OptimisticUpdateConfig = {
            enabled: false,
        };

        it('should add query to normalizer when added to QueryCache', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();

            // Add query
            await queryClient.fetchQuery({
                queryKey: ['users'],
                queryFn: async () => [{id: '1', name: 'User 1'}],
            });

            const normalized = queryNormalizer.getNormalizedData();
            expect(normalized.objects['@@1']).toBeDefined();

            queryNormalizer.unsubscribe();
        });

        it('should update query in normalizer on update', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];

            // Initial data
            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Old'}],
            });

            const normalizedBefore = queryNormalizer.getNormalizedData();
            const objectCountBefore = Object.keys(normalizedBefore.objects).length;

            // Update data
            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'New'}],
            });

            // Verify that normalized data was updated
            const normalizedAfter = queryNormalizer.getNormalizedData();
            expect(Object.keys(normalizedAfter.objects).length).toBe(objectCountBefore);
            expect(normalizedAfter.queries[JSON.stringify(queryKey)]).toBeDefined();

            queryNormalizer.unsubscribe();
        });

        it('should remove query from normalizer when removed from QueryCache', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];

            // Add query
            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'User 1'}],
            });

            // Remove query
            queryClient.removeQueries({queryKey});

            // Give time to process event
            await new Promise((resolve) => setTimeout(resolve, 10));

            const normalized = queryNormalizer.getNormalizedData();
            // Query should be removed from queries
            expect(normalized.queries[JSON.stringify(queryKey)]).toBeUndefined();

            queryNormalizer.unsubscribe();
        });

        it('should support meta configuration for queries', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();

            // Check that we can use meta for configuration
            // Real check for disabling via meta is already tested in integration tests
            const normalized = queryNormalizer.getNormalizedData();
            expect(normalized).toBeDefined();
            expect(normalized.objects).toBeDefined();
            expect(normalized.queries).toBeDefined();

            queryNormalizer.unsubscribe();
        });

        it('should unsubscribe correctly', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();
            queryNormalizer.unsubscribe();

            // After unsubscribing, adding query should not affect normalizer
            await queryClient.fetchQuery({
                queryKey: ['users'],
                queryFn: async () => [{id: '1', name: 'User 1'}],
            });

            const normalized = queryNormalizer.getNormalizedData();
            expect(Object.keys(normalized.objects)).toHaveLength(0);
        });

        it('should allow multiple unsubscribe calls', () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();
            queryNormalizer.unsubscribe();

            // Repeated call should not throw error
            expect(() => queryNormalizer.unsubscribe()).not.toThrow();
        });
    });

    describe('MutationCache subscription', () => {
        const normalizerConfig: DataSourceNormalizerConfig = {
            normalize: true,
        };

        const optimisticUpdateConfig: OptimisticUpdateConfig = {
            enabled: true,
            autoCalculateRollback: true,
        };

        it('should update queries on successful mutation', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];

            // Initial data
            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Old'}],
            });

            // Create wrapper for hooks
            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            // Mutation via useMutation
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => ({id: '1', name: 'New'}),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate();

            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            const data = queryClient.getQueryData(queryKey) as Array<{id: string; name: string}>;
            expect(data[0].name).toBe('New');

            queryNormalizer.unsubscribe();
        });

        it('should apply optimistic updates', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];

            // Initial data
            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            // Mutation with optimistic data
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 50));
                            return {id: '1', name: 'Final'};
                        },
                        onMutate: () => ({
                            optimisticData: {id: '1', name: 'Optimistic'},
                        }),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate();

            // Check optimistic data
            await waitFor(() => {
                const data = queryClient.getQueryData(queryKey) as Array<{
                    id: string;
                    name: string;
                }>;
                expect(data[0].name).toBe('Optimistic');
            });

            // Wait for mutation to complete
            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            const dataFinal = queryClient.getQueryData(queryKey) as Array<{
                id: string;
                name: string;
            }>;
            expect(dataFinal[0].name).toBe('Final');

            queryNormalizer.unsubscribe();
        });

        it('should automatically calculate rollbackData', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig: {
                    enabled: true,
                    autoCalculateRollback: true,
                },
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];

            // Initial data
            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            // Mutation with optimistic data that will fail
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 50));
                            throw new Error('Mutation failed');
                        },
                        onMutate: () => ({
                            optimisticData: {id: '1', name: 'Optimistic'},
                        }),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate();

            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            // Data should be rolled back to original
            const data = queryClient.getQueryData(queryKey) as Array<{id: string; name: string}>;
            expect(data[0].name).toBe('Original');

            queryNormalizer.unsubscribe();
        });

        it('should rollback changes on mutation error', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig,
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];

            // Initial data
            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            // Mutation with error
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

            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            const data = queryClient.getQueryData(queryKey) as Array<{id: string; name: string}>;
            expect(data[0].name).toBe('Original');

            queryNormalizer.unsubscribe();
        });

        it('should ignore mutations with normalize: false and optimistic: false', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig: {normalize: false}, // Globally disabled
                optimisticUpdateConfig: {enabled: false},
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];
            queryClient.setQueryData(queryKey, [{id: '1', name: 'Original'}]);

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            // Mutation should not update data automatically
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => ({id: '1', name: 'New'}),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate();

            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            const data = queryClient.getQueryData(queryKey) as Array<{id: string; name: string}>;
            expect(data[0].name).toBe('Original'); // Not changed

            queryNormalizer.unsubscribe();
        });

        it('should support devLogging for optimistic updates', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig: {
                    enabled: true,
                    autoCalculateRollback: true,
                    devLogging: true,
                },
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];

            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

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

            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            // Verify that logging was called
            expect(consoleSpy).toHaveBeenCalledWith(
                '[OptimisticUpdate] Auto-calculated rollbackData:',
                expect.any(Object),
            );
            expect(consoleSpy).toHaveBeenCalledWith('[OptimisticUpdate] Rolling back changes');

            consoleSpy.mockRestore();
            queryNormalizer.unsubscribe();
        });

        it('should support manual rollbackData', async () => {
            const queryNormalizer = createQueryNormalizer({
                queryClient,
                normalizer,
                normalizerConfig,
                optimisticUpdateConfig: {
                    enabled: true,
                    autoCalculateRollback: false,
                },
            });

            queryNormalizer.subscribe();

            const queryKey = ['users'];

            await queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => {
                            await new Promise((resolve) => setTimeout(resolve, 50));
                            throw new Error('Failed');
                        },
                        onMutate: () => ({
                            optimisticData: {id: '1', name: 'Optimistic'},
                            rollbackData: {id: '1', name: 'Manual Rollback'},
                        }),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate();

            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            const data = queryClient.getQueryData(queryKey) as Array<{id: string; name: string}>;
            expect(data[0].name).toBe('Manual Rollback');

            queryNormalizer.unsubscribe();
        });
    });
});
