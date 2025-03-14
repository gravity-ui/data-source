import type {InvalidateQueryFilters, QueryClientConfig} from '@tanstack/react-query';
import {QueryClient} from '@tanstack/react-query';

import {
    type AnyDataSource,
    type DataManager,
    type DataSourceParams,
    type DataSourceTag,
    composeFullKey,
    hasTag,
} from '../core';
import type {InvalidateOptions, InvalidateRepeatOptions} from '../core/types/DataManagerOptions';

export type ClientDataManagerConfig = QueryClientConfig;

export class ClientDataManager implements DataManager {
    readonly queryClient: QueryClient;

    constructor(conifg: ClientDataManagerConfig = {}) {
        this.queryClient = new QueryClient({
            ...conifg,
            defaultOptions: {
                ...conifg.defaultOptions,
                queries: {
                    networkMode: 'always',
                    ...conifg.defaultOptions?.queries,
                },
                mutations: {
                    networkMode: 'always',
                    ...conifg.defaultOptions?.mutations,
                },
            },
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
}
