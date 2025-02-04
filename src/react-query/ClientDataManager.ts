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
import type {InvalidateDataOptions, RepeatOptions, RepeatProp} from '../core/types/DataManger';

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

    invalidateTag(tag: DataSourceTag, invalidateOptions?: InvalidateDataOptions) {
        return this.invalidateQueries(
            {
                predicate: ({queryKey}) => hasTag(queryKey, tag),
            },
            invalidateOptions,
        );
    }

    invalidateTags(tags: DataSourceTag[], invalidateOptions?: InvalidateDataOptions) {
        return this.invalidateQueries(
            {
                predicate: ({queryKey}) => tags.every((tag) => hasTag(queryKey, tag)),
            },
            invalidateOptions,
        );
    }

    invalidateSource<TDataSource extends AnyDataSource>(
        dataSource: TDataSource,
        invalidateOptions?: InvalidateDataOptions,
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
        invalidateOptions?: InvalidateDataOptions,
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
        invalidateOptions?: InvalidateDataOptions,
    ) {
        return this.invalidateQueries(
            {
                // Last element is a full key
                queryKey: composeFullKey(dataSource, params).slice(0, -1),
            },
            invalidateOptions,
        );
    }

    private invalidateQueries(
        filters?: InvalidateQueryFilters,
        invalidateOptions?: InvalidateDataOptions,
    ) {
        const {repeat, ...options} = invalidateOptions || {};

        const invalidate = () => this.queryClient.invalidateQueries(filters, options);

        this.repeatInvalidate(invalidate, repeat);

        return invalidate();
    }

    private repeatInvalidate(invalidate: () => Promise<void>, repeat?: RepeatProp) {
        if (!repeat) {
            return;
        }

        if (typeof repeat === 'function') {
            repeat(invalidate);
        } else {
            this.defaultRepeat(invalidate, repeat);
        }
    }

    private defaultRepeat(callback: () => Promise<void>, options: RepeatOptions) {
        const {repeatInterval, count = 2} = options;

        for (let i = 1; i <= count; i++) {
            setTimeout(callback, repeatInterval * i);
        }
    }
}
