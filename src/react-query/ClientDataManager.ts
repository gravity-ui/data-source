import type {Data} from '@normy/core';
import {createNormalizer} from '@normy/core';
import type {InvalidateQueryFilters, QueryClientConfig, QueryKey} from '@tanstack/react-query';
import {QueryClient} from '@tanstack/react-query';

import {
    type AnyDataSource,
    type DataManager,
    type DataSourceParams,
    type DataSourceTag,
    type Normalizer,
    type NormalizerClientConfig,
    type NormalizerConfig,
    composeFullKey,
    hasTag,
} from '../core';
import type {InvalidateOptions, InvalidateRepeatOptions} from '../core/types/DataManagerOptions';

export type ClientDataManagerConfig = QueryClientConfig;

export class ClientDataManager implements DataManager {
    readonly queryClient: QueryClient;
    readonly normalizer?: Normalizer | undefined;

    constructor(config: ClientDataManagerConfig = {}, normalizerConfig?: NormalizerClientConfig) {
        this.queryClient = new QueryClient({
            ...config,
            defaultOptions: {
                ...config.defaultOptions,
                queries: {
                    networkMode: 'always',
                    ...config.defaultOptions?.queries,
                },
                mutations: {
                    networkMode: 'always',
                    ...config.defaultOptions?.mutations,
                },
            },
        });

        this.normalizer = this.initializeNormalize(normalizerConfig);
    }

    optimisticUpdate(mutationData: Data) {
        if (!this.normalizer) {
            return;
        }

        const queriesToUpdate = this.normalizer.getQueriesToUpdate(mutationData);

        queriesToUpdate.forEach((query) => {
            const queryKey = JSON.parse(query.queryKey) as QueryKey;
            const cachedQuery = this.queryClient.getQueryCache().find({queryKey});

            const dataUpdatedAt = cachedQuery?.state.dataUpdatedAt;
            const isInvalidated = cachedQuery?.state.isInvalidated;
            const error = cachedQuery?.state.error;
            const status = cachedQuery?.state.status;

            this.queryClient.setQueryData(queryKey, () => query.data, {
                updatedAt: dataUpdatedAt,
            });

            cachedQuery?.setState({isInvalidated, error, status});
        });
    }

    automaticInvalidate(data: Data): void {
        if (!this.normalizer) {
            return;
        }

        const queriesToUpdate = this.normalizer.getQueriesToUpdate(data);

        queriesToUpdate.forEach((query) => {
            const queryKey = JSON.parse(query.queryKey) as QueryKey;
            this.queryClient.invalidateQueries({queryKey});
            this.normalizer?.removeQuery(query.queryKey);
        });
    }

    invalidateTag(tag: DataSourceTag, invalidateOptions?: InvalidateOptions) {
        return this.invalidateQueries(
            {
                predicate: ({queryKey}) => hasTag(queryKey, tag),
            },
            invalidateOptions,
        );
    }

    invalidateTags(tags: DataSourceTag[], invalidateOptions?: InvalidateOptions) {
        return this.invalidateQueries(
            {
                predicate: ({queryKey}) => tags.every((tag) => hasTag(queryKey, tag)),
            },
            invalidateOptions,
        );
    }

    invalidateSource<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        invalidateOptions?: InvalidateOptions,
    ) {
        return this.invalidateQueries(
            {
                // First element is a data source name
                queryKey: [dataSource.name],
            },
            invalidateOptions,
        );
    }

    resetSource<TDataSource extends AnyDataSource>(dataSource: TDataSource) {
        return this.queryClient.resetQueries({
            // First element is a data source name
            queryKey: [dataSource.name],
        });
    }

    invalidateParams<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
        invalidateOptions?: InvalidateOptions,
    ) {
        return this.invalidateQueries(
            {
                queryKey: composeFullKey(dataSource, params),
                exact: true,
            },
            invalidateOptions,
        );
    }

    resetParams<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
    ) {
        return this.queryClient.resetQueries({
            queryKey: composeFullKey(dataSource, params),
            exact: true,
        });
    }

    invalidateSourceTags<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        params: DataSourceParams<TDataSource>,
        invalidateOptions?: InvalidateOptions,
    ) {
        return this.invalidateQueries(
            {
                // Last element is a full key
                queryKey: composeFullKey(dataSource, params).slice(0, -1),
            },
            invalidateOptions,
        );
    }

    protected invalidateQueries(
        filters: InvalidateQueryFilters,
        invalidateOptions?: InvalidateOptions,
    ) {
        const invalidate = () => this.queryClient.invalidateQueries(filters);

        this.repeatInvalidate(invalidate, invalidateOptions?.repeat);

        return invalidate();
    }

    protected repeatInvalidate(invalidate: () => Promise<void>, repeat?: InvalidateRepeatOptions) {
        if (!repeat) {
            return;
        }

        for (let i = 1; i <= repeat.count; i++) {
            setTimeout(invalidate, repeat.interval * i);
        }
    }

    private initializeNormalize(config?: NormalizerClientConfig): Normalizer | undefined {
        if (config === false || config === undefined) {
            return undefined;
        }

        if (config === true) {
            return this.createNormalize({});
        }

        return this.createNormalize(config);
    }

    private createNormalize(config: NormalizerConfig): Normalizer {
        const normalizer = createNormalizer(config.normalizerConfig, config.initialNormalizedData);

        return {
            getNormalizedData: () => normalizer.getNormalizedData(),
            clearNormalizedData: () => normalizer.clearNormalizedData(),
            setQuery: (queryKey: string, queryData: Data) =>
                normalizer.setQuery(queryKey, queryData),
            removeQuery: (queryKey: string) => normalizer.removeQuery(queryKey),
            getQueriesToUpdate: (mutationData: Data) => normalizer.getQueriesToUpdate(mutationData),
            getObjectById: <T extends Data>(id: string, exampleObject?: T) =>
                normalizer.getObjectById(id, exampleObject),
            getQueryFragment: <T extends Data>(fragment: Data, exampleObject?: T) =>
                normalizer.getQueryFragment(fragment, exampleObject),
            getDependentQueries: (mutationData: Data) =>
                normalizer.getDependentQueries(mutationData),
            getDependentQueriesByIds: (ids: ReadonlyArray<string>) =>
                normalizer.getDependentQueriesByIds(ids),
            getCurrentData: <T extends Data>(newData: T) => normalizer.getCurrentData(newData),
            log: (...messages: unknown[]) => normalizer.log(...messages),
        };
    }
}
