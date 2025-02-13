import type {
    DefaultError,
    Query,
    QueryClient,
    QueryKey,
    QueryObserverOptions as QueryObserverOptionsBase,
} from '@tanstack/react-query';

import type {DataSourceOptions} from '../core';

import type {AnyInfiniteQueryDataSource} from './impl/infinite/types';
import type {AnyPlainQueryDataSource} from './impl/plain/types';

export interface QueryDataSourceContext {
    queryClient: QueryClient;
}

export type AnyQueryDataSource = AnyPlainQueryDataSource | AnyInfiniteQueryDataSource;

export type FunctionRefetchInterval = (query: Query, count: number) => number | false | undefined;

export type RefetchInterval = number | false | FunctionRefetchInterval;

export type ProgressiveRefetchInterval = {
    minInterval: number;
    maxInterval: number;
    count?: number;
};

export type QueryDataOptions<TDataSource extends AnyQueryDataSource> = Omit<
    DataSourceOptions<TDataSource>,
    'refetchInterval'
> & {
    refetchInterval?: RefetchInterval;
};

export interface QueryObserverOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> extends Omit<
        QueryObserverOptionsBase<TQueryFnData, TError, TData, TQueryData, TQueryKey, TPageParam>,
        'refetchInterval'
    > {
    refetchInterval?: RefetchInterval;
}
