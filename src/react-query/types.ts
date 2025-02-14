import type {DefaultError, InfiniteData, Query, QueryClient, QueryKey} from '@tanstack/react-query';

import type {AnyInfiniteQueryDataSource} from './impl/infinite/types';
import type {AnyPlainQueryDataSource} from './impl/plain/types';

export interface QueryDataSourceContext {
    queryClient: QueryClient;
}

export type AnyQueryDataSource = AnyPlainQueryDataSource | AnyInfiniteQueryDataSource;

export type RefetchIntervalFunction<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> = (
    query:
        | Query<TQueryFnData, TError, TQueryData, TQueryKey>
        | Query<TQueryFnData, TError, InfiniteData<TQueryData, TPageParam>, TQueryKey>,
    count: number,
) => number | false | undefined;

export type RefetchInterval<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> =
    | number
    | false
    | RefetchIntervalFunction<TQueryFnData, TError, TQueryData, TQueryKey, TPageParam>;

export interface ProgressiveRefetchInterval {
    minInterval: number;
    maxInterval: number;
}

export interface QueryDataExtendedOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TQueryData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
    TPageParam = never,
> {
    refetchInterval?: RefetchInterval<TQueryFnData, TError, TQueryData, TQueryKey, TPageParam>;
}
