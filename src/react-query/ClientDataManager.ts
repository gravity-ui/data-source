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
    type NormalizerConfig,
    composeFullKey,
    hasTag,
} from '../core';
import type {InvalidateOptions, InvalidateRepeatOptions} from '../core/types/DataManagerOptions';

import type {QueryNormalizer} from './types/normalizer';
import {checkMutationObjectsKeys} from './utils/checkMutationObjectsKeys';
import {createQueryNormalizer} from './utils/normalize';
import {parseQueryKey} from './utils/parseQueryKey';

export interface ClientDataManagerConfig extends QueryClientConfig {
    normalizerConfig?: NormalizerConfig | boolean;
}

export class ClientDataManager implements DataManager {
    readonly queryClient: QueryClient;
    readonly normalizer?: Normalizer | undefined;
    readonly queryNormalizer?: QueryNormalizer | undefined;
    readonly normalizerConfig?: NormalizerConfig | boolean;

    constructor(config: ClientDataManagerConfig = {}) {
        this.normalizerConfig = config.normalizerConfig;

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

        this.normalizer = this.createNormalize(config.normalizerConfig);
        this.queryNormalizer = createQueryNormalizer(
            this.normalizer,
            this.queryClient,
            config.normalizerConfig,
            (data) => this.optimisticUpdate(data),
            (data) => this.invalidateData(data),
        );
    }

    optimisticUpdate(mutationData: Data, queryKey?: QueryKey, queryData?: Data) {
        if (!this.normalizer) {
            return;
        }

        if (queryKey && queryData) {
            this.optimisticUpdateQuery(queryKey, queryData);

            return;
        }

        const queriesToUpdate = this.normalizer.getQueriesToUpdate(mutationData);

        queriesToUpdate.forEach((query) => {
            const parsedQueryKey = parseQueryKey(query.queryKey);

            this.optimisticUpdateQuery(parsedQueryKey, query.data);
        });
    }

    invalidateData(data: Data, queryKey?: QueryKey): void {
        if (!this.normalizer) {
            return;
        }

        if (queryKey) {
            this.invalidateQuery(queryKey);

            return;
        }

        const queriesToUpdate = this.normalizer.getQueriesToUpdate(data);

        queriesToUpdate.forEach((query) => {
            const parsedQueryKey = parseQueryKey(query.queryKey);

            this.invalidateQuery(parsedQueryKey);
        });
    }

    update(data: Data) {
        if (!this.normalizer) {
            return;
        }

        const {optimistic: globalOptimistic, invalidate: globalInvalidate} =
            typeof this.normalizerConfig === 'object'
                ? this.normalizerConfig
                : {optimistic: false, invalidate: false};

        const queriesToUpdate = this.normalizer.getQueriesToUpdate(data);

        if (queriesToUpdate.length === 0) {
            const completeness = checkMutationObjectsKeys(data, this.normalizer);
            const dependentQueries = this.normalizer.getDependentQueries(data);

            if (completeness.needsRefetch) {
                dependentQueries.forEach((queryKeyString) => {
                    const parsedQueryKey = parseQueryKey(queryKeyString);

                    const cachedQuery = this.queryClient
                        .getQueryCache()
                        .find({queryKey: parsedQueryKey});

                    const {invalidate} = cachedQuery?.meta ?? {};

                    if (
                        invalidate === true ||
                        (invalidate === undefined && globalInvalidate === true)
                    ) {
                        this.invalidateData(data, parsedQueryKey);
                    }
                });
            }

            return;
        }

        queriesToUpdate.forEach((query) => {
            const parsedQueryKey = parseQueryKey(query.queryKey);

            const cachedQuery = this.queryClient.getQueryCache().find({queryKey: parsedQueryKey});

            const {optimistic, invalidate} = cachedQuery?.meta ?? {};

            if (optimistic === true || (optimistic === undefined && globalOptimistic === true)) {
                this.optimisticUpdate(data, parsedQueryKey, query.data);
            }

            if (invalidate === true || (invalidate === undefined && globalInvalidate === true)) {
                this.invalidateData(data, parsedQueryKey);
            }
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

    private createNormalize(
        config: boolean | NormalizerConfig | undefined,
    ): Normalizer | undefined {
        if (!config) {
            return undefined;
        }

        if (config === true) {
            return createNormalizer({});
        }

        return createNormalizer(config);
    }

    private invalidateQuery(queryKey: QueryKey) {
        const cachedQuery = this.queryClient.getQueryCache().find({queryKey});

        if (
            cachedQuery?.state.fetchStatus !== 'fetching' &&
            cachedQuery?.state.status === 'success' &&
            !cachedQuery?.state.isInvalidated
        ) {
            this.queryClient.invalidateQueries({queryKey});
        }
    }

    private optimisticUpdateQuery(queryKey: QueryKey, queryData: Data) {
        const cachedQuery = this.queryClient.getQueryCache().find({queryKey});

        const dataUpdatedAt = cachedQuery?.state.dataUpdatedAt;
        const isInvalidated = cachedQuery?.state.isInvalidated;
        const error = cachedQuery?.state.error;
        const status = cachedQuery?.state.status;

        this.queryClient.setQueryData(queryKey, () => queryData, {
            updatedAt: dataUpdatedAt,
        });

        cachedQuery?.setState({isInvalidated, error, status});
    }
}
