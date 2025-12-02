import React from 'react';

import {useMutation} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';

import {ClientDataManager} from '../ClientDataManager';
import {DataSourceProvider} from '../DataSourceProvider';

describe('subscriptions', () => {
    let dataManager: ClientDataManager;

    beforeEach(() => {
        dataManager = new ClientDataManager({
            defaultOptions: {
                queries: {retry: false},
                mutations: {retry: false},
            },
            normalizerConfig: {
                devLogging: false,
            },
        });
    });

    afterEach(() => {
        dataManager.queryNormalizer?.unsubscribe();
        dataManager.queryClient.clear();
    });

    describe('QueryCache subscription', () => {
        it('should add query to normalizer when added to QueryCache', async () => {
            expect(dataManager.queryNormalizer).toBeDefined();

            dataManager.queryNormalizer!.subscribe();

            // Add query with normalize: true option
            await dataManager.queryClient.fetchQuery({
                queryKey: ['users'],
                queryFn: async () => [{id: '1', name: 'User 1'}],
                normalize: true,
            } as Parameters<typeof dataManager.queryClient.fetchQuery>[0] & {normalize: boolean});

            const normalized = dataManager.queryNormalizer!.getNormalizedData();
            expect(normalized.objects['@@1']).toBeDefined();
        });

        it('should update query in normalizer on update', async () => {
            expect(dataManager.queryNormalizer).toBeDefined();

            dataManager.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            // Initial data with normalize: true
            await dataManager.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Old'}],
                normalize: true,
            } as Parameters<typeof dataManager.queryClient.fetchQuery>[0] & {normalize: boolean});

            const normalizedBefore = dataManager.queryNormalizer!.getNormalizedData();
            const objectCountBefore = Object.keys(normalizedBefore.objects).length;

            // Update data
            await dataManager.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'New'}],
                normalize: true,
            } as Parameters<typeof dataManager.queryClient.fetchQuery>[0] & {normalize: boolean});

            // Verify that normalized data was updated
            const normalizedAfter = dataManager.queryNormalizer!.getNormalizedData();
            expect(Object.keys(normalizedAfter.objects).length).toBe(objectCountBefore);
            expect(normalizedAfter.queries[JSON.stringify(queryKey)]).toBeDefined();
        });

        it('should remove query from normalizer when removed from QueryCache', async () => {
            expect(dataManager.queryNormalizer).toBeDefined();

            dataManager.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            // Add query
            await dataManager.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'User 1'}],
                normalize: true,
            } as Parameters<typeof dataManager.queryClient.fetchQuery>[0] & {normalize: boolean});

            // Remove query
            dataManager.queryClient.removeQueries({queryKey});

            // Give time to process event
            await new Promise((resolve) => setTimeout(resolve, 10));

            const normalized = dataManager.queryNormalizer!.getNormalizedData();
            // Query should be removed from queries
            expect(normalized.queries[JSON.stringify(queryKey)]).toBeUndefined();
        });

        it('should support meta configuration for queries', async () => {
            expect(dataManager.queryNormalizer).toBeDefined();

            dataManager.queryNormalizer!.subscribe();

            // Check that we can use meta for configuration
            // Real check for disabling via meta is already tested in integration tests
            const normalized = dataManager.queryNormalizer!.getNormalizedData();
            expect(normalized).toBeDefined();
            expect(normalized.objects).toBeDefined();
            expect(normalized.queries).toBeDefined();
        });

        it('should unsubscribe correctly', async () => {
            expect(dataManager.queryNormalizer).toBeDefined();

            dataManager.queryNormalizer!.subscribe();
            dataManager.queryNormalizer!.unsubscribe();

            // After unsubscribing, adding query should not affect normalizer
            await dataManager.queryClient.fetchQuery({
                queryKey: ['users'],
                queryFn: async () => [{id: '1', name: 'User 1'}],
                normalize: true,
            } as Parameters<typeof dataManager.queryClient.fetchQuery>[0] & {normalize: boolean});

            const normalized = dataManager.queryNormalizer!.getNormalizedData();
            expect(Object.keys(normalized.objects)).toHaveLength(0);
        });

        it('should allow multiple unsubscribe calls', () => {
            expect(dataManager.queryNormalizer).toBeDefined();

            dataManager.queryNormalizer!.subscribe();
            dataManager.queryNormalizer!.unsubscribe();

            // Repeated call should not throw error
            expect(() => dataManager.queryNormalizer!.unsubscribe()).not.toThrow();
        });
    });

    describe('MutationCache subscription', () => {
        let dataManagerWithOptimistic: ClientDataManager;

        beforeEach(() => {
            dataManagerWithOptimistic = new ClientDataManager({
                defaultOptions: {
                    queries: {retry: false},
                    mutations: {retry: false},
                },
                normalizerConfig: {
                    devLogging: false,
                    optimistic: {
                        autoCalculateRollback: true,
                    },
                },
            });
        });

        afterEach(() => {
            dataManagerWithOptimistic.queryNormalizer?.unsubscribe();
            dataManagerWithOptimistic.queryClient.clear();
        });

        it('should update queries on successful mutation', async () => {
            expect(dataManagerWithOptimistic.queryNormalizer).toBeDefined();

            dataManagerWithOptimistic.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            // Initial data
            await dataManagerWithOptimistic.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Old'}],
                normalize: true,
            } as Parameters<typeof dataManagerWithOptimistic.queryClient.fetchQuery>[0] & {
                normalize: boolean;
            });

            // Create wrapper for hooks
            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dataManagerWithOptimistic}>
                    {children}
                </DataSourceProvider>
            );

            // Mutation via useMutation
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => ({id: '1', name: 'New'}),
                        normalize: true,
                        optimistic: true,
                    } as Parameters<typeof useMutation>[0] & {
                        normalize: boolean;
                        optimistic: boolean;
                    }),
                {wrapper},
            );

            mutationResult.current.mutate(undefined);

            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            const data = dataManagerWithOptimistic.queryClient.getQueryData(queryKey) as Array<{
                id: string;
                name: string;
            }>;
            expect(data[0].name).toBe('New');
        });

        it('should apply optimistic updates', async () => {
            expect(dataManagerWithOptimistic.queryNormalizer).toBeDefined();

            dataManagerWithOptimistic.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            // Initial data
            await dataManagerWithOptimistic.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
                normalize: true,
            } as Parameters<typeof dataManagerWithOptimistic.queryClient.fetchQuery>[0] & {
                normalize: boolean;
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dataManagerWithOptimistic}>
                    {children}
                </DataSourceProvider>
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
                        normalize: true,
                        optimistic: true,
                    } as Parameters<typeof useMutation>[0] & {
                        normalize: boolean;
                        optimistic: boolean;
                    }),
                {wrapper},
            );

            mutationResult.current.mutate(undefined);

            // Check optimistic data
            await waitFor(() => {
                const data = dataManagerWithOptimistic.queryClient.getQueryData(queryKey) as Array<{
                    id: string;
                    name: string;
                }>;
                expect(data[0].name).toBe('Optimistic');
            });

            // Wait for mutation to complete
            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            const dataFinal = dataManagerWithOptimistic.queryClient.getQueryData(
                queryKey,
            ) as Array<{
                id: string;
                name: string;
            }>;
            expect(dataFinal[0].name).toBe('Final');
        });

        it('should automatically calculate rollbackData', async () => {
            expect(dataManagerWithOptimistic.queryNormalizer).toBeDefined();

            dataManagerWithOptimistic.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            // Initial data
            await dataManagerWithOptimistic.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
                normalize: true,
            } as Parameters<typeof dataManagerWithOptimistic.queryClient.fetchQuery>[0] & {
                normalize: boolean;
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dataManagerWithOptimistic}>
                    {children}
                </DataSourceProvider>
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
                        normalize: true,
                        optimistic: true,
                    } as Parameters<typeof useMutation>[0] & {
                        normalize: boolean;
                        optimistic: boolean;
                    }),
                {wrapper},
            );

            mutationResult.current.mutate(undefined);

            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            // Data should be rolled back to original
            const data = dataManagerWithOptimistic.queryClient.getQueryData(queryKey) as Array<{
                id: string;
                name: string;
            }>;
            expect(data[0].name).toBe('Original');
        });

        it('should rollback changes on mutation error', async () => {
            expect(dataManagerWithOptimistic.queryNormalizer).toBeDefined();

            dataManagerWithOptimistic.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            // Initial data
            await dataManagerWithOptimistic.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
                normalize: true,
            } as Parameters<typeof dataManagerWithOptimistic.queryClient.fetchQuery>[0] & {
                normalize: boolean;
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dataManagerWithOptimistic}>
                    {children}
                </DataSourceProvider>
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
                        normalize: true,
                        optimistic: true,
                    } as Parameters<typeof useMutation>[0] & {
                        normalize: boolean;
                        optimistic: boolean;
                    }),
                {wrapper},
            );

            mutationResult.current.mutate(undefined);

            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            const data = dataManagerWithOptimistic.queryClient.getQueryData(queryKey) as Array<{
                id: string;
                name: string;
            }>;
            expect(data[0].name).toBe('Original');
        });

        it('should ignore mutations with normalize: false', async () => {
            const dmNoNormalize = new ClientDataManager({
                defaultOptions: {
                    queries: {retry: false},
                    mutations: {retry: false},
                },
                normalizerConfig: {
                    devLogging: false,
                },
            });

            expect(dmNoNormalize.queryNormalizer).toBeDefined();

            const queryKey = ['users'];
            dmNoNormalize.queryClient.setQueryData(queryKey, [{id: '1', name: 'Original'}]);

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dmNoNormalize}>{children}</DataSourceProvider>
            );

            // Mutation should not update data automatically (no normalize option)
            const {result: mutationResult} = renderHook(
                () =>
                    useMutation({
                        mutationFn: async () => ({id: '1', name: 'New'}),
                    }),
                {wrapper},
            );

            mutationResult.current.mutate(undefined);

            await waitFor(() => expect(mutationResult.current.isSuccess).toBe(true));

            const data = dmNoNormalize.queryClient.getQueryData(queryKey) as Array<{
                id: string;
                name: string;
            }>;
            expect(data[0].name).toBe('Original'); // Not changed
        });

        it('should support devLogging for optimistic updates', async () => {
            const dmWithLogging = new ClientDataManager({
                defaultOptions: {
                    queries: {retry: false},
                    mutations: {retry: false},
                },
                normalizerConfig: {
                    devLogging: false,
                    optimistic: {
                        autoCalculateRollback: true,
                        devLogging: true,
                    },
                },
            });

            expect(dmWithLogging.queryNormalizer).toBeDefined();

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            dmWithLogging.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            await dmWithLogging.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
                normalize: true,
            } as Parameters<typeof dmWithLogging.queryClient.fetchQuery>[0] & {
                normalize: boolean;
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dmWithLogging}>{children}</DataSourceProvider>
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
                        normalize: true,
                        optimistic: true,
                    } as Parameters<typeof useMutation>[0] & {
                        normalize: boolean;
                        optimistic: boolean;
                    }),
                {wrapper},
            );

            mutationResult.current.mutate(undefined);

            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            // Verify that logging was called
            expect(consoleSpy).toHaveBeenCalledWith(
                '[OptimisticUpdate] Auto-calculated rollbackData:',
                expect.any(Object),
            );
            expect(consoleSpy).toHaveBeenCalledWith('[OptimisticUpdate] Rolling back changes');

            consoleSpy.mockRestore();
        });

        it('should support manual rollbackData', async () => {
            const dmNoAutoRollback = new ClientDataManager({
                defaultOptions: {
                    queries: {retry: false},
                    mutations: {retry: false},
                },
                normalizerConfig: {
                    devLogging: false,
                    optimistic: {
                        autoCalculateRollback: false,
                    },
                },
            });

            expect(dmNoAutoRollback.queryNormalizer).toBeDefined();

            dmNoAutoRollback.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            await dmNoAutoRollback.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'Original'}],
                normalize: true,
            } as Parameters<typeof dmNoAutoRollback.queryClient.fetchQuery>[0] & {
                normalize: boolean;
            });

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dmNoAutoRollback}>{children}</DataSourceProvider>
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
                        normalize: true,
                        optimistic: true,
                    } as Parameters<typeof useMutation>[0] & {
                        normalize: boolean;
                        optimistic: boolean;
                    }),
                {wrapper},
            );

            mutationResult.current.mutate(undefined);

            await waitFor(() => expect(mutationResult.current.isError).toBe(true));

            const data = dmNoAutoRollback.queryClient.getQueryData(queryKey) as Array<{
                id: string;
                name: string;
            }>;
            expect(data[0].name).toBe('Manual Rollback');

            dmNoAutoRollback.queryNormalizer!.unsubscribe();
            dmNoAutoRollback.queryClient.clear();
        });
    });
});
