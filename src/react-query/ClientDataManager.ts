import type {QueryClientConfig} from '@tanstack/react-query';
import {QueryClient} from '@tanstack/react-query';

import {
    type AnyDataSource,
    type DataManager,
    type DataSourceParams,
    type DataSourceTag,
    composeFullKey,
    hasTag,
} from '../core';

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

    invalidateTag(tag: DataSourceTag) {
        return this.queryClient.invalidateQueries({
            predicate: ({queryKey}) => hasTag(queryKey, tag),
        });
    }

    invalidateTags(tags: DataSourceTag[]) {
        return this.queryClient.invalidateQueries({
            predicate: ({queryKey}) => tags.every((tag) => hasTag(queryKey, tag)),
        });
    }

    invalidateSource<TDataSource extends AnyDataSource>(dataSource: TDataSource) {
        return this.queryClient.invalidateQueries({
            // First element is a data source name
            queryKey: [dataSource.name],
        });
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
    ) {
        return this.queryClient.invalidateQueries({
            queryKey: composeFullKey(dataSource, params),
            exact: true,
        });
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
    ) {
        return this.queryClient.invalidateQueries({
            // Last element is a full key
            queryKey: composeFullKey(dataSource, params).slice(0, -1),
        });
    }
}
