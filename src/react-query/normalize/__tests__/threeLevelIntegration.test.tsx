import React from 'react';

import type {QueryClient} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';

import {ClientDataManager} from '../../ClientDataManager';
import {DataSourceProvider} from '../../DataSourceProvider';
import {useQueryData} from '../../hooks/useQueryData';
import {makePlainQueryDataSource} from '../../impl/plain/factory';
import {useQueryNormalizer} from '../QueryNormalizerProvider';

describe('Three-Level Configuration Integration', () => {
    let queryClient: QueryClient;
    let dataManager: ClientDataManager;

    beforeEach(() => {
        dataManager = new ClientDataManager({}, true);
        queryClient = dataManager.queryClient;
    });

    afterEach(() => {
        queryClient.clear();
    });

    describe('Level 1: Provider (global)', () => {
        it('should use global configuration from Provider', async () => {
            const globalGetKey = jest.fn((obj) => `global:${obj.id}`);

            // Create dataManager with custom normalizer config
            const customDataManager = new ClientDataManager(
                {},
                {
                    normalizerConfig: {
                        getNormalizationObjectKey: globalGetKey,
                    },
                },
            );

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider
                    dataManager={customDataManager}
                    normalizerConfig={{
                        normalize: true,
                    }}
                >
                    {children}
                </DataSourceProvider>
            );

            const dataSource = makePlainQueryDataSource({
                name: 'users',
                fetch: async () => [{id: '1', name: 'User 1'}],
            });

            const {result: normalizerResult} = renderHook(() => useQueryNormalizer(), {wrapper});

            const {result: queryResult} = renderHook(() => useQueryData(dataSource, {}), {wrapper});

            await waitFor(() => expect(queryResult.current.status).toBe('success'));

            const normalized = normalizerResult.current.getNormalizedData();

            expect(normalized.objects['@@global:1']).toBeDefined();
            expect(globalGetKey).toHaveBeenCalled();
        });

        it('global getArrayType should work', async () => {
            const globalGetArrayType = jest.fn(({arrayKey}) => `global:${arrayKey}`);

            // Create dataManager with custom normalizer config
            const customDataManager = new ClientDataManager(
                {},
                {
                    normalizerConfig: {
                        getArrayType: globalGetArrayType,
                    },
                },
            );

            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider
                    dataManager={customDataManager}
                    normalizerConfig={{
                        normalize: true,
                    }}
                >
                    {children}
                </DataSourceProvider>
            );

            const dataSource = makePlainQueryDataSource({
                name: 'items',
                fetch: async () => ({
                    items: [{id: '1', name: 'Item 1'}],
                }),
            });

            const {result} = renderHook(() => useQueryData(dataSource, {}), {wrapper});

            await waitFor(() => expect(result.current.status).toBe('success'));

            // Global function should be called
            expect(globalGetArrayType).toHaveBeenCalled();
        });
    });

    describe('Enable/disable normalization at different levels', () => {
        it('Hook can disable normalization even if enabled globally', async () => {
            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider
                    dataManager={dataManager}
                    normalizerConfig={{
                        normalize: true, // Enabled globally
                    }}
                >
                    {children}
                </DataSourceProvider>
            );

            const dataSource = makePlainQueryDataSource({
                name: 'users',
                fetch: async () => [{id: '1', name: 'User 1'}],
            });

            const {result: normalizerResult} = renderHook(() => useQueryNormalizer(), {wrapper});

            const {result: queryResult} = renderHook(
                () =>
                    useQueryData(
                        dataSource,
                        {},
                        {
                            normalizationConfig: {
                                normalize: false, // Disable for this query
                            },
                        },
                    ),
                {wrapper},
            );

            await waitFor(() => expect(queryResult.current.status).toBe('success'));

            const normalized = normalizerResult.current.getNormalizedData();

            // Data should NOT be normalized
            expect(Object.keys(normalized.objects)).toHaveLength(0);
        });

        it('DataSource can enable normalization if disabled globally', async () => {
            const wrapper = ({children}: {children: React.ReactNode}) => (
                <DataSourceProvider
                    dataManager={dataManager}
                    normalizerConfig={{
                        normalize: false, // Disabled globally
                    }}
                >
                    {children}
                </DataSourceProvider>
            );

            const dataSource = makePlainQueryDataSource({
                name: 'users',
                fetch: async () => [{id: '1', name: 'User 1'}],
                options: {
                    normalizationConfig: {
                        normalize: true, // Enable for this DataSource
                    },
                },
            });

            const {result: normalizerResult} = renderHook(() => useQueryNormalizer(), {wrapper});

            const {result: queryResult} = renderHook(() => useQueryData(dataSource, {}), {wrapper});

            await waitFor(() => expect(queryResult.current.status).toBe('success'));

            const normalized = normalizerResult.current.getNormalizedData();

            // Data SHOULD be normalized
            expect(normalized.objects['@@1']).toBeDefined();
        });
    });
});
