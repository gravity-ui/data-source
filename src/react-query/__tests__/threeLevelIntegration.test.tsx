import React from 'react';

import type {QueryClient} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';

import {ClientDataManager} from '../ClientDataManager';
import {DataSourceProvider} from '../DataSourceProvider';
import {useQueryData} from '../hooks/useQueryData';
import {makePlainQueryDataSource} from '../impl/plain/factory';

describe('Normalization Configuration Integration', () => {
    let queryClient: QueryClient;
    let dataManager: ClientDataManager;

    beforeEach(() => {
        dataManager = new ClientDataManager({
            normalizerConfig: {
                devLogging: false,
            },
        });
        queryClient = dataManager.queryClient;
    });

    afterEach(() => {
        dataManager.queryNormalizer?.unsubscribe();
        queryClient.clear();
    });

    describe('ClientDataManager configuration', () => {
        it('should use custom getNormalizationObjectKey from config', async () => {
            const customGetKey = jest.fn((obj) => `custom:${obj.id}`);

            const customDataManager = new ClientDataManager({
                normalizerConfig: {
                    getNormalizationObjectKey: customGetKey,
                    devLogging: false,
                },
            });

            customDataManager.queryNormalizer!.subscribe();

            const queryKey = ['users'];

            await customDataManager.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'User 1'}],
                normalize: true,
            } as Parameters<typeof customDataManager.queryClient.fetchQuery>[0] & {
                normalize: boolean;
            });

            const normalized = customDataManager.queryNormalizer!.getNormalizedData();

            expect(normalized.objects['@@custom:1']).toBeDefined();
            expect(customGetKey).toHaveBeenCalled();

            customDataManager.queryNormalizer!.unsubscribe();
            customDataManager.queryClient.clear();
        });

        it('should use custom getArrayType from config', async () => {
            const customGetArrayType = jest.fn(({arrayKey}) => `custom:${arrayKey}`);

            const customDataManager = new ClientDataManager({
                normalizerConfig: {
                    getArrayType: customGetArrayType,
                    devLogging: false,
                },
            });

            customDataManager.queryNormalizer!.subscribe();

            const queryKey = ['items'];

            await customDataManager.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => ({
                    items: [{id: '1', name: 'Item 1'}],
                }),
                normalize: true,
            } as Parameters<typeof customDataManager.queryClient.fetchQuery>[0] & {
                normalize: boolean;
            });

            expect(customGetArrayType).toHaveBeenCalled();

            customDataManager.queryNormalizer!.unsubscribe();
            customDataManager.queryClient.clear();
        });
    });

    describe('Query-level normalization control', () => {
        it('should normalize when query has normalize: true', async () => {
            dataManager.queryNormalizer!.subscribe();

            const queryKey = ['users-normalized'];

            await dataManager.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '1', name: 'User 1'}],
                normalize: true,
            } as Parameters<typeof dataManager.queryClient.fetchQuery>[0] & {normalize: boolean});

            const normalized = dataManager.queryNormalizer!.getNormalizedData();

            // Data SHOULD be normalized
            expect(normalized.objects['@@1']).toBeDefined();
        });

        it('should NOT normalize when query has normalize: false', async () => {
            dataManager.queryNormalizer!.subscribe();

            const queryKey = ['users-not-normalized'];

            await dataManager.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '2', name: 'User 2'}],
                normalize: false,
            } as Parameters<typeof dataManager.queryClient.fetchQuery>[0] & {normalize: boolean});

            const normalized = dataManager.queryNormalizer!.getNormalizedData();

            // Data should NOT be normalized
            expect(normalized.objects['@@2']).toBeUndefined();
        });

        it('should normalize by default when normalize option is not provided', async () => {
            dataManager.queryNormalizer!.subscribe();

            const queryKey = ['users-default'];

            await dataManager.queryClient.fetchQuery({
                queryKey,
                queryFn: async () => [{id: '3', name: 'User 3'}],
            });

            const normalized = dataManager.queryNormalizer!.getNormalizedData();

            // Data SHOULD be normalized (default behavior is now true)
            expect(normalized.objects['@@3']).toBeDefined();
        });
    });

    describe('DataSourceProvider integration', () => {
        it('should auto-subscribe queryNormalizer on mount', async () => {
            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dataManager}>{children}</DataSourceProvider>
            );

            const dataSource = makePlainQueryDataSource({
                name: 'users',
                fetch: async () => [{id: '1', name: 'User 1'}],
                options: {
                    normalize: true,
                },
            });

            const {result} = renderHook(() => useQueryData(dataSource, {}), {wrapper});

            await waitFor(() => expect(result.current.status).toBe('success'));

            const normalized = dataManager.queryNormalizer!.getNormalizedData();

            // Data should be normalized because DataSourceProvider subscribes automatically
            expect(normalized.objects['@@1']).toBeDefined();
        });

        it('should work with multiple queries', async () => {
            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider dataManager={dataManager}>{children}</DataSourceProvider>
            );

            const dataSource1 = makePlainQueryDataSource({
                name: 'users',
                fetch: async () => [{id: '1', name: 'User 1'}],
                options: {
                    normalize: true,
                },
            });

            const dataSource2 = makePlainQueryDataSource({
                name: 'posts',
                fetch: async () => [{id: '2', title: 'Post 1'}],
                options: {
                    normalize: true,
                },
            });

            const {result: result1} = renderHook(() => useQueryData(dataSource1, {}), {wrapper});
            const {result: result2} = renderHook(() => useQueryData(dataSource2, {}), {wrapper});

            await waitFor(() => {
                expect(result1.current.status).toBe('success');
                expect(result2.current.status).toBe('success');
            });

            const normalized = dataManager.queryNormalizer!.getNormalizedData();

            expect(normalized.objects['@@1']).toBeDefined();
            expect(normalized.objects['@@2']).toBeDefined();
        });
    });

    describe('Optimistic updates configuration', () => {
        it('should enable optimistic updates when configured', async () => {
            const dmWithOptimistic = new ClientDataManager({
                normalizerConfig: {
                    devLogging: false,
                    optimistic: true,
                },
            });

            expect(dmWithOptimistic.queryNormalizer).toBeDefined();

            dmWithOptimistic.queryNormalizer!.subscribe();

            const queryKey = ['users'];
            const initialData = [{id: '1', name: 'Old'}];

            dmWithOptimistic.queryClient.setQueryData(queryKey, initialData);
            dmWithOptimistic.normalizer!.setQuery(JSON.stringify(queryKey), initialData);

            // Manual optimistic update via setNormalizedData
            dmWithOptimistic.queryNormalizer!.setNormalizedData({id: '1', name: 'New'});

            const data = dmWithOptimistic.queryClient.getQueryData(queryKey) as Array<{
                id: string;
                name: string;
            }>;
            expect(data[0].name).toBe('New');

            dmWithOptimistic.queryNormalizer!.unsubscribe();
            dmWithOptimistic.queryClient.clear();
        });

        it('should work with optimistic config object', async () => {
            const dmWithOptimisticConfig = new ClientDataManager({
                normalizerConfig: {
                    devLogging: false,
                    optimistic: {
                        autoCalculateRollback: true,
                        devLogging: false,
                    },
                },
            });

            expect(dmWithOptimisticConfig.queryNormalizer).toBeDefined();
            expect(dmWithOptimisticConfig.normalizer).toBeDefined();

            dmWithOptimisticConfig.queryClient.clear();
        });
    });

    describe('Invalidate configuration', () => {
        it('should support invalidate option in global config', async () => {
            const dmWithInvalidate = new ClientDataManager({
                normalizerConfig: {
                    devLogging: false,
                    invalidate: true,
                },
            });

            expect(dmWithInvalidate.queryNormalizer).toBeDefined();
            expect(dmWithInvalidate.normalizer).toBeDefined();

            dmWithInvalidate.queryClient.clear();
        });

        it('should support both optimistic and invalidate options', async () => {
            const dmWithBoth = new ClientDataManager({
                normalizerConfig: {
                    devLogging: false,
                    optimistic: true,
                    invalidate: true,
                },
            });

            expect(dmWithBoth.queryNormalizer).toBeDefined();
            expect(dmWithBoth.normalizer).toBeDefined();

            dmWithBoth.queryClient.clear();
        });
    });
});
